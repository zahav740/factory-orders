import { OrderOperation } from './order-operation.entity';
export declare class Order {
    id: number;
    machine_name?: string;
    blueprint_number: string;
    start_date: Date;
    deadline: Date;
    quantity: number;
    pdf_path?: string;
    drawing_url?: string;
    preview_url?: string;
    estimated_completion?: Date;
    estimated_workdays?: number;
    will_meet_deadline: boolean;
    time_margin: number;
    completed_quantity: number;
    remaining_quantity: number;
    priority: number;
    material_type?: string;
    status: string;
    operations: OrderOperation[];
}
