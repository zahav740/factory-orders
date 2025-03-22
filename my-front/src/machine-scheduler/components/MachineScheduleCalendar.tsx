// src/machine-scheduler/components/MachineScheduleCalendar.tsx
import React, { useState, useEffect } from 'react';
import { addDays } from 'date-fns';
import { fetchOrders, fetchMachines } from '../../api-client/ordersApi';
import { createMachineSchedules } from '../utils/calendarHelpers';
import CalendarControls from './common/CalendarControls';
import CalendarLegend from './common/CalendarLegend';
import LoadingState from './common/LoadingState';
import CalendarView from './CalendarView/CalendarView';
import GanttChart from './GanttView/GanttChart';

const MachineScheduleCalendar: React.FC = () => {
  const [machines, setMachines] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [machineSchedules, setMachineSchedules] = useState<any[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>('Все Станки');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 30));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'gantt'>('calendar');

  // Загрузка данных о станках и заказах
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [machinesData, ordersData] = await Promise.all([
          fetchMachines(),
          fetchOrders()
        ]);
        setMachines(machinesData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные календаря');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Создание расписаний станков на основе загруженных данных и выбранного станка
  useEffect(() => {
    if (machines.length > 0 && orders.length > 0) {
      const schedules = createMachineSchedules(machines, orders, startDate, endDate, selectedMachine);
      setMachineSchedules(schedules);
    }
  }, [machines, orders, startDate, endDate, selectedMachine]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Верхний блок с заголовком */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="relative mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-white inline-block relative z-10">
                Календарь станков 
                <span className="text-indigo-400 ml-2">(Израиль)</span>
              </h1>
              <div className="absolute -bottom-2 left-0 h-1 w-24 bg-indigo-600 rounded-full"></div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-lg py-2 px-4 text-indigo-300 text-sm">
                Текущая дата: {new Date().toLocaleDateString('ru-RU')}
              </div>
              
              <button
                onClick={() => setViewMode(viewMode === 'calendar' ? 'gantt' : 'calendar')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center font-medium"
              >
                {viewMode === 'calendar' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H8a1 1 0 01-1-1V4zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Диаграмма
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011-1h8a1 1 0 011 1v10a1 1 0 01-1 1H6a1 1 0 01-1-1V2zm3 9a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                    </svg>
                    Календарь
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Блок с контролами */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8 border border-gray-700/50">
          <CalendarControls
            machines={machines}
            selectedMachine={selectedMachine}
            onMachineChange={setSelectedMachine}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onToggleViewMode={() => setViewMode(viewMode === 'calendar' ? 'gantt' : 'calendar')}
            viewMode={viewMode}
          />
        </div>
        
        {/* Блок с легендой */}
        <CalendarLegend />
        
        {/* Основной контент */}
        <div className="transition-all duration-300">
          {loading ? (
            <div className="bg-gray-800 rounded-xl p-10 shadow-xl border border-gray-700/20">
              <LoadingState message="Загрузка данных календаря..." />
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-red-900/70 to-red-800/70 p-6 rounded-xl mb-6 border border-red-700/50 shadow-xl">
              <div className="flex items-start">
                <div className="bg-red-800/80 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ошибка загрузки данных</h3>
                  <p className="text-red-200 mb-4">{error}</p>
                  <button
                    className="px-4 py-2 bg-white text-red-800 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-lg flex items-center"
                    onClick={() => window.location.reload()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Попробовать снова
                  </button>
                </div>
              </div>
            </div>
          ) : viewMode === 'calendar' ? (
            <div className="transition-opacity duration-300">
              <CalendarView 
                machineSchedule={machineSchedules[0] || null} 
                isAllMachines={selectedMachine === 'Все Станки'} 
              />
            </div>
          ) : (
            <div className="transition-opacity duration-300">
              <GanttChart 
                schedules={machineSchedules} 
                startDate={startDate} 
                endDate={endDate} 
                orders={orders} 
              />
            </div>
          )}
        </div>
        
        {/* Футер */}
        <div className="mt-12 pt-6 border-t border-gray-700/30 text-center text-gray-500 text-sm">
          <p>Календарь станков © {new Date().getFullYear()} | Учитывает праздники и выходные дни Израиля</p>
        </div>
      </div>
    </div>
  );
};

export default MachineScheduleCalendar;