import { Order } from './order.entity';
export declare class OrderOperation {
    id: number;
    op_number: number;
    op_time: number;
    op_axes: string;
    assigned_machine?: string;
    start_date?: Date;
    end_date?: Date;
    order: Order;
}
