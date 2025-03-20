export interface OrderResponse {
    id: number;
    machineName: string;
    blueprintNumber: string;
    startDate: string;
    deadline: string;
    quantity: number;
    drawingUrl: string;
    opNumber?: number;
    opAxes?: string;
    opTime?: number;
    status: string;
}
