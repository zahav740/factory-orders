import { addDays, differenceInDays, format, setHours } from 'date-fns';
import axios from 'axios';

// Константы для расчетов
export const WORKING_DAY_MINUTES = 960; // 16 часов
export const WORKING_HALF_DAY_MINUTES = 300; // 5 часов (до 13:00)
export const SETUP_TIME_MINUTES = 480; // 8 часов на наладку

// API ключ из env
const GOOGLE_CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;

// ID календарей
const ISRAEL_HOLIDAY_CALENDAR_ID = 'en.jewish#holiday@group.v.calendar.google.com'; // Еврейский календарь праздников
const ISRAEL_CIVIL_CALENDAR_ID = 'en.il#holiday@group.v.calendar.google.com'; // Гражданские праздники Израиля

// Интерфейс для праздничных дней
export interface HolidayInfo {
  date: Date;
  name: string;
  isEve?: boolean; // Канун праздника (до 13:00 рабочий)
  isFullDay?: boolean; // Полный праздничный день (выходной)
  isHalfDay?: boolean; // Полдня (до 13:00 рабочий)
}

// Кэш для хранения загруженных праздников
let holidayCache: HolidayInfo[] = [];
let cacheStartDate: Date | null = null;
let cacheEndDate: Date | null = null;

// Резервный список праздников Израиля на 2025 год (используется при ошибке API)
const ISRAEL_HOLIDAYS_2025: HolidayInfo[] = [
  // Формат: начало праздника (вечер), полный день праздника, конец праздника (до 13:00)
  { date: new Date("2025-01-13"), name: "Канун Ту биШват", isEve: true, isHalfDay: true },
  { date: new Date("2025-01-14"), name: "Ту биШват", isFullDay: true },
  
  { date: new Date("2025-03-14"), name: "Канун Пурима", isEve: true, isHalfDay: true },
  { date: new Date("2025-03-15"), name: "Пурим", isFullDay: true },
  { date: new Date("2025-03-16"), name: "Шушан Пурим", isHalfDay: true },
  
  { date: new Date("2025-04-12"), name: "Канун Песаха", isEve: true, isHalfDay: true },
  { date: new Date("2025-04-13"), name: "Песах I", isFullDay: true },
  { date: new Date("2025-04-14"), name: "Песах II", isFullDay: true },
  { date: new Date("2025-04-15"), name: "Песах III", isFullDay: true },
  { date: new Date("2025-04-16"), name: "Песах IV", isFullDay: true },
  { date: new Date("2025-04-17"), name: "Песах V", isFullDay: true },
  { date: new Date("2025-04-18"), name: "Песах VI", isFullDay: true },
  { date: new Date("2025-04-19"), name: "Песах VII", isFullDay: true },
  { date: new Date("2025-04-20"), name: "Песах VIII", isFullDay: true },
  
  { date: new Date("2025-05-02"), name: "Канун Йом ха-Зикарон", isEve: true, isHalfDay: true },
  { date: new Date("2025-05-03"), name: "Йом ха-Зикарон", isFullDay: true },
  { date: new Date("2025-05-04"), name: "Йом ха-Ацмаут", isFullDay: true }
];

/**
 * Получает праздники Израиля из Google Calendar API
 * @param startDate Начальная дата периода
 * @param endDate Конечная дата периода
 * @returns Список праздников
 */
