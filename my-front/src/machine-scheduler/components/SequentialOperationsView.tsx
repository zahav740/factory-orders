import React from 'react';
import { calculateWorkingDays } from '../../utils/utils';

interface SequentialOperationsViewProps {
  operations: any[];
}

const SequentialOperationsView: React.FC<SequentialOperationsViewProps> = ({ operations }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Последовательность операций</h2>
      {operations.length === 0 ? (
        <p className="text-gray-400">Нет операций</p>
      ) : (
        <ul className="space-y-2">
          {operations.map((op, index) => (
            <li key={op.id} className="bg-gray-700 p-2 rounded text-white">
              <span>Операция #{op.opNumber}: {op.opAxes}</span>
              <span className="ml-2">Время: {op.opTime} мин</span>
              {index > 0 && (
                <span className="ml-2">
                  Интервал: {calculateWorkingDays(new Date(operations[index - 1].endDate), new Date(op.startDate))} дней
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SequentialOperationsView; 
