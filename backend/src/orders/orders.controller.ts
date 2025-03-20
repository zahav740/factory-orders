import { Controller, Post, Get, Body, Param, Patch, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';


@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.ordersService.findOne(id);
  }
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateData: Partial<CreateOrderDto>) {
    // Создаем объект для обновления заказа без операций
    const { operations, ...orderData } = updateData;
    
    const transformedData: any = {
      ...orderData,
      start_date: orderData.start_date ? new Date(orderData.start_date) : undefined,
      deadline: orderData.deadline ? new Date(orderData.deadline) : undefined,
      estimated_completion: orderData.estimated_completion ? new Date(orderData.estimated_completion) : undefined,
    };
  
    // Передаем операции отдельно в метод сервиса
    return this.ordersService.update(id, transformedData, operations);
  }
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.ordersService.remove(id);
  }
}