export const fetchIsraelHolidays = async (startDate: Date, endDate: Date): Promise<HolidayInfo[]> => {
  try {
    // Проверяем кэш
    if (
      cacheStartDate && 
      cacheEndDate && 
      startDate >= cacheStartDate && 
      endDate <= cacheEndDate && 
      holidayCache.length > 0
    ) {
      console.log('Использование кэшированных данных о праздниках');
      return holidayCache;
    }
    
    // Если данных нет в кэше или период не соответствует, загружаем
    console.log('Загрузка данных о праздниках из Google Calendar API');
    
    // Запрашиваем еврейские праздники
    const jewishResponse = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/' + 
      encodeURIComponent(ISRAEL_HOLIDAY_CALENDAR_ID) + 
      '/events', {
        params: {
          key: GOOGLE_CALENDAR_API_KEY,
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          singleEvents: true,
          orderBy: 'startTime'
        }
      }
    );
    
    // Запрашиваем гражданские праздники
    const civilResponse = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/' + 
      encodeURIComponent(ISRAEL_CIVIL_CALENDAR_ID) + 
      '/events', {
        params: {
          key: GOOGLE_CALENDAR_API_KEY,
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          singleEvents: true,
          orderBy: 'startTime'
        }
      }
    );
    
    // Обрабатываем результаты
    const processEvents = (events: any[]): HolidayInfo[] => {
      return events.map(event => {
        const eventDate = new Date(event.start.date || event.start.dateTime);
        const eventName = event.summary;
        
        // Определяем тип праздника
        const isEve = eventName.toLowerCase().includes('erev') || 
                       eventName.toLowerCase().includes('канун');
        
        const isFullDay = !isEve && !!event.start.date; // Полный день, если нет времени и не канун
        
        const isHalfDay = isEve || 
                          (eventDate.getDay() === 4 && isFullDay); // Четверг перед Шаббатом
        
        return {
          date: eventDate,
          name: eventName,
          isEve,
          isFullDay,
          isHalfDay: isHalfDay && !isFullDay // Если полурабочий, но не полный выходной
        };
      });
    };
    
    // Объединяем праздники из обоих календарей
    const jewishHolidays = processEvents(jewishResponse.data.items || []);
    const civilHolidays = processEvents(civilResponse.data.items || []);
    const allHolidays = [...jewishHolidays, ...civilHolidays];
    
    // Удаляем дубликаты (по дате)
    const uniqueHolidays = allHolidays.reduce((acc: HolidayInfo[], holiday) => {
      const existingIndex = acc.findIndex(h => 
        h.date.getDate() === holiday.date.getDate() &&
        h.date.getMonth() === holiday.date.getMonth() &&
        h.date.getFullYear() === holiday.date.getFullYear()
      );
      
      if (existingIndex === -1) {
        acc.push(holiday);
      } else if (!acc[existingIndex].isFullDay && holiday.isFullDay) {
        // Если существующий праздник не полный день, а новый - полный, заменяем
        acc[existingIndex] = holiday;
      }
      
      return acc;
    }, []);
    
    // Обновляем кэш
    holidayCache = uniqueHolidays;
    cacheStartDate = startDate;
    cacheEndDate = endDate;
    
    console.log(`Загружено ${uniqueHolidays.length} праздников`);
    return uniqueHolidays;
    
  } catch (error) {
    console.error('Ошибка при получении праздников из Google Calendar:', error);
    
    // В случае ошибки используем резервный список праздников
    console.warn('Используем резервный список праздников');
    holidayCache = [...ISRAEL_HOLIDAYS_2025];
    cacheStartDate = startDate;
    cacheEndDate = endDate;
    
    return holidayCache;
  }
};

/**
 * Инициализирует кэш праздников
 * @param startDate Начальная дата
 * @param endDate Конечная дата
 */
export const initializeHolidayCache = async (startDate: Date, endDate: Date): Promise<void> => {
  await fetchIsraelHolidays(startDate, endDate);
};

/**
 * Проверяет, является ли день выходным в Израиле (пятница и суббота)
 * @param date Дата для проверки
 * @returns true, если день выходной
 */
export const isWeekendIsrael = (date: Date): boolean => {
  const day = date.getDay();
  return day === 5 || day === 6; // 5 - пятница, 6 - суббота
};

/**
 * Получает информацию о празднике для данной даты
 * @param date Дата для проверки
 * @returns Информация о празднике или null
 */
export const getHolidayStatusIsrael = (date: Date): HolidayInfo | null => {
  return holidayCache.find(holiday =>
    holiday.date.getDate() === date.getDate() &&
    holiday.date.getMonth() === date.getMonth() &&
    holiday.date.getFullYear() === date.getFullYear()
  ) || null;
};

/**
 * Проверяет, является ли день полностью нерабочим
 * @param date Дата для проверки
 * @returns true, если день нерабочий
 */
export const isNonWorkingDayIsrael = (date: Date): boolean => {
  // Проверка выходных дней
  if (isWeekendIsrael(date)) return true;
  
  // Проверка праздников
  const holiday = getHolidayStatusIsrael(date);
  return !!holiday && !!holiday.isFullDay;
};

/**
 * Проверяет, является ли день частично рабочим (до 13:00)
 * @param date Дата для проверки
 * @returns true, если день полурабочий
 */
export const isHalfWorkingDayIsrael = (date: Date): boolean => {
  if (isWeekendIsrael(date)) return false;
  
  const holiday = getHolidayStatusIsrael(date);
  return !!holiday && !!holiday.isHalfDay;
};

/**
 * Получает доступные рабочие часы в день
 * @param date Дата для проверки
 * @returns Количество рабочих часов
 */
export const getAvailableHoursInDay = (date: Date): number => {
  // Если выходной - 0 часов
  if (isWeekendIsrael(date)) return 0;
  
  // Проверяем статус праздника
  const holiday = getHolidayStatusIsrael(date);
  
  if (!holiday) {
    // Обычный рабочий день - 16 часов
    return WORKING_DAY_MINUTES / 60;
  }
  
  if (holiday.isFullDay) {
    // Полный праздничный день - не работаем
    return 0;
  }
  
  if (holiday.isHalfDay) {
    // Полдня (до 13:00) - работаем 5 часов
    return WORKING_HALF_DAY_MINUTES / 60;
  }
  
  // По умолчанию возвращаем полный рабочий день
  return WORKING_DAY_MINUTES / 60;
};

