// Обновленный код для CalculationPage.tsx с интеграцией Google Calendar API

import React, { useState, useEffect, useCallback } from 'react';
import { format, addYears } from 'date-fns';
import { Button } from '../../ui-components/components/Button';
import { fetchOrders, fetchMachines, updateOrder } from '../../api-client/ordersApi';
import { calculateSchedule } from '../services/ScheduleService';
import { 
  initializeHolidayCache 
} from '../../utils/utils';

const CalculationPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFirstTimeCalculation, setIsFirstTimeCalculation] = useState(true);
  const [ordersWithNewDeadlines, setOrdersWithNewDeadlines] = useState<any[]>([]);
  const [isCalendarInitialized, setIsCalendarInitialized] = useState(false);

  // Инициализация кэша праздников при загрузке компонента
  useEffect(() => {
    const initializeCalendarData = async () => {
      try {
        setErrorMessage(null);
        
        // Загружаем данные о праздниках на следующие 2 года
        const today = new Date();
        const twoYearsLater = addYears(today, 2);
        
        await initializeHolidayCache(today, twoYearsLater);
        setIsCalendarInitialized(true);
        console.log('Инициализация данных календаря успешно завершена');
      } catch (error) {
        console.error('Ошибка при инициализации данных календаря:', error);
        setErrorMessage('Не удалось загрузить данные календаря. Будет использован резервный список праздников.');
      }
    };
    
    initializeCalendarData();
  }, []);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, machinesData] = await Promise.all([
          fetchOrders(),
          fetchMachines()
        ]);
        
        console.log('Загружено заказов:', ordersData.length);
        console.log('Загружено станков:', machinesData.length);
        
        // Если у заказов уже есть запланированные операции, это не первичное планирование
        const hasPlannedOperations = ordersData.some((order: any) => 
          order.operations && order.operations.some((op: any) => 
            op.isInitiallyPlanned && op.startDate && op.endDate
          )
        );
        
        setIsFirstTimeCalculation(!hasPlannedOperations);
        setOrders(ordersData);
        setMachines(machinesData);
        setErrorMessage(null);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setErrorMessage('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      }
    };
    
    loadData();
  }, []);

  // Обработчик изменения начальной даты
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setStartDate(newDate);
  };

  // Функция для расчета расписания
  const handleCalculate = useCallback(async () => {
    if (!isCalendarInitialized) {
      setErrorMessage('Пожалуйста, дождитесь инициализации данных календаря');
      return;
    }
    
    setIsCalculating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOrdersWithNewDeadlines([]);
    
    try {
      if (orders.length === 0) {
        setErrorMessage('Нет заказов для распределения.');
        setIsCalculating(false);
        return;
      }
      
      if (machines.length === 0) {
        setErrorMessage('Нет доступных станков для распределения.');
        setIsCalculating(false);
        return;
      }
      
      console.log(`Начало расчета расписания с ${format(startDate, 'yyyy-MM-dd')}`);
      console.log(`Режим расчета: ${isFirstTimeCalculation ? 'Первичное планирование' : 'Корректировка'}`);
      
      // Копируем заказы, чтобы не изменить оригинальные объекты
      const ordersCopy = JSON.parse(JSON.stringify(orders));
      
      // Вызываем функцию расчета с использованием обновленного сервиса
      const calculatedSchedule = calculateSchedule(
        ordersCopy, 
        machines, 
        startDate
      );
      
      setSchedule(calculatedSchedule);
      
      // Находим заказы с новыми сроками сдачи
      const ordersWithChangedDeadlines = ordersCopy.filter((order: any) => 
        order.newDeadline && 
        new Date(order.deadline) < new Date(order.newDeadline)
      );
      
      setOrdersWithNewDeadlines(ordersWithChangedDeadlines);
      
      if (ordersWithChangedDeadlines.length > 0) {
        setSuccessMessage(`Расписание рассчитано. ${ordersWithChangedDeadlines.length} заказов не успевают к сроку.`);
      } else {
        setSuccessMessage('Расписание успешно рассчитано. Все заказы успевают к сроку.');
      }
      
    } catch (error) {
      console.error('Ошибка при расчете расписания:', error);
      setErrorMessage('Произошла ошибка при расчете расписания. Проверьте данные и попробуйте снова.');
    } finally {
      setIsCalculating(false);
    }
  }, [orders, machines, startDate, isFirstTimeCalculation, isCalendarInitialized]);

  // Функция для сохранения рассчитанного расписания
  const handleSaveSchedule = useCallback(async () => {
    if (schedule.length === 0) {
      setErrorMessage('Нет рассчитанного расписания для сохранения.');
      return;
    }
    
    try {
      setIsCalculating(true);
      
      // Собираем все операции из расписания по заказам
      const allScheduledOperations: {[orderId: number]: any[]} = {};
      
      schedule.forEach(machineSchedule => {
        machineSchedule.operations.forEach((op: any) => {
          const orderId = op.orderId;
          
          if (!allScheduledOperations[orderId]) {
            allScheduledOperations[orderId] = [];
          }
          
          // Добавляем операцию к заказу
          allScheduledOperations[orderId].push({
            opNumber: op.opNumber,
            opTime: op.opTime,
            opAxes: op.opAxes,
            assignedMachine: op.assignedMachine,
            machineId: op.machineId,
            startDate: format(op.startDate, 'yyyy-MM-dd'),
            endDate: format(op.endDate, 'yyyy-MM-dd'),
            isInitiallyPlanned: true,
            lastModifiedBy: 'system',
            lastModifiedDate: new Date().toISOString()
          });
        });
      });
      
      // Для каждого заказа обновляем его операции
      const orderUpdatePromises = Object.entries(allScheduledOperations).map(
        async ([orderIdStr, operations]) => {
          const orderId = parseInt(orderIdStr);
          const order = orders.find(o => o.id === orderId);
          
          if (order) {
            // Находим самую позднюю дату окончания операции
            const latestEndDate = operations.reduce((latest, op) => {
              const endDate = new Date(op.endDate);
              return endDate > latest ? endDate : latest;
            }, new Date(0));
            
            // Проверяем, укладываемся ли в срок
            const deadline = new Date(order.deadline);
            const willMeetDeadline = latestEndDate <= deadline;
            
            // Создаем обновленный заказ
            const updatedOrder = {
              ...order,
              operations: operations,
              startDate: operations[0]?.startDate || order.startDate,
              estimatedCompletion: format(latestEndDate, 'yyyy-MM-dd'),
              willMeetDeadline: willMeetDeadline,
              status: 'в работе'
            };
            
            // Если есть новый срок, добавляем его
            const matchingOrderWithNewDeadline = ordersWithNewDeadlines.find(o => o.id === orderId);
            if (matchingOrderWithNewDeadline && matchingOrderWithNewDeadline.newDeadline) {
              updatedOrder.newDeadline = matchingOrderWithNewDeadline.newDeadline;
            }
            
            // Обновляем заказ через API
            return updateOrder(updatedOrder);
          }
          
          return Promise.resolve();
        }
      );
      
      // Ждем завершения всех обновлений
      await Promise.all(orderUpdatePromises);
      
      setSuccessMessage('Расписание успешно сохранено. Заказы обновлены.');
      
      // Обновляем состояние первичного планирования
      setIsFirstTimeCalculation(false);
      
    } catch (error) {
      console.error('Ошибка при сохранении расписания:', error);
      setErrorMessage('Произошла ошибка при сохранении расписания.');
    } finally {
      setIsCalculating(false);
    }
  }, [schedule, orders, ordersWithNewDeadlines]);

  // Функция для отображения информации о загрузке станка
  const calculateMachineLoad = useCallback((machineSchedule: any) => {
    if (!machineSchedule.operations.length) return 0;
    
    // Рассчитываем общее время работы станка (в часах)
    const totalWorkHours = machineSchedule.operations.reduce((total: number, op: any) => {
      const startDate = new Date(op.startDate);
      const endDate = new Date(op.endDate);
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return total + diffHours;
    }, 0);
    
    // Рассчитываем период планирования (в рабочих днях)
    const earliestStart = machineSchedule.operations.reduce(
      (earliest: Date, op: any) => {
        const startDate = new Date(op.startDate);
        return startDate < earliest ? startDate : earliest;
      },
      new Date(machineSchedule.operations[0].startDate)
    );
    
    const latestEnd = machineSchedule.operations.reduce(
      (latest: Date, op: any) => {
        const endDate = new Date(op.endDate);
        return endDate > latest ? endDate : latest;
      },
      new Date(machineSchedule.operations[0].endDate)
    );
    
    // Примерно 16 рабочих часов в день
    const totalDays = Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24));
    const maxWorkHours = totalDays * 16;
    
    // Возвращаем загрузку в процентах (с округлением до целого числа)
    return Math.round((totalWorkHours / maxWorkHours) * 100);
  }, []);

  // Рендеринг таблицы заказов с новыми сроками
  const renderOrdersWithNewDeadlines = () => {
    if (ordersWithNewDeadlines.length === 0) return null;
    
    return (
      <div className="bg-yellow-800 bg-opacity-25 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-yellow-300 mb-3">Заказы, не успевающие к сроку:</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-700 rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">№ Заказа</th>
                <th className="px-4 py-2 text-left">Чертеж</th>
                <th className="px-4 py-2 text-left">Текущий срок</th>
                <th className="px-4 py-2 text-left">Реальный срок</th>
                <th className="px-4 py-2 text-left">Задержка (дни)</th>
              </tr>
            </thead>
            <tbody>
              {ordersWithNewDeadlines.map(order => {
                const currentDeadline = new Date(order.deadline);
                const newDeadline = new Date(order.newDeadline);
                const delayDays = Math.ceil(
                  (newDeadline.getTime() - currentDeadline.getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <tr key={order.id} className="border-t border-gray-600">
                    <td className="px-4 py-2">{order.id}</td>
                    <td className="px-4 py-2">{order.blueprintNumber}</td>
                    <td className="px-4 py-2">{format(currentDeadline, 'dd.MM.yyyy')}</td>
                    <td className="px-4 py-2 text-yellow-300">{format(newDeadline, 'dd.MM.yyyy')}</td>
                    <td className="px-4 py-2 text-red-400">{delayDays}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Отрисовка результатов расчета расписания
  const renderScheduleResults = () => {
    if (schedule.length === 0) return null;
    
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-semibold text-white mb-4">Результаты расчета расписания</h2>
        
        {/* Отображение списка заказов с новыми сроками */}
        {renderOrdersWithNewDeadlines()}
        
        {/* Сводная информация по станкам */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {schedule.map(machineSchedule => (
            <div key={machineSchedule.machineId} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-2">{machineSchedule.machineName}</h3>
              <p className="text-gray-300 mb-1">
                <span className="font-medium">Операций:</span> {machineSchedule.operations.length}
              </p>
              <p className="text-gray-300 mb-1">
                <span className="font-medium">Загрузка:</span> {calculateMachineLoad(machineSchedule)}%
              </p>
              {machineSchedule.operations.length > 0 && (
                <>
                  <p className="text-gray-300 mb-1">
                    <span className="font-medium">Начало:</span> {format(new Date(machineSchedule.operations[0].startDate), 'dd.MM.yyyy')}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Окончание:</span> {format(new Date(machineSchedule.operations[machineSchedule.operations.length - 1].endDate), 'dd.MM.yyyy')}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Детальное расписание для каждого станка */}
        {schedule.map(machineSchedule => (
          <div key={`details-${machineSchedule.machineId}`} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Расписание станка: {machineSchedule.machineName}
            </h3>
            
            {machineSchedule.operations.length === 0 ? (
              <p className="text-gray-400 italic">Нет операций для этого станка</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-700 rounded">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Заказ</th>
                      <th className="px-4 py-2 text-left">Операция</th>
                      <th className="px-4 py-2 text-left">Начало</th>
                      <th className="px-4 py-2 text-left">Окончание</th>
                      <th className="px-4 py-2 text-left">Продолжит.</th>
                      <th className="px-4 py-2 text-left">Срок заказа</th>
                      <th className="px-4 py-2 text-left">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machineSchedule.operations.map((op: any, index: number) => {
                      const startDate = new Date(op.startDate);
                      const endDate = new Date(op.endDate);
                      const orderDeadline = new Date(op.deadline);
                      
                      // Рассчитываем длительность в днях
                      const durationDays = Math.ceil(
                        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      
                      // Определяем статус относительно срока
                      const isOverdue = endDate > orderDeadline;
                      
                      return (
                        <tr 
                          key={`${op.orderId}-${op.opNumber}-${index}`} 
                          className={`border-t border-gray-600 ${
                            isOverdue ? 'bg-red-900 bg-opacity-25' : 'hover:bg-gray-600'
                          }`}
                        >
                          <td className="px-4 py-2">
                            {op.blueprintNumber || op.orderId}
                          </td>
                          <td className="px-4 py-2">
                            №{op.opNumber} ({op.opAxes})
                          </td>
                          <td className="px-4 py-2">
                            {format(startDate, 'dd.MM.yyyy')}
                          </td>
                          <td className="px-4 py-2">
                            {format(endDate, 'dd.MM.yyyy')}
                          </td>
                          <td className="px-4 py-2">
                            {durationDays} {durationDays === 1 ? 'день' : 
                              durationDays > 1 && durationDays < 5 ? 'дня' : 'дней'}
                          </td>
                          <td className="px-4 py-2">
                            {format(orderDeadline, 'dd.MM.yyyy')}
                          </td>
                          <td className="px-4 py-2">
                            <span className={isOverdue ? 'text-red-400' : 'text-green-400'}>
                              {isOverdue ? 'Опоздание' : 'В срок'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Отрисовка страницы
  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Расчет производственного расписания</h1>
      
      {/* Сообщения об ошибках и успешных операциях */}
      {errorMessage && (
        <div className="bg-red-800 text-white p-4 rounded-lg mb-6">
          <p>{errorMessage}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-800 text-white p-4 rounded-lg mb-6">
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Форма для расчета */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Параметры расчета</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Начальная дата расчета:</label>
            <input
              type="date"
              value={format(startDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              className="w-full p-3 rounded bg-gray-700 text-white"
            />
          </div>
          
          <div className="flex items-end">
            <div className="text-gray-300 space-y-1">
              <p><span className="font-semibold">Заказов для распределения:</span> {orders.length}</p>
              <p><span className="font-semibold">Доступных станков:</span> {machines.length}</p>
              <p><span className="font-semibold">Календарь праздников:</span> {isCalendarInitialized ? 'Загружен' : 'Загрузка...'}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="primary" 
            onClick={handleCalculate} 
            disabled={isCalculating || orders.length === 0 || machines.length === 0 || !isCalendarInitialized}
            className={isCalculating ? 'button-loading' : ''}
          >
            {isCalculating ? 'Расчет...' : 'Рассчитать расписание'}
          </Button>
          
          {schedule.length > 0 && (
            <Button 
              variant="success" 
              onClick={handleSaveSchedule} 
              disabled={isCalculating}
            >
              Сохранить расписание
            </Button>
          )}
        </div>
      </div>
      
      {/* Результаты расчета */}
      {renderScheduleResults()}
    </div>
  );
};

export default CalculationPage;