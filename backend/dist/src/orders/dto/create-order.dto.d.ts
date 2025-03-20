export declare class OperationDto {
    op_number: number;
    op_time: number;
    op_axes: string;
    assigned_machine?: string;
    start_date?: string;
    end_date?: string;
}
export declare class CreateOrderDto {
    machine_name?: string;
    blueprint_number: string;
    start_date?: string;
    deadline: string;
    quantity: number;
    pdf_path?: string;
    drawing_url: string;
    preview_url?: string;
    estimated_completion?: string;
    estimated_workdays?: number;
    will_meet_deadline: boolean;
    time_margin: number;
    completed_quantity: number;
    remaining_quantity: number;
    priority: number;
    material_type?: string;
    status: string;
    operations?: OperationDto[];
}
