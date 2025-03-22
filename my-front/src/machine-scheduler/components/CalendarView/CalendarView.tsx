// src/machine-scheduler/components/CalendarView/CalendarView.tsx
import React from 'react';
import { MachineSchedule } from '../../utils/types';
import { groupCalendarByMonths } from '../../utils/calendarHelpers';
import MonthCalendar from './MonthCalendar';

interface CalendarViewProps {
  machineSchedule: MachineSchedule | null;
  isAllMachines?: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  machineSchedule, 
  isAllMachines = false 
}) => {
  // Если расписание не выбрано, возвращаем заглушку
  if (!machineSchedule) {
    return (
      <div className="flex items-center justify-center py-16 bg-gray-800 rounded-xl shadow-xl">
        <div className="text-center p-8 bg-gray-900 rounded-lg max-w-md">
          <svg className="w-16 h-16 text-indigo-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Выберите станок</h3>
          <p className="text-gray-400">Пожалуйста, выберите станок из списка выше для просмотра расписания</p>
        </div>
      </div>
    );
  }
  
  // Группируем дни по месяцам
  const months = groupCalendarByMonths(machineSchedule.calendar);
  const monthKeys = Object.keys(months).sort();
  
  if (monthKeys.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 bg-gray-800 rounded-xl shadow-xl">
        <div className="text-center p-8 bg-gray-900 rounded-lg max-w-md">
          <svg className="w-16 h-16 text-indigo-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Нет данных</h3>
          <p className="text-gray-400">Для выбранного периода нет данных о расписании</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {isAllMachines && (
        <div className="p-4 bg-indigo-900/30 rounded-lg mb-6 border border-indigo-700/30">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-indigo-300">
              Отображаются операции по всем станкам. Для более детального просмотра выберите конкретный станок.
            </p>
          </div>
        </div>
      )}
      
      {monthKeys.map(monthKey => (
        <MonthCalendar 
          key={monthKey}
          monthKey={monthKey}
          days={months[monthKey]}
          showMachineNames={isAllMachines}
        />
      ))}
    </div>
  );
};

export default CalendarView;