// src/machine-scheduler/components/GanttView/GanttTimeScale.tsx
import React from 'react';
import { eachDayOfInterval, format, isToday, isWeekend } from 'date-fns';
import { ru } from 'date-fns/locale';
import { isWeekendIsrael, getHolidayStatusIsrael } from '../../../utils/utils';

interface GanttTimeScaleProps {
  startDate: Date;
  endDate: Date;
}

const GanttTimeScale: React.FC<GanttTimeScaleProps> = ({ startDate, endDate }) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Группируем дни по месяцам для отображения верхней шкалы
  const months: { [key: string]: number } = {};
  days.forEach(day => {
    const monthKey = format(day, 'yyyy-MM');
    if (!months[monthKey]) {
      months[monthKey] = 0;
    }
    months[monthKey]++;
  });
  
  return (
    <div className="mb-4">
      {/* Месяцы */}
      <div className="flex border-b border-gray-700 relative">
        <div className="w-48 shrink-0 bg-gray-800 z-10 border-r border-gray-700 rounded-tl-lg"></div>
        {Object.entries(months).map(([monthKey, daysCount]) => {
          const monthDate = new Date(monthKey);
          const monthName = format(monthDate, 'LLLL yyyy', { locale: ru });
          const width = daysCount * 32;
          return (
            <div 
              key={monthKey}
              className="text-center py-2 text-indigo-300 font-medium border-r border-gray-700 bg-gray-800/50"
              style={{ width: `${width}px` }}
            >
              {monthName}
            </div>
          );
        })}
      </div>
      
      {/* Дни */}
      <div className="flex">
        <div className="w-48 shrink-0 py-2 px-4 text-sm font-semibold bg-gray-800 border-r border-gray-700">
          Станок
        </div>
        {days.map(date => {
          const isWeekendDay = isWeekendIsrael(date);
          const holidayStatus = getHolidayStatusIsrael(date);
          const isHolidayDay = holidayStatus?.isFullDay || false;
          const isHalfDay = holidayStatus?.isHalfDay || false;
          const isTodayDate = isToday(date);
          
          let bgStyle = '';
          if (isWeekendDay) bgStyle = 'bg-gray-900/50';
          if (isHolidayDay) bgStyle = 'bg-purple-900/40';
          if (isHalfDay) bgStyle = 'bg-purple-800/30';
          
          let dateStyle = '';
          if (isTodayDate) dateStyle = 'font-bold text-indigo-500 bg-indigo-900/30';
          
          const dayOfWeek = format(date, 'E', { locale: ru });
          
          return (
            <div 
              key={format(date, 'yyyy-MM-dd')} 
              className={`w-8 text-center border-r border-gray-700/50 ${bgStyle}`}
            >
              <div className={`text-xs py-1 ${dateStyle}`}>
                {format(date, 'd')}
              </div>
              <div className="text-xs text-gray-500 pb-1">
                {dayOfWeek}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GanttTimeScale;