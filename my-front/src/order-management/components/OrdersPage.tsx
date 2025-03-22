// src/order-management/components/OrdersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../ui-components/components/Button';
import { fetchOrders, createOrder, updateOrder, deleteOrder } from '../../api-client/ordersApi';
import { filterOrders } from '../../utils/utils';
import { Order } from '../../api-client/ordersAdapter';
import OrdersList from './OrdersList';
import OrderForm from './OrderForm';
import OrderDetailView from './OrderDetailView';
import SearchBar from './SearchBar';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      console.log('Загружены заказы:', data.length);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
      setError('Не удалось загрузить заказы. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const result = filterOrders(orders, searchTerm, statusFilter);
    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const handleCreate = useCallback(() => {
    setSelectedOrder(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((id: number) => {
    const order = orders.find(o => o.id === id);
    setSelectedOrder(order || null); // Добавляем проверку на undefined
    setIsFormOpen(true);
  }, [orders]);

  // const handleView = useCallback((id: number) => {
  //   const order = orders.find(o => o.id === id);
  //   setSelectedOrder(order || null); // Добавляем проверку на undefined
  //   setIsDetailOpen(true);
  // }, [orders]);

  const handleSubmit = useCallback(async (orderData: any) => {
    try {
      if (selectedOrder) {
        const updatedOrderData = { 
          ...selectedOrder, 
          ...orderData,
          id: selectedOrder.id
        };
        const updatedOrder = await updateOrder(updatedOrderData);
        setOrders(orders.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
      } else {
        const newOrder = await createOrder(orderData);
        setOrders([...orders, newOrder]);
      }
      setIsFormOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Ошибка при сохранении заказа:', error);
      setError('Не удалось сохранить заказ.');
    }
  }, [selectedOrder, orders]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteOrder(id);
      setOrders(orders.filter(o => o.id !== id));
    } catch (error) {
      console.error('Ошибка при удалении заказа:', error);
      setError('Не удалось удалить заказ.');
    }
  }, [orders]);

  const handleComplete = useCallback(async (id: number) => {
    try {
      const order = orders.find(o => o.id === id);
      if (order) {
        const updatedOrder = await updateOrder({ ...order, status: 'завершен' });
        setOrders(orders.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
      }
    } catch (error) {
      console.error('Ошибка при завершении заказа:', error);
      setError('Не удалось завершить заказ.');
    }
  }, [orders]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Управление заказами</h1>
        <Button 
          variant="primary" 
          onClick={handleCreate}
          className="flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Создать заказ
        </Button>
      </div>

      <div className="card mb-6">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
        />
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {isLoading ? (
        <div className="card flex justify-center items-center p-12">
          <div className="loader">Загрузка заказов...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-xl text-gray-300 mb-2">Заказы не найдены</p>
          <p className="text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Попробуйте изменить параметры поиска или фильтрации' 
              : 'Создайте новый заказ, чтобы начать работу'}
          </p>
          <Button variant="primary" onClick={handleCreate}>
            Создать заказ
          </Button>
        </div>
      ) : (
        <div className="card">
          <OrdersList
            orders={filteredOrders}
            onDelete={handleDelete}
            onSelect={handleEdit}
            onComplete={handleComplete}
          />
        </div>
      )}

      {isFormOpen && (
        <OrderForm
          order={selectedOrder}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}

      {isDetailOpen && selectedOrder && (
        <OrderDetailView
          order={selectedOrder}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default OrdersPage;