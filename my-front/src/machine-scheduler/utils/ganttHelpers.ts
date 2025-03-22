// src/machine-scheduler/utils/ganttHelpers.ts
import { format, eachDayOfInterval, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { OrderOperation } from './types';
import { isWeekendIsrael, getHolidayStatusIsrael } from '../../utils/utils';

/**
 * Группирует операции по станкам
 */
export const groupOperationsByMachine = (operationSchedules: OrderOperation[]): { [key: string]: OrderOperation[] } => {
  const operationsByMachine: { [key: string]: OrderOperation[] } = {};
  
  operationSchedules.forEach(op => {
    if (!operationsByMachine[op.machineName]) {
      operationsByMachine[op.machineName] = [];
    }
    operationsByMachine[op.machineName].push(op);
  });
  
  return operationsByMachine;
};

/**
 * Создает данные для шкалы месяцев
 */
export const createMonthsScale = (startDate: Date, endDate: Date) => {
  return Object.entries(
    eachDayOfInterval({ start: startDate, end: endDate }).reduce((acc: {[key: string]: number}, date) => {
      const month = format(date, 'yyyy-MM');
      if (!acc[month]) acc[month] = 0;
      acc[month]++;
      return acc;
    }, {})
  ).map(([month, days]) => {
    const monthDate = new Date(month);
    return {
      month,
      monthName: format(monthDate, 'LLLL', { locale: ru }),
      days,
      width: days * 8
    };
  });
};

/**
 * Рассчитывает параметры отображения операции на диаграмме Ганта
 */
export const calculateOperationDisplayProps = (
  operation: OrderOperation,
  startDate: Date
) => {
  const deadlineDate = new Date(operation.deadline);
  const isOverdue = operation.endDate > deadlineDate;
  const isCloseToDeadline = differenceInDays(deadlineDate, operation.endDate) <= 7 && !isOverdue;
  
  // Рассчитываем позицию на временной шкале
  const startDayIndex = Math.max(0, Math.floor((operation.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const endDayIndex = Math.floor((operation.endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const durationDays = Math.max(1, endDayIndex - startDayIndex + 1);
  
  // Определяем цвет блока операции
  const backgroundColor = isOverdue 
    ? 'bg-red-700' 
    : isCloseToDeadline 
    ? 'bg-yellow-700' 
    : 'bg-indigo-700';
  
  // Создаем текст подсказки
  const tooltipText = `ID: ${operation.orderId}, Чертеж: ${operation.orderNumber}, Операция #${operation.operationNumber}, Кол-во: ${operation.quantity}, Срок: ${format(deadlineDate, 'dd.MM.yyyy')}`;
  
  return {
    startDayIndex,
    endDayIndex,
    durationDays,
    backgroundColor,
    tooltipText,
    left: `${startDayIndex * 8}px`,
    width: `${durationDays * 8}px`,
    isVisible: !(startDayIndex < 0 && endDayIndex < 0) // Пропускаем операции, которые закончились до диапазона
  };
};

/**
 * Создает данные о нерабочих днях для отображения на диаграмме Ганта
 */
export const createNonWorkingDaysData = (startDate: Date, endDate: Date) => {
  return eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
    const isWeekendDay = isWeekendIsrael(date);
    const holidayStatus = getHolidayStatusIsrael(date);
    const isHolidayDay = !!holidayStatus && holidayStatus.isFullDay === true;
    const isHalfDayWork = !!holidayStatus && holidayStatus.isHalfDay === true;
    const dayIndex = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let className = '';
    if (isHolidayDay) {
      className = 'bg-purple-800 opacity-50';
    } else if (isHalfDayWork) {
      className = 'bg-purple-700 opacity-30';
    } else if (isWeekendDay) {
      className = 'bg-gray-800 opacity-50';
    }
    
    return {
      date,
      dayIndex,
      isNonWorking: isWeekendDay || isHolidayDay || isHalfDayWork,
      className,
      left: `${dayIndex * 8}px`
    };
  }).filter(day => day.isNonWorking);
};