/**
 * Добавляет рабочие часы к дате, учитывая выходные и праздничные дни
 * Исправленная функция для корректного учета полурабочих дней
 * @param startDate Начальная дата
 * @param hoursToAdd Количество часов для добавления
 * @returns Новая дата
 */
export const addWorkingHours = (startDate: Date, hoursToAdd: number): Date => {
  if (hoursToAdd <= 0) return new Date(startDate);
  
  let currentDate = new Date(startDate);
  let remainingHours = hoursToAdd;
  
  // Обработка случая, когда начальная дата - полурабочий день
  if (isHalfWorkingDayIsrael(currentDate)) {
    // Проверяем, сколько часов осталось в текущем полдне
    const currentHour = currentDate.getHours();
    const hoursLeftInHalfDay = currentHour < 13 ? 13 - currentHour : 0;
    
    if (hoursLeftInHalfDay > 0) {
      // Используем оставшиеся часы полурабочего дня
      const hoursUsed = Math.min(remainingHours, hoursLeftInHalfDay);
      remainingHours -= hoursUsed;
      
      if (remainingHours > 0) {
        // Если остались часы, переходим к следующему дню
        currentDate = addDays(currentDate, 1);
        // Устанавливаем начало рабочего дня (8:00)
        currentDate = setHours(currentDate, 8);
        currentDate.setMinutes(0, 0, 0);
      } else {
        // Все часы использованы
        currentDate.setHours(currentDate.getHours() + hoursUsed);
        return currentDate;
      }
    } else {
      // Если текущее время после 13:00, переходим к следующему дню
      currentDate = addDays(currentDate, 1);
      currentDate = setHours(currentDate, 8);
      currentDate.setMinutes(0, 0, 0);
    }
  }
  
  // Пропускаем выходные и праздники
  while (isNonWorkingDayIsrael(currentDate)) {
    currentDate = addDays(currentDate, 1);
    currentDate = setHours(currentDate, 8);
    currentDate.setMinutes(0, 0, 0);
  }
  
  // Продолжаем добавлять рабочие часы
  while (remainingHours > 0) {
    // Получаем доступные часы в текущем дне
    const availableHours = getAvailableHoursInDay(currentDate);
    
    if (availableHours > 0) {
      const hoursToUse = Math.min(remainingHours, availableHours);
      remainingHours -= hoursToUse;
      
      if (remainingHours > 0) {
        // Переходим к следующему дню
        currentDate = addDays(currentDate, 1);
        currentDate = setHours(currentDate, 8);
        currentDate.setMinutes(0, 0, 0);
        
        // Пропускаем выходные и праздники
        while (isNonWorkingDayIsrael(currentDate)) {
          currentDate = addDays(currentDate, 1);
          currentDate = setHours(currentDate, 8);
          currentDate.setMinutes(0, 0, 0);
        }
      } else {
        // Если рабочий день начинается с 8:00, добавляем часы
        const baseHour = isHalfWorkingDayIsrael(currentDate) ? Math.min(currentDate.getHours(), 8) : 8;
        currentDate.setHours(baseHour + hoursToUse);
        return currentDate;
      }
    } else {
      // Переходим к следующему дню
      currentDate = addDays(currentDate, 1);
      currentDate = setHours(currentDate, 8);
      currentDate.setMinutes(0, 0, 0);
    }
  }
  
  return currentDate;
};

/**
 * Добавляет рабочие дни к дате
 * @param date Начальная дата
 * @param days Количество рабочих дней
 * @returns Новая дата
 */
export const addWorkingDays = (date: Date, days: number): Date => {
  if (days <= 0) return new Date(date);
  
  let result = new Date(date);
  let remainingDays = days;
  
  // Если текущий день полурабочий и мы добавляем целые дни,
  // учитываем половину дня
  if (isHalfWorkingDayIsrael(result) && !isNonWorkingDayIsrael(result)) {
    // Если уже после 13:00 (конец полурабочего дня), перейдем к следующему дню
    const currentHour = result.getHours();
    if (currentHour >= 13) {
      result = addDays(result, 1);
    } else {
      // Считаем текущий день за половину
      remainingDays -= 0.5;
    }
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
      
      // Если после вычитания 0.5 дней остается дробная часть,
      // устанавливаем время конца полурабочего дня (13:00)
      if (remainingDays > 0 && remainingDays < 0.5) {
        result.setHours(13, 0, 0, 0);
        remainingDays = 0;
      }
    }
    // Иначе - выходной или праздник, не вычитаем дни
  }
  
  return result;
};

