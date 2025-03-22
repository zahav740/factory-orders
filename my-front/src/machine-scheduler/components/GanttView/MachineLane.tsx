// src/machine-scheduler/components/GanttView/MachineLane.tsx
import React from 'react';
import { OrderOperation } from '../../utils/types';
import { format, differenceInDays } from 'date-fns';

// Интерфейс для нерабочих дней
interface NonWorkingDay {
    date: Date;
    dayIndex: number;
    isNonWorking: boolean;
    className: string;
    left: string;
  }

// Обновлённый интерфейс с добавлением nonWorkingDays
interface MachineLaneProps {
  machineName: string;
  operations: OrderOperation[];
  startDate: Date;
  endDate: Date;
  nonWorkingDays: NonWorkingDay[];
  onOperationHover: (operation: OrderOperation | null) => void;
}

const MachineLane: React.FC<MachineLaneProps> = ({ 
  machineName, 
  operations, 
  startDate, 
  endDate,
  nonWorkingDays,
  onOperationHover
}) => {
  return (
    <div className="flex mb-3 relative group">
      <div className="w-48 shrink-0 p-3 font-medium text-white bg-gray-800/70 border-r border-gray-700 flex items-center transition-all duration-200 group-hover:bg-indigo-900/30">
        <span className="truncate">{machineName}</span>
      </div>
      <div className="flex-grow relative h-12 bg-gray-900/50 border-b border-gray-800">
        {/* Render non-working days background */}
        {nonWorkingDays.map((day, index) => (
          <div
            key={`nonworking-${index}`}
            className={`absolute h-full ${day.className}`}
            style={{
              left: day.left,
              width: '8px'
            }}
          />
        ))}
        
        {/* Render operations */}
        {operations.map(op => {
          const startDayIndex = Math.max(0, Math.floor((op.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
          const endDayIndex = Math.floor((op.endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const durationDays = Math.max(1, endDayIndex - startDayIndex + 1);
          
          // Calculate styling based on deadline status
          const deadlineDate = new Date(op.deadline);
          const isDeadlineClose = differenceInDays(deadlineDate, op.endDate) <= 7 && differenceInDays(deadlineDate, op.endDate) >= 0;
          const isOverdue = op.endDate > deadlineDate;
          
          let bgStyle = 'bg-gradient-to-r from-indigo-700 to-indigo-600';
          let borderStyle = 'border-indigo-500';
          
          if (isOverdue) {
            bgStyle = 'bg-gradient-to-r from-red-700 to-red-600';
            borderStyle = 'border-red-500';
          } else if (isDeadlineClose) {
            bgStyle = 'bg-gradient-to-r from-yellow-700 to-yellow-600';
            borderStyle = 'border-yellow-500';
          }
          
          return (
            <div
              key={`${op.orderId}-${op.operationNumber}`}
              className={`absolute h-8 rounded-md text-xs flex items-center justify-center overflow-hidden cursor-pointer ${bgStyle} border-l-4 ${borderStyle} shadow-md transition-all duration-200 hover:scale-y-110 hover:z-10`}
              style={{
                left: `${startDayIndex * 32}px`,
                width: `${durationDays * 32 - 4}px`,
                top: '8px'
              }}
              title={`ID: ${op.orderId}, Чертеж: ${op.orderNumber}, Оп: ${op.operationNumber}`}
              onMouseEnter={() => onOperationHover(op)}
              onMouseLeave={() => onOperationHover(null)}
            >
              <span className="truncate px-2 font-medium text-white">{op.orderNumber} <span className="opacity-70">#{op.operationNumber}</span></span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MachineLane;