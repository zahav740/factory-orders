import React from 'react';
import { Button } from '../../ui-components/components/Button';

interface OrderDetailViewProps {
  order: any;
  onClose: () => void;
}

const OrderDetailView: React.FC<OrderDetailViewProps> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold text-white mb-4">Детали заказа</h2>
        <p className="text-gray-300 mb-2"><strong>Номер чертежа:</strong> {order.blueprintNumber}</p>
        <p className="text-gray-300 mb-2"><strong>Количество:</strong> {order.quantity} шт.</p>
        <p className="text-gray-300 mb-2"><strong>Срок:</strong> {order.deadline || 'Не указан'}</p>
        <p className="text-gray-300 mb-2"><strong>Статус:</strong> {order.status}</p>
        {order.operations && order.operations.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-300 mb-1"><strong>Операции:</strong></p>
            <ul className="text-gray-300 text-sm">
              {order.operations.map((op: any) => (
                <li key={op.id}>#{op.opNumber}: {op.opAxes}, {op.opTime} мин</li>
              ))}
            </ul>
          </div>
        )}
        {order.pdfFile && (
          <p className="text-gray-300 mb-4">
            <strong>PDF:</strong> <a href={order.pdfFile} target="_blank" className="text-indigo-400">Открыть</a>
          </p>
        )}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailView;