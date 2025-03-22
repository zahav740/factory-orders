// src/machine-scheduler/components/CalendarView/MonthCalendar.tsx
import React from 'react';
import { CalendarItem } from '../../utils/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import CalendarDay from './CalendarDay';

interface MonthCalendarProps {
  monthKey: string;
  days: CalendarItem[];
  showMachineNames: boolean;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ monthKey, days, showMachineNames }) => {
  if (!days.length) return null;
  
  const firstDay = days[0].date;
  const monthDate = new Date(firstDay);
  const monthName = format(monthDate, 'LLLL yyyy', { locale: ru });
  
  // Calculate days for the correct grid display with appropriate offsets
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);
  
  // Create empty cells for days before the start of the month
  const emptyStartCells = Array.from({ length: startDay }, (_, i) => (
    <div key={`empty-start-${i}`} className="h-36"></div>
  ));

  // Create a map of all days in the month for easy lookup
  const daysMap = days.reduce((map, day) => {
    const dateKey = format(day.date, 'yyyy-MM-dd');
    map[dateKey] = day;
    return map;
  }, {} as Record<string, CalendarItem>);
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold capitalize text-white relative pl-4 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-2 before:bg-indigo-500 before:rounded-full">
          {monthName}
        </h3>
        {showMachineNames && (
          <div className="bg-indigo-900/50 text-indigo-200 px-3 py-1 rounded-full text-sm">
            {monthKey}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {/* Days of week header */}
        {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
          <div key={day} className="text-center font-medium py-2 text-indigo-300">
            {day}
          </div>
        ))}
        
        {/* Empty cells at the start */}
        {emptyStartCells}
        
        {/* Actual calendar days */}
        {calendarDays.map(date => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayData = daysMap[dateKey];
          
          if (!dayData) {
            return (
              <div 
                key={dateKey} 
                className="h-36 rounded-lg border border-gray-700/30 bg-gray-800/50 p-2"
              >
                <div className="text-gray-500">{format(date, 'd')}</div>
              </div>
            );
          }
          
          return (
            <CalendarDay 
              key={dateKey} 
              item={dayData} 
              isToday={isToday(date)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;