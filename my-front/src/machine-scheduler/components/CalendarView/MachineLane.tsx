// src/machine-scheduler/components/GanttView/MachineLane.tsx
import React from 'react';
import { OrderOperation } from '../../utils/types';

interface MachineLaneProps {
  machineName: string;
  operations: OrderOperation[];
  startDate: Date;
  endDate: Date;
}

const MachineLane: React.FC<MachineLaneProps> = ({ machineName, operations, startDate, endDate }) => {
  return (
    <div className="flex mb-3 relative">
      <div className="w-40 shrink-0 p-2 font-medium">{machineName}</div>
      <div className="flex-grow relative h-10 bg-gray-900">
        {operations.map(op => {
          const startDayIndex = Math.max(0, Math.floor((op.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
          const endDayIndex = Math.floor((op.endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const durationDays = Math.max(1, endDayIndex - startDayIndex + 1);
          return (
            <div
              key={`${op.orderId}-${op.operationNumber}`}
              className="absolute h-8 rounded text-xs flex items-center justify-center overflow-hidden cursor-pointer bg-indigo-700"
              style={{
                left: `${startDayIndex * 8}px`,
                width: `${durationDays * 8}px`,
                top: '4px'
              }}
              title={`ID: ${op.orderId}, Чертеж: ${op.orderNumber}, Оп: ${op.operationNumber}`}
            >
              <span className="truncate px-1">{op.orderNumber} #{op.operationNumber}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MachineLane;
