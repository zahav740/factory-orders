// src/schedule-calculator/services/ScheduleService.ts
import { format, addDays, setHours } from 'date-fns';
import { 
  isNonWorkingDayIsrael,
  isHalfWorkingDayIsrael,
  getAvailableHoursInDay,
  WORKING_HALF_DAY_MINUTES,
  SETUP_TIME_MINUTES,
  addWorkingHours as utilsAddWorkingHours
} from '../../utils/utils';

// Интерфейсы для типизации
interface Operation {
  opNumber: number;
  opTime: number;
  opAxes: string;
  machineId?: number;
  assignedMachine?: string;
  blueprintNumber?: string;
  orderId?: number;
  deadline?: Date;
  quantity?: number;
  startDate?: Date;
  endDate?: Date;
  isInitiallyPlanned?: boolean;
}

interface Order {
  id: number;
  blueprintNumber: string;
  quantity: number;
  deadline: string | Date;
  priority: number;
  status: string;
  operations: Operation[];
  newDeadline?: string;
}

interface Machine {
  id: number;
  name: string;
  releaseDate: string | Date;
  types: string[];
}

interface MachineSchedule {
  machineId: number;
  machineName: string;
  releaseDate: Date;
  operations: Operation[];
}

/**
 * Добавляет рабочие часы к дате, учитывая рабочие графики
 * @param startDate Начальная дата
 * @param hoursToAdd Количество часов для добавления
 * @returns Новая дата
 */
const addWorkingHours = (startDate: Date, hoursToAdd: number): Date => {
  // Используем функцию addWorkingHours из utils
  return utilsAddWorkingHours(startDate, hoursToAdd);
};

/**
 * Проверяет, может ли станок выполнить данный тип операции
 * @param machine Станок
 * @param operation Операция
 * @returns true, если станок может выполнить операцию
 */
const canMachinePerformOperation = (machine: Machine, operation: Operation): boolean => {
  if (!operation.opAxes) return false;
  
  // Сопоставляем типы осей операции с возможностями станка
  return machine.types.some(type => operation.opAxes.includes(type));
};

/**
 * Расчет реального времени выполнения операции в часах с учетом наладки
 * @param operation Операция
 * @returns Время выполнения в часах
 */
const calculateOperationHours = (operation: Operation): number => {
  if (!operation.quantity || !operation.opTime) {
    return 0;
  }
  
  // opTime предполагается в минутах на единицу продукции
  const totalMinutes = operation.opTime * operation.quantity;
  
  // Добавляем время наладки
  const totalMinutesWithSetup = totalMinutes + SETUP_TIME_MINUTES;
  
  // Преобразование минут в часы
  return totalMinutesWithSetup / 60;
};

/**
 * Расчет оптимального расписания работы станков на основе заказов с учетом
 * праздников, выходных дней и особенностей работы завода
 * @param orders - Список заказов с операциями
 * @param machines - Список доступных станков
 * @param currentDate - Текущая дата для начала расчета
 * @returns Расписание для каждого станка с распределенными операциями
 */
