import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderOperation } from './entities/order-operation.entity';
import { CreateOrderDto, OperationDto } from './dto/create-order.dto';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly operationRepository;
    constructor(orderRepository: Repository<Order>, operationRepository: Repository<OrderOperation>);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: number): Promise<Order>;
    update(id: number, updateData: Partial<Order>, operations?: OperationDto[]): Promise<Order>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
