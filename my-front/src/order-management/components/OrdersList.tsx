// src/order-management/components/OrdersList.tsx
import React, { useState } from 'react';
import { format } from 'date-fns'; // Добавляем импорт
import { Button } from '../../ui-components/components/Button';
import { Order } from '../../api-client/ordersAdapter';

interface OrdersListProps {
  orders: Order[];
  onDelete: (id: number) => void;
  onSelect: (id: number) => void;
  onComplete: (id: number) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onDelete, onSelect, onComplete }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<number | null>(null); // Добавляем состояние загрузки

  // Функция для открытия/закрытия деталей заказа
  const toggleOrderDetails = (id: number) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Форматирование даты с использованием date-fns
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Не указано';
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  // Обработчик асинхронных действий
  const handleAction = async (action: () => void, id: number) => {
    setIsProcessing(id);
    await action();
    setIsProcessing(null);
  };

  // Если нет заказов для отображения
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <p className="text-gray-400">Нет заказов для отображения</p>
      </div>
    );
  }

  console.log(`Отображаем ${orders.length} заказов`);

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div 
          key={order.id} 
          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
        >
          {/* Заголовок заказа - кликабельный */}
          <div 
            className="p-4 bg-gray-700 flex justify-between items-center cursor-pointer"
            onClick={() => toggleOrderDetails(order.id)}
          >
            <div className="flex items-center">
              <span className="font-medium text-lg">{order.blueprintNumber}</span>
              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                order.status === 'новый' ? 'bg-indigo-600 text-white' :
                order.status === 'в работе' ? 'bg-amber-600 text-white' :
                order.status === 'завершен' ? 'bg-emerald-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {order.status}
              </span>
            </div>
            
            <div className="flex items-center">
              {order.priority > 1 && (
                <span className="mr-3 px-2 py-1 bg-red-600 rounded text-xs text-white">
                  Приоритет: {order.priority}
                </span>
              )}
              <span className="text-lg">{expandedOrderId === order.id ? '▼' : '▶'}</span>
            </div>
          </div>
          
          {/* Детали заказа - отображаются при клике */}
          {expandedOrderId === order.id && (
            <div className="p-4">
              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Основная информация</h3>
                  <div className="space-y-1">
                    <p><span className="text-gray-400">ID:</span> {order.id}</p>
                    <p><span className="text-gray-400">Чертеж:</span> {order.blueprintNumber}</p>
                    <p><span className="text-gray-400">Количество:</span> {order.quantity} шт.</p>
                    <p><span className="text-gray-400">Приоритет:</span> {order.priority}</p>
                    <p><span className="text-gray-400">Станок:</span> {order.machineName || 'Не назначен'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Сроки</h3>
                  <div className="space-y-1">
                    <p><span className="text-gray-400">Срок сдачи:</span> {formatDate(order.deadline)}</p>
                    <p><span className="text-gray-400">Дата начала:</span> {formatDate(order.startDate)}</p>
                    <p><span className="text-gray-400">Расчетное окончание:</span> {formatDate(order.estimatedCompletion)}</p>
                    <p>
                      <span className="text-gray-400">Уложится в срок:</span>
                      <span className={`ml-2 ${order.willMeetDeadline ? 'text-green-500' : 'text-red-500'}`}>
                        {order.willMeetDeadline ? 'Да' : 'Нет'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Операции */}
              {order.operations && order.operations.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Операции</h3>
                  <div className="bg-gray-700 p-2 rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left">
                          <th className="p-2">№</th>
                          <th className="p-2">Тип</th>
                          <th className="p-2">Время (мин)</th>
                          <th className="p-2">Станок</th>
                          <th className="p-2">Начало</th>
                          <th className="p-2">Окончание</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.operations.map((op, index) => (
                          <tr key={`${order.id}-op-${index}`} className="border-t border-gray-600">
                            <td className="p-2">{op.opNumber}</td>
                            <td className="p-2">{op.opAxes}</td>
                            <td className="p-2">{op.opTime}</td>
                            <td className="p-2">{op.assignedMachine || '-'}</td>
                            <td className="p-2">{formatDate(op.startDate)}</td>
                            <td className="p-2">{formatDate(op.endDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Дополнительная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {order.materialType && (
                  <div>
                    <p><span className="text-gray-400">Материал:</span> {order.materialType}</p>
                  </div>
                )}
                
                {order.pdfPath && (
                  <div>
                    <p>
                      <span className="text-gray-400">PDF:</span>
                      <a 
                        href={order.pdfPath} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-indigo-400 hover:text-indigo-300"
                      >
                        Открыть PDF
                      </a>
                    </p>
                  </div>
                )}
                
                {order.drawingUrl && (
                  <div>
                    <p>
                      <span className="text-gray-400">Чертеж:</span>
                      <a 
                        href={order.drawingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-indigo-400 hover:text-indigo-300"
                      >
                        Открыть чертеж
                      </a>
                    </p>
                  </div>
                )}
              </div>
              
              {/* Кнопки действий */}
              <div className="flex justify-end space-x-3 mt-4 border-t border-gray-700 pt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelect(order.id)}
                >
                  Редактировать
                </Button>
                
                {order.status !== 'завершен' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAction(() => onComplete(order.id), order.id)}
                    disabled={isProcessing === order.id}
                  >
                    {isProcessing === order.id ? 'Завершение...' : 'Завершить'}
                  </Button>
                )}
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Вы уверены, что хотите удалить заказ #${order.id}?`)) {
                      handleAction(() => onDelete(order.id), order.id);
                    }
                  }}
                  disabled={isProcessing === order.id}
                >
                  {isProcessing === order.id ? 'Удаление...' : 'Удалить'}
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrdersList;