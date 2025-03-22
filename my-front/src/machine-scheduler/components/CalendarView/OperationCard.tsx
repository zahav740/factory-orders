// src/machine-scheduler/components/CalendarView/OperationCard.tsx
import React from 'react';
import { OrderOperation } from '../../utils/types';
import { format, differenceInDays } from 'date-fns';

interface OperationCardProps {
  operation: OrderOperation;
}

const OperationCard: React.FC<OperationCardProps> = ({ operation }) => {
  const deadlineDate = new Date(operation.deadline);
  const daysToDeadline = differenceInDays(deadlineDate, new Date());
  const isDeadlineClose = daysToDeadline <= 7 && daysToDeadline >= 0;
  const isOverdue = daysToDeadline < 0;
  
  // Determine card style based on deadline status
  let cardStyle = 'bg-gradient-to-r from-indigo-900 to-indigo-800';
  let borderStyle = 'border-l-4 border-indigo-500';
  let statusText = '';
  let statusStyle = '';
  
  if (isOverdue) {
    cardStyle = 'bg-gradient-to-r from-red-900 to-red-800';
    borderStyle = 'border-l-4 border-red-500';
    statusText = 'Просрочено';
    statusStyle = 'bg-red-600/70 text-red-100';
  } else if (isDeadlineClose) {
    cardStyle = 'bg-gradient-to-r from-yellow-900 to-yellow-800';
    borderStyle = 'border-l-4 border-yellow-500';
    statusText = 'Скоро дедлайн';
    statusStyle = 'bg-yellow-600/70 text-yellow-100';
  } else {
    statusText = 'В сроке';
    statusStyle = 'bg-indigo-600/70 text-indigo-100';
  }

  return (
    <div className={`p-2 rounded shadow-sm ${cardStyle} ${borderStyle} cursor-pointer group transition-all duration-200 hover:shadow hover:translate-x-0.5 hover:-translate-y-0.5`}>
      <div className="flex justify-between items-start">
        <div className="font-semibold truncate text-white">{operation.orderNumber}</div>
        {statusText && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusStyle}`}>
            {statusText}
          </span>
        )}
      </div>
      
      <div className="text-xs text-gray-300 mt-1">
        <div className="flex justify-between">
          <span>ID: {operation.orderId}</span>
          <span>Оп. #{operation.operationNumber}</span>
        </div>
        
        <div className="flex justify-between mt-1">
          <span>Кол-во: {operation.quantity}</span>
          <span className="font-medium text-white">
            Срок: {format(deadlineDate, 'dd.MM.yyyy')}
          </span>
        </div>
      </div>
      
      {/* Hidden tooltip that appears on hover */}
      <div className="hidden group-hover:block absolute z-10 bg-gray-900 text-white p-2 rounded shadow-lg text-xs mt-1 border border-gray-700 max-w-xs">
        <div className="font-bold">{operation.orderNumber}</div>
        <div>ID заказа: {operation.orderId}</div>
        <div>Операция №{operation.operationNumber}</div>
        <div>Количество: {operation.quantity}</div>
        <div>Время операции: {operation.opTime} мин.</div>
        <div>Оси: {operation.opAxes}</div>
        <div className="text-indigo-300 mt-1">Срок: {format(deadlineDate, 'dd MMMM yyyy')}</div>
      </div>
    </div>
  );
};

export default OperationCard;