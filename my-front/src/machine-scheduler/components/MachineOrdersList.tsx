 
import React from 'react';
import { Button } from '../../ui-components/components/Button';



interface MachineOrdersListProps {
  machineId: number;
  orders: any[];
  onRemoveOrder: (orderId: number) => void;
}

const MachineOrdersList: React.FC<MachineOrdersListProps> = ({ machineId, orders, onRemoveOrder }) => {
  const machineOrders = orders.filter(order =>
    order.operations.some((op: any) => op.machineId === machineId)
  );
  // const isWeekend = (date: Date): boolean => {
  //   const day = date.getDay();
  //   return day === 0 || day === 6; // 0 - воскресенье, 6 - суббота
  // };

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Заказы на станке</h2>
      {machineOrders.length === 0 ? (
        <p className="text-gray-400">Нет заказов</p>
      ) : (
        <ul className="space-y-2">
          {machineOrders.map(order => (
            <li key={order.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
              <span className="text-white">{order.blueprintNumber}</span>
              <Button variant="danger" size="sm" onClick={() => onRemoveOrder(order.id)}>
                Удалить
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MachineOrdersList;