/**
 * Рассчитывает количество рабочих дней между датами
 * @param startDate Начальная дата
 * @param endDate Конечная дата
 * @returns Количество рабочих дней
 */
export const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  if (startDate > endDate) return 0;
  
  let workingDays = 0;
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (!isNonWorkingDayIsrael(currentDate)) {
      // Для полурабочих дней считаем как 0.5 дня
      if (isHalfWorkingDayIsrael(currentDate)) {
        workingDays += 0.5;
      } else {
        workingDays += 1;
      }
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return workingDays;
};

/**
 * Рассчитывает количество дней для выполнения операции
 * @param operationTime Время операции в минутах на единицу
 * @param quantity Количество единиц
 * @returns Количество рабочих дней
 */
export const calculateRequiredWorkDays = (operationTime: number, quantity: number): number => {
  // Общее время операции в минутах
  const totalOperationTime = operationTime * quantity;
  
  // Добавляем время наладки
  const totalTimeWithSetup = totalOperationTime + SETUP_TIME_MINUTES;
  
  // Расчет количества дней (округляем вверх)
  return Math.ceil(totalTimeWithSetup / WORKING_DAY_MINUTES);
};

/**
 * Рассчитывает время окончания операции с учетом рабочего календаря
 * @param startDate Дата начала операции
 * @param operationTime Время операции в минутах
 * @param quantity Количество
 * @returns Дата окончания операции
 */
export const calculateOperationEndDate = (startDate: Date, operationTime: number, quantity: number): Date => {
  // Общее время операции в минутах
  const totalOperationTime = operationTime * quantity;
  
  // Добавляем время наладки
  const totalTimeWithSetup = totalOperationTime + SETUP_TIME_MINUTES;
  
  // Переводим минуты в часы
  const totalHours = totalTimeWithSetup / 60;
  
  // Добавляем рабочие часы с учетом календаря
  return addWorkingHours(startDate, totalHours);
};

/**
 * Проверяет, соответствует ли производственный график дедлайну заказа
 * @param lastOperationEndDate Дата окончания последней операции
 * @param orderDeadline Дедлайн заказа
 * @returns Информация о соответствии дедлайну
 */
export const willMeetDeadline = (
  lastOperationEndDate: Date, 
  orderDeadline: Date
): { willMeet: boolean, marginDays: number } => {
  const diffDays = differenceInDays(orderDeadline, lastOperationEndDate);
  return {
    willMeet: diffDays >= 0,
    marginDays: diffDays
  };
};

/**
 * Фильтрует заказы по поисковому запросу и статусу
 * @param orders Массив заказов
 * @param searchTerm Поисковый запрос
 * @param statusFilter Фильтр по статусу
 * @returns Отфильтрованный массив заказов
 */
export const filterOrders = <T extends { blueprintNumber: string; status: string }>(
  orders: T[],
  searchTerm: string,
  statusFilter: string
): T[] => {
  let result = [...orders];
  if (searchTerm) {
    result = result.filter(order =>
      order.blueprintNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (statusFilter !== 'all') {
    result = result.filter(order => order.status === statusFilter);
  }
  return result;
};

/**
 * Сортирует заказы по приоритету и дедлайну
 * @param orders Массив заказов
 * @param today Текущая дата
 * @returns Отсортированный массив заказов
 */
export const sortOrdersByPriorityAndDeadline = <T extends { priority: number; deadline: string | Date }>(
  orders: T[],
  today: Date = new Date()
): T[] => {
  return [...orders].sort((a, b) => {
    // Сначала сортируем по приоритету (больший приоритет первый)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    
    // Затем сортируем по дедлайну (ближайший дедлайн первый)
    const aDeadline = new Date(a.deadline);
    const bDeadline = new Date(b.deadline);
    
    // Проверяем, просрочен ли заказ
    const aOverdue = aDeadline < today;
    const bOverdue = bDeadline < today;
    
    // Просроченные заказы идут первыми
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    
    // Для непросроченных заказов - сортировка по близости к дедлайну
    return aDeadline.getTime() - bDeadline.getTime();
  });
};

/**
 * Обработчик общих ошибок
 * @param message Сообщение об ошибке
 * @param error Объект ошибки
 */
export const handleError = (message: string, error: unknown): void => {
  console.error(message, error);
};

/**
 * Форматирует дату для отображения
 * @param dateStr Строка с датой
 * @param defaultValue Значение по умолчанию
 * @returns Отформатированная дата
 */
export const formatDateDisplay = (dateStr?: string, defaultValue: string = 'Не указано'): string => {
  if (!dateStr) return defaultValue;
  try {
    return format(new Date(dateStr), 'dd.MM.yyyy');
  } catch (e) {
    return defaultValue;
  }
};