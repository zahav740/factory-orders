// src/machine-scheduler/components/GanttView/GanttChart.tsx
import React, { useState } from 'react';
import GanttTimeScale from './GanttTimeScale';
import MachineLane from '../GanttView/MachineLane';
import { OrderOperation } from '../../utils/types';
import { createNonWorkingDaysData } from '../../utils/ganttHelpers';
import { format, differenceInDays } from 'date-fns';


interface GanttChartProps {
  schedules: any[];
  startDate: Date;
  endDate: Date;
  orders: any[];
}

const GanttChart: React.FC<GanttChartProps> = ({ startDate, endDate, orders }) => {
  const [hoveredOperation, setHoveredOperation] = useState<OrderOperation | null>(null);
  
  // Собираем все операции из расписаний
  const allOperations: OrderOperation[] = [];
  orders.forEach((order: any) => {
    if (order.operations && order.operations.length > 0) {
      order.operations.forEach((op: any) => {
        if (op.assignedMachine && op.startDate && op.endDate) {
          allOperations.push({
            orderId: order.id,
            orderNumber: order.blueprintNumber,
            operationNumber: op.opNumber,
            quantity: order.quantity,
            startDate: new Date(op.startDate),
            endDate: new Date(op.endDate),
            machineName: op.assignedMachine,
            machineId: 0,
            deadline: order.deadline,
            opTime: op.opTime,
            opAxes: op.opAxes
          });
        }
      });
    }
  });

  // Группируем операции по имени станка
  const operationsByMachine: { [key: string]: OrderOperation[] } = {};
  allOperations.forEach(op => {
    if (!operationsByMachine[op.machineName]) {
      operationsByMachine[op.machineName] = [];
    }
    operationsByMachine[op.machineName].push(op);
  });
  
  // Получаем данные о нерабочих днях
  const nonWorkingDays = createNonWorkingDaysData(startDate, endDate);
  
  // Рассчитываем ширину диаграммы Ганта
  const daysCount = differenceInDays(endDate, startDate) + 1;
  const diagramWidth = daysCount * 32 + 200; // Дополнительная ширина для имени станка
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Диаграмма загрузки станков</h3>
        <div className="text-sm text-gray-300">
          Период: {format(startDate, 'dd.MM.yyyy')} — {format(endDate, 'dd.MM.yyyy')}
        </div>
      </div>
      
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-2">
        <div style={{ minWidth: `${diagramWidth}px` }}>
          {/* Шкала времени */}
          <GanttTimeScale startDate={startDate} endDate={endDate} />
          
          {/* Полосы для станков */}
          {Object.entries(operationsByMachine).map(([machineName, operations]) => (
            <MachineLane
              key={machineName}
              machineName={machineName}
              operations={operations}
              startDate={startDate}
              endDate={endDate}
              nonWorkingDays={nonWorkingDays}
              onOperationHover={setHoveredOperation}
            />
          ))}
        </div>
      </div>
      
      {/* Всплывающая информация о выбранной операции */}
      {hoveredOperation && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-indigo-600/30">
          <h4 className="text-lg font-semibold text-white mb-2">
            Детали операции
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-400 block">ID заказа:</span>
              <span className="text-white font-medium">{hoveredOperation.orderId}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Чертеж:</span>
              <span className="text-white font-medium">{hoveredOperation.orderNumber}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Операция:</span>
              <span className="text-white font-medium">#{hoveredOperation.operationNumber}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Количество:</span>
              <span className="text-white font-medium">{hoveredOperation.quantity} шт.</span>
            </div>
            <div>
              <span className="text-gray-400 block">Дата начала:</span>
              <span className="text-white font-medium">{format(hoveredOperation.startDate, 'dd.MM.yyyy')}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Дата окончания:</span>
              <span className="text-white font-medium">{format(hoveredOperation.endDate, 'dd.MM.yyyy')}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Срок:</span>
              <span className="text-white font-medium">{format(new Date(hoveredOperation.deadline), 'dd.MM.yyyy')}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Время операции:</span>
              <span className="text-white font-medium">{hoveredOperation.opTime} мин.</span>
            </div>
            <div>
              <span className="text-gray-400 block">Тип операции:</span>
              <span className="text-white font-medium">{hoveredOperation.opAxes}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;