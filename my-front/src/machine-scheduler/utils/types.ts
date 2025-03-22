// src/machine-scheduler/utils/types.ts
export interface OrderOperation {
  orderId: number;
  orderNumber: string;
  operationNumber: number;
  quantity: number;
  startDate: Date;
  endDate: Date;
  machineName: string;
  machineId: number;
  deadline: string;
  opTime: number;
  opAxes: string;
}

export interface CalendarItem {
  date: Date;
  isWeekend: boolean;
  isHoliday: boolean;
  isHalfDay: boolean;
  operations: OrderOperation[];
}

export interface MachineSchedule {
  machineId: number;
  machineName: string;
  calendar: CalendarItem[];
}
