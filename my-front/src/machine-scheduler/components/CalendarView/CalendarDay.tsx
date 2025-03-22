// src/machine-scheduler/components/CalendarView/CalendarDay.tsx
import React from 'react';
import { format } from 'date-fns';
import { CalendarItem } from '../../utils/types';
import OperationCard from './OperationCard';

interface CalendarDayProps {
  item: CalendarItem;
  isToday?: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ item, isToday = false }) => {
  const dayOfMonth = format(item.date, 'd');
  const dayName = format(item.date, 'EEE');
  
  // Determine background style based on day type
  let bgStyle = 'bg-gray-800';
  let dayIndicatorStyle = '';
  let labelStyle = '';
  
  if (item.isWeekend) {
    bgStyle = 'bg-gray-900 border-gray-700';
    labelStyle = 'text-gray-400';
  }
  
  if (item.isHoliday) {
    bgStyle = 'bg-purple-900/40 border-purple-700/50';
    labelStyle = 'text-purple-200';
  }
  
  if (item.isHalfDay) {
    bgStyle = 'bg-purple-800/30 border-purple-600/50';
    labelStyle = 'text-purple-300';
  }
  
  if (isToday) {
    dayIndicatorStyle = 'bg-indigo-500 text-white';
    bgStyle += ' ring-2 ring-indigo-500 ring-opacity-80';
  }

  return (
    <div className={`rounded-lg h-36 border border-gray-700 p-0 relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20 ${bgStyle} hover:scale-[1.02]`}>
      <div className="flex flex-col h-full">
        {/* Day header */}
        <div className="px-2 py-1 border-b border-gray-700/50 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium ${dayIndicatorStyle}`}>
              {dayOfMonth}
            </span>
            <span className={`text-xs font-medium ${labelStyle}`}>{dayName}</span>
          </div>
          <div className="flex gap-1">
            {item.isWeekend && <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-700/50 text-gray-300">вых</span>}
            {item.isHoliday && <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-800/50 text-purple-200">праздник</span>}
            {item.isHalfDay && <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-700/50 text-purple-300">до 13:00</span>}
          </div>
        </div>
        
        {/* Operation cards container */}
        <div className="overflow-y-auto p-1 flex-1 text-xs scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {item.operations.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs italic">
              Нет операций
            </div>
          ) : (
            <div className="space-y-1">
              {item.operations.map((op, idx) => (
                <OperationCard key={`${op.orderId}-${op.operationNumber}-${idx}`} operation={op} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarDay;