import React, { useState, useEffect } from 'react';
import { fetchMachines } from '../../api-client/ordersApi';
import { calculateWorkingDays } from '../../utils/utils';

const MachineOperationsList: React.FC = () => {
  const [machines, setMachines] = useState<any[]>([]);

  useEffect(() => {
    const loadMachines = async () => {
      try {
        const data = await fetchMachines();
        setMachines(data);
      } catch (error) {
        console.error('Ошибка при загрузке станков:', error);
      }
    };
    loadMachines();
  }, []);

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Список операций станков</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machines.map(machine => (
          <div key={machine.id} className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold text-white">{machine.name}</h2>
            <p className="text-gray-300">
              Доступен с: {new Date(machine.releaseDate).toLocaleDateString()}
            </p>
            <p className="text-gray-300">
              Рабочих дней до конца месяца: {calculateWorkingDays(new Date(), new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MachineOperationsList;