// src/utils/calendarUtils.ts
import { addDays, differenceInDays } from 'date-fns';

// Рабочий день в минутах (16 часов)
export const WORKING_DAY_MINUTES = 960;

// Рабочий полдень в минутах (5 часов - до 13:00)
export const WORKING_HALF_DAY_MINUTES = 300;

// Время наладки в минутах (8 часов)
export const SETUP_TIME_MINUTES = 480;

// Интерфейс для информации о празднике
export interface HolidayInfo {
  date: Date;
  isEve?: boolean;
  isFullDay?: boolean;
  isHalfDay?: boolean;
}

// Массив праздников Израиля на 2025 год
export const ISRAEL_HOLIDAYS_2025: HolidayInfo[] = [
  // Формат: начало праздника (вечер), полный день праздника, конец праздника (до 13:00)
  { date: new Date("2025-01-13"), isEve: true, isHalfDay: true },
  { date: new Date("2025-01-14"), isFullDay: true },
  { date: new Date("2025-01-15"), isEve: true, isHalfDay: true },
  
  { date: new Date("2025-03-14"), isEve: true, isHalfDay: true },
  { date: new Date("2025-03-15"), isFullDay: true },
  { date: new Date("2025-03-16"), isEve: true, isHalfDay: true },
  
  { date: new Date("2025-04-12"), isEve: true, isHalfDay: true },
  { date: new Date("2025-04-13"), isFullDay: true },
  { date: new Date("2025-04-14"), isFullDay: true },
  { date: new Date("2025-04-15"), isFullDay: true },
  { date: new Date("2025-04-16"), isFullDay: true },
  { date: new Date("2025-04-17"), isFullDay: true },
  { date: new Date("2025-04-18"), isFullDay: true },
  { date: new Date("2025-04-19"), isFullDay: true },
  { date: new Date("2025-04-20"), isFullDay: true },
  { date: new Date("2025-04-21"), isEve: true, isHalfDay: true },
  
  // Другие праздники...
  { date: new Date("2025-05-02"), isEve: true, isHalfDay: true },
  { date: new Date("2025-05-03"), isFullDay: true },
  { date: new Date("2025-05-04"), isEve: true, isHalfDay: true }
];

/**
 * Проверяет, является ли день выходным в Израиле (пятница или суббота)
 * @param date Проверяемая дата
 * @returns true, если день является выходным
 */
export const isWeekendIsrael = (date: Date): boolean => {
  const day = date.getDay();
  return day === 5 || day === 6; // 5 - пятница, 6 - суббота
};

/**
 * Проверяет, является ли день праздником в Израиле
 * @param date Проверяемая дата
 * @returns Информация о празднике или null, если это не праздник
 */
export const getHolidayStatusIsrael = (date: Date): HolidayInfo | null => {
  return ISRAEL_HOLIDAYS_2025.find(holiday =>
    holiday.date.getDate() === date.getDate() &&
    holiday.date.getMonth() === date.getMonth() &&
    holiday.date.getFullYear() === date.getFullYear()
  ) || null;
};

/**
 * Проверяет, является ли день полурабочим (до 13:00) в Израиле
 * @param date Проверяемая дата
 * @returns true, если день является полурабочим
 */
export const isHalfWorkingDayIsrael = (date: Date): boolean => {
  const holidayStatus = getHolidayStatusIsrael(date);
  return holidayStatus !== null && holidayStatus.isHalfDay === true;
};

/**
 * Проверяет, является ли день полностью нерабочим
 * @param date Проверяемая дата
 * @returns true, если день полностью нерабочий
 */
export const isNonWorkingDayIsrael = (date: Date): boolean => {
  // Выходные (пятница или суббота)
  if (isWeekendIsrael(date)) return true;
  
  // Полный праздничный день
  const holidayStatus = getHolidayStatusIsrael(date);
  if (holidayStatus && holidayStatus.isFullDay) return true;
  
  return false;
};

/**
 * Получает количество доступных рабочих часов в день
 * @param date Проверяемая дата
 * @returns Количество рабочих часов в день
 */
export const getAvailableHoursInDay = (date: Date): number => {
  // Обычный рабочий день - 16 часов (960 минут)
  const regularWorkingHours = WORKING_DAY_MINUTES / 60;
  
  // Если это выходной, возвращаем 0
  if (isWeekendIsrael(date)) return 0;
  
  // Проверяем, праздник ли это
  const holidayStatus = getHolidayStatusIsrael(date);
  
  if (!holidayStatus) {
    // Обычный рабочий день
    return regularWorkingHours;
  }
  
  if (holidayStatus.isFullDay) {
    // Полный праздничный день - не работаем
    return 0;
  }
  
  if (holidayStatus.isHalfDay) {
    // Полдня (до 13:00) - работаем 5 часов
    return WORKING_HALF_DAY_MINUTES / 60;
  }
  
  // На всякий случай, если тип праздника не определен
  return 0;
};

/**
 * Рассчитывает количество рабочих дней между двумя датами
 * @param startDate Начальная дата
 * @param endDate Конечная дата
 * @returns Количество рабочих дней
 */
export const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  if (startDate > endDate) return 0;
  
  let workingDays = 0;
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Если день не является выходным или полным праздником
    if (!isNonWorkingDayIsrael(currentDate)) {
      // Если день полурабочий, считаем его за 0.5
      if (isHalfWorkingDayIsrael(currentDate)) {
        workingDays += 0.5;
      } else {
        // Полный рабочий день
        workingDays += 1;
      }
    }
    
    // Переходим к следующему дню
    currentDate = addDays(currentDate, 1);
  }
  
  return workingDays;
};

/**
 * Добавляет указанное количество рабочих дней к дате
 * @param date Начальная дата
 * @param days Количество рабочих дней для добавления
 * @returns Новая дата
 */
export const addWorkingDays = (date: Date, days: number): Date => {
  if (days <= 0) return new Date(date);
  
  let result = new Date(date);
  let remainingDays = days;
  
  // Если текущий день полурабочий и мы добавляем целые дни,
  // начинаем со следующего дня и вычитаем половину дня
  if (isHalfWorkingDayIsrael(result) && !isNonWorkingDayIsrael(result)) {
    result = addDays(result, 1);
    remainingDays -= 0.5;
  }
  
  while (remainingDays > 0) {
    result = addDays(result, 1);
    
    // Полный рабочий день
    if (!isNonWorkingDayIsrael(result) && !isHalfWorkingDayIsrael(result)) {
      remainingDays -= 1;
    }
    // Полурабочий день
    else if (isHalfWorkingDayIsrael(result)) {
      remainingDays -= 0.5;
    }
    // Иначе - выходной или праздник, не вычитаем дни
  }
  
  return result;
};

/**
 * Расчет количества рабочих дней для выполнения операции
 * @param operationTime Время операции в минутах
 * @param quantity Количество деталей
 * @returns Количество требуемых рабочих дней
 */
export const calculateRequiredWorkDays = (operationTime: number, quantity: number): number => {
  // Общее время операции в минутах с учетом количества деталей
  const totalOperationTime = operationTime * quantity;
  
  // Добавляем время наладки
  const totalTimeWithSetup = totalOperationTime + SETUP_TIME_MINUTES;
  
  // Расчет количества дней (округляем вверх)
  return Math.ceil(totalTimeWithSetup / WORKING_DAY_MINUTES);
};