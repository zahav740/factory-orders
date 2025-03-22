// src/machine-scheduler/utils/calendarHelpers.ts
import { eachDayOfInterval } from 'date-fns';
import { CalendarItem, OrderOperation } from './types';
import { isWeekendIsrael, getHolidayStatusIsrael } from '../../utils/utils';
import { format } from 'date-fns';


// Используйте переменную окружения для Google API key, если потребуется
const GOOGLE_CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;

export const createMachineSchedules = (
  machines: any[],
  orders: any[],
  startDate: Date,
  endDate: Date,
  selectedMachine: string
): any[] => {
  let filteredMachines = machines;
  if (selectedMachine !== 'Все Станки') {
    filteredMachines = machines.filter(machine => machine.name === selectedMachine);
  }
  
  // Преобразуем операции из заказов
  const allOperations: OrderOperation[] = [];
  orders.forEach((order: any) => {
    if (order.operations && order.operations.length > 0) {
      order.operations.forEach((op: any) => {
        if (op.assignedMachine && op.startDate && op.endDate) {
          const machineObj = machines.find((m: any) => m.name === op.assignedMachine);
          allOperations.push({
            orderId: order.id,
            orderNumber: order.blueprintNumber,
            operationNumber: op.opNumber,
            quantity: order.quantity,
            startDate: new Date(op.startDate),
            endDate: new Date(op.endDate),
            machineName: op.assignedMachine,
            machineId: machineObj ? machineObj.id : 0,
            deadline: order.deadline,
            opTime: op.opTime,
            opAxes: op.opAxes
          });
        }
      });
    }
  });

  const schedules = filteredMachines.map(machine => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const calendar: CalendarItem[] = days.map(day => {
      const isWeekendDay = isWeekendIsrael(day);
      const holidayStatus = getHolidayStatusIsrael(day);
      // Обязательно приводим к boolean
      const isHolidayDay = holidayStatus?.isFullDay || false;
      const isHalfDay = holidayStatus?.isHalfDay || false;
      const dayOperations = allOperations.filter(op => {
         const isRelevantMachine = op.machineName === machine.name;
         const inRange = day >= op.startDate && day <= op.endDate;
         return isRelevantMachine && inRange;
      });
      return {
         date: day,
         isWeekend: isWeekendDay,
         isHoliday: isHolidayDay,
         isHalfDay,
         operations: dayOperations
      };
    });
    return {
      machineId: machine.id,
      machineName: machine.name,
      calendar
    };
  });

  if (selectedMachine === 'Все Станки') {
    // Объединяем календари всех станков
    const mergedCalendar = mergeCalendars(schedules.map(s => s.calendar));
    return [{
      machineId: 0,
      machineName: 'Все Станки',
      calendar: mergedCalendar
    }];
  }
  
  return schedules;
};

const mergeCalendars = (calendars: CalendarItem[][]): CalendarItem[] => {
  if (!calendars.length) return [];
  return calendars[0].map((day, idx) => ({
    ...day,
    operations: calendars.reduce((acc, cal) => acc.concat(cal[idx].operations), [] as OrderOperation[])
  }));
};

export const groupCalendarByMonths = (calendar: CalendarItem[]): Record<string, CalendarItem[]> => {
  return calendar.reduce((acc: Record<string, CalendarItem[]>, item) => {
    const monthKey = format(item.date, 'yyyy-MM');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(item);
    return acc;
  }, {});
};