export const calculateSchedule = (
  orders: Order[], 
  machines: Machine[], 
  currentDate: Date
): MachineSchedule[] => {
  console.log(`Начало расчета расписания на ${format(currentDate, 'yyyy-MM-dd')}`);
  
  // Корректируем начальную дату, если она приходится на выходной или праздник
  let calculationStartDate = new Date(currentDate);
  
  // Если начальная дата - выходной или полный праздник, переходим к следующему рабочему дню
  while (isNonWorkingDayIsrael(calculationStartDate)) {
    calculationStartDate = addDays(calculationStartDate, 1);
  }
  
  // Устанавливаем начало рабочего дня (8:00)
  calculationStartDate = setHours(calculationStartDate, 8);
  calculationStartDate.setMinutes(0, 0, 0);
  
  console.log(`Скорректированная дата начала расчета: ${format(calculationStartDate, 'yyyy-MM-dd HH:mm')}`);
  
  // Инициализируем расписание для каждого станка
  const schedule: MachineSchedule[] = machines.map(machine => ({
    machineId: machine.id,
    machineName: machine.name,
    releaseDate: new Date(Math.max(
      new Date(machine.releaseDate).getTime(),
      calculationStartDate.getTime()
    )),
    operations: []
  }));
  
  // Сначала сортируем заказы по приоритету и сроку
  const sortedOrders = [...orders].sort((a, b) => {
    // Сначала по приоритету (больший приоритет первый)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    
    // Затем по сроку (меньший срок первый)
    const aDeadline = new Date(a.deadline);
    const bDeadline = new Date(b.deadline);
    return aDeadline.getTime() - bDeadline.getTime();
  });
  
  console.log(`Отсортировано ${sortedOrders.length} заказов по приоритету и сроку`);
  
  // Обработка заказов по одному, размещение всех операций заказа последовательно
  for (const order of sortedOrders) {
    console.log(`Обработка заказа ${order.blueprintNumber} (ID: ${order.id})`);
    
    if (!order.operations || order.operations.length === 0) {
      console.log(`Заказ ${order.id} не содержит операций, пропускаем`);
      continue;
    }
    
    // Сортируем операции по номеру (последовательность выполнения)
    const orderOperations = [...order.operations].sort((a, b) => a.opNumber - b.opNumber);
    
    // Дата, до которой должны завершить все операции заказа
    const orderDeadline = new Date(order.deadline);
    console.log(`Срок заказа: ${format(orderDeadline, 'yyyy-MM-dd')}`);
    
    // Отслеживаем последнюю дату окончания для проверки срока
    let latestEndDate = new Date(0);
    
    // Обрабатываем операции заказа последовательно
    for (const operation of orderOperations) {
      // Расширяем операцию информацией из заказа
      const enrichedOperation = {
        ...operation,
        blueprintNumber: order.blueprintNumber,
        orderId: order.id,
        deadline: orderDeadline,
        quantity: order.quantity
      };
      
      // Находим подходящие станки для операции
      const suitableMachines = machines.filter(machine => 
        canMachinePerformOperation(machine, operation)
      );
      
      if (suitableMachines.length === 0) {
        console.warn(`Не найдено подходящих станков для операции ${operation.opNumber} заказа ${order.blueprintNumber}`);
        continue;
      }
      
      // Рассчитываем время операции в часах
      const operationHours = calculateOperationHours(enrichedOperation);
      
      if (operationHours <= 0) {
        console.warn(`Некорректное время для операции ${operation.opNumber} заказа ${order.blueprintNumber}`);
        continue;
      }
      
      // Находим станок, на котором операция будет выполнена оптимально
      let bestMachine = suitableMachines[0];
      let bestStartDate = new Date(Math.max(
        calculationStartDate.getTime(),
        schedule.find(s => s.machineId === bestMachine.id)?.releaseDate.getTime() || 0
      ));
      
      // Если это не первая операция заказа, учитываем зависимость от предыдущей
      if (latestEndDate.getTime() > 0) {
        // Операция может начаться только после завершения предыдущей
        bestStartDate = new Date(Math.max(bestStartDate.getTime(), latestEndDate.getTime()));
      }
      
      // Если начальная дата - выходной или полный праздник, переходим к следующему рабочему дню
      while (isNonWorkingDayIsrael(bestStartDate)) {
        bestStartDate = addDays(bestStartDate, 1);
        bestStartDate = setHours(bestStartDate, 8);
        bestStartDate.setMinutes(0, 0, 0);
      }
      
      let bestEndDate = addWorkingHours(bestStartDate, operationHours);
      
      // Поиск оптимального станка (того, который закончит работу раньше всего)
      for (const machine of suitableMachines) {
        const machineSchedule = schedule.find(s => s.machineId === machine.id);
        if (!machineSchedule) continue;
        
        // Определяем дату, когда станок будет доступен
        let machineAvailableDate = new Date(Math.max(
          calculationStartDate.getTime(),
          machineSchedule.releaseDate.getTime()
        ));
        
        // Если это не первая операция заказа, учитываем зависимость
        if (latestEndDate.getTime() > 0) {
          machineAvailableDate = new Date(Math.max(machineAvailableDate.getTime(), latestEndDate.getTime()));
        }
        
        // Если начальная дата - выходной или полный праздник, переходим к следующему рабочему дню
        while (isNonWorkingDayIsrael(machineAvailableDate)) {
          machineAvailableDate = addDays(machineAvailableDate, 1);
          machineAvailableDate = setHours(machineAvailableDate, 8);
          machineAvailableDate.setMinutes(0, 0, 0);
        }
        
        // Рассчитываем ожидаемую дату завершения
        const expectedEndDate = addWorkingHours(machineAvailableDate, operationHours);
        
        // Если этот станок может закончить операцию раньше, выбираем его
        if (expectedEndDate.getTime() < bestEndDate.getTime()) {
          bestMachine = machine;
          bestStartDate = machineAvailableDate;
          bestEndDate = expectedEndDate;
        }
      }
      
      // Добавляем операцию в расписание выбранного станка
      const selectedMachineSchedule = schedule.find(s => s.machineId === bestMachine.id);
      if (selectedMachineSchedule) {
        const scheduledOperation = {
          ...enrichedOperation,
          assignedMachine: bestMachine.name,
          machineId: bestMachine.id,
          startDate: bestStartDate,
          endDate: bestEndDate
        };
        
        selectedMachineSchedule.operations.push(scheduledOperation);
        
        // Обновляем дату освобождения станка
        selectedMachineSchedule.releaseDate = new Date(bestEndDate);
        
        // Обновляем последнюю дату окончания для последовательности операций
        latestEndDate = new Date(bestEndDate);
        
        console.log(`Операция #${operation.opNumber} заказа ${order.blueprintNumber} назначена на станок ${bestMachine.name}. Выполнение: ${format(bestStartDate, 'yyyy-MM-dd HH:mm')} - ${format(bestEndDate, 'yyyy-MM-dd HH:mm')}`);
      }
    }
    
    // Проверяем, укладываемся ли в срок заказа
    if (latestEndDate.getTime() > orderDeadline.getTime()) {
      // Если не укладываемся, устанавливаем новый срок
      order.newDeadline = format(latestEndDate, 'yyyy-MM-dd');
      console.warn(`Заказ ${order.blueprintNumber} не укладывается в срок. Оригинальный срок: ${format(orderDeadline, 'yyyy-MM-dd')}, новый срок: ${order.newDeadline}`);
    }
  }
  
  // Сортируем операции внутри каждого станка по дате начала
  schedule.forEach(machineSchedule => {
    machineSchedule.operations.sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return a.startDate.getTime() - b.startDate.getTime();
    });
  });
  
  console.log('Расчет расписания завершен');
  return schedule;
};

// Экспортируем вспомогательные функции для тестирования
export {
  addWorkingHours,
  calculateOperationHours,
  canMachinePerformOperation
};