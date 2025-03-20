import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderOperation } from './entities/order-operation.entity';
import { CreateOrderDto, OperationDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderOperation)
    private readonly operationRepository: Repository<OrderOperation>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { operations, ...orderData } = createOrderDto;
    
    // Важное изменение: Если start_date не указан, используем текущую дату
    const newOrder = this.orderRepository.create({
      ...orderData,
      start_date: orderData.start_date ? new Date(orderData.start_date) : new Date(),
      deadline: new Date(orderData.deadline),
    });
    
    const savedOrder = await this.orderRepository.save(newOrder);

    if (operations?.length) {
      const ops = operations.map((op) =>
        this.operationRepository.create({
          op_number: op.op_number,
          op_time: op.op_time,
          op_axes: op.op_axes,
          assigned_machine: op.assigned_machine,
          start_date: op.start_date ? new Date(op.start_date) : undefined,
          end_date: op.end_date ? new Date(op.end_date) : undefined,
          order: savedOrder,
        }),
      );
      await this.operationRepository.save(ops);
    }

    return this.findOne(savedOrder.id);
  }

  async findAll() {
    return this.orderRepository.find({ relations: ['operations'] });
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['operations'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: number, updateData: Partial<Order>, operations?: OperationDto[]) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    // Фильтруем поля, которые можно обновить
    const allowedFields = [
      'machine_name', 'blueprint_number', 'start_date', 'deadline',
      'quantity', 'pdf_path', 'drawing_url', 'preview_url',
      'estimated_completion', 'estimated_workdays', 'will_meet_deadline',
      'time_margin', 'completed_quantity', 'remaining_quantity',
      'priority', 'material_type', 'status'
    ];
    
    const sanitizedUpdate: any = {};
    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdate[key] = updateData[key];
      } else {
        console.log(`Поле '${key}' не допустимо для обновления и будет проигнорировано`);
      }
    }
    
    // Преобразуем даты
    if (sanitizedUpdate.start_date) {
      sanitizedUpdate.start_date = new Date(sanitizedUpdate.start_date);
    }
    if (sanitizedUpdate.deadline) {
      sanitizedUpdate.deadline = new Date(sanitizedUpdate.deadline);
    }
    if (sanitizedUpdate.estimated_completion) {
      sanitizedUpdate.estimated_completion = new Date(sanitizedUpdate.estimated_completion);
    }

    // Обновляем заказ
    await this.orderRepository.update(id, sanitizedUpdate);

    // Обновляем операции, если они предоставлены
    if (operations && operations.length >= 0) {
      // Удаляем существующие операции
      await this.operationRepository.delete({ order: { id } });
      
      // Создаем новые операции
      if (operations.length > 0) {
        const operationsToSave = operations.map(op => 
          this.operationRepository.create({
            op_number: op.op_number,
            op_time: op.op_time,
            op_axes: op.op_axes,
            assigned_machine: op.assigned_machine,
            start_date: op.start_date ? new Date(op.start_date) : undefined,
            end_date: op.end_date ? new Date(op.end_date) : undefined,
            order: { id }
          })
        );
        await this.operationRepository.save(operationsToSave);
      }
    }

    // Возвращаем обновленный заказ со всеми связями
    return this.findOne(id);
  }
  
  async remove(id: number) {
    await this.operationRepository.delete({ order: { id } });
    await this.orderRepository.delete(id);
    return { message: 'Order and operations deleted' };
  }
}