// my-front/src/api-client/ordersAdapter.ts

// Интерфейсы для более точной типизации
export interface Operation {
  opNumber: number;
  opTime: number;
  opAxes: string;
  assignedMachine?: string;
  startDate?: string;
  endDate?: string;
}

export interface Order {
  id: number;
  machineName?: string;
  blueprintNumber: string;
  startDate?: string;
  deadline: string;
  quantity: number;
  willMeetDeadline: boolean;
  completedQuantity?: number;
  remainingQuantity: number;
  priority: number;
  status: string;
  operations?: Operation[];
  pdfPath?: string;
  drawingUrl?: string;
  previewUrl?: string;
  estimatedCompletion?: string;
  estimatedWorkdays?: number;
  timeMargin?: number;
  materialType?: string;
}

// Адаптация данных с API (snake_case) для фронтенда (camelCase)
export const adaptOrderFromApi = (orderData: any): Order => {
  if (!orderData) return null as any;

  // Создаем базовую структуру заказа
  const order: Order = {
    id: orderData.id,
    machineName: orderData.machine_name,
    blueprintNumber: orderData.blueprint_number || '',
    startDate: orderData.start_date,
    deadline: orderData.deadline || new Date().toISOString(),
    quantity: orderData.quantity || 0,
    willMeetDeadline: orderData.will_meet_deadline !== undefined ? 
                      orderData.will_meet_deadline : true,
    completedQuantity: orderData.completed_quantity || 0,
    remainingQuantity: orderData.remaining_quantity || orderData.quantity || 0,
    priority: orderData.priority || 1,
    status: orderData.status || 'новый',
    pdfPath: orderData.pdf_path,
    drawingUrl: orderData.drawing_url,
    previewUrl: orderData.preview_url,
    estimatedCompletion: orderData.estimated_completion,
    estimatedWorkdays: orderData.estimated_workdays,
    timeMargin: orderData.time_margin,
    materialType: orderData.material_type
  };

  // Обрабатываем операции, если они есть
  if (orderData.operations && Array.isArray(orderData.operations)) {
    order.operations = orderData.operations.map((op: any) => ({
      opNumber: op.op_number,
      opTime: op.op_time,
      opAxes: op.op_axes,
      assignedMachine: op.assigned_machine,
      startDate: op.start_date,
      endDate: op.end_date
    }));
  } else {
    order.operations = [];
  }

  return order;
};

// Адаптация данных с фронтенда (camelCase) для API (snake_case)
export const adaptOrderForApi = (orderData: any): any => {
  const adaptedOrder: any = {
    id: orderData.id,
    machine_name: orderData.machineName,
    blueprint_number: orderData.blueprintNumber,
    start_date: orderData.startDate,
    deadline: orderData.deadline,
    quantity: Number(orderData.quantity),
    will_meet_deadline: orderData.willMeetDeadline,
    completed_quantity: orderData.completedQuantity || 0,
    remaining_quantity: orderData.remainingQuantity || orderData.quantity,
    priority: orderData.priority || 0,
    status: orderData.status || 'новый',
    pdf_path: orderData.pdfPath,
    drawing_url: orderData.drawingUrl,
    preview_url: orderData.previewUrl,
    estimated_completion: orderData.estimatedCompletion,
    estimated_workdays: orderData.estimatedWorkdays,
    time_margin: orderData.timeMargin,
    material_type: orderData.materialType
  };

  // Обрабатываем операции для API
  if (orderData.operations && Array.isArray(orderData.operations)) {
    adaptedOrder.operations = orderData.operations.map((op: any) => ({
      op_number: op.opNumber,
      op_time: op.opTime,
      op_axes: op.opAxes,
      assigned_machine: op.assignedMachine,
      start_date: op.startDate,
      end_date: op.endDate
    }));
  }

  return adaptedOrder;
};