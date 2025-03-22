 //my-front\src\order-management\api\ordersApi.ts

 import axios from 'axios';
 import { handleError } from '../../utils/utils';
 
 const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
 
 let mockOrders = [
   { id: 1, blueprintNumber: 'BP001', quantity: 10, deadline: '2025-04-01', status: 'новый', operations: [], pdfFile: null },
   { id: 2, blueprintNumber: 'BP002', quantity: 5, deadline: '2025-03-25', status: 'в работе', operations: [], pdfFile: null },
   { id: 3, blueprintNumber: 'BP003', quantity: 20, deadline: '2025-04-10', status: 'новый', operations: [], pdfFile: null },
   { id: 4, blueprintNumber: 'BP004', quantity: 15, deadline: '2025-03-30', status: 'в работе', operations: [], pdfFile: null },
   { id: 5, blueprintNumber: 'BP005', quantity: 8, deadline: '2025-04-15', status: 'завершен', operations: [], pdfFile: null },
 ];
 
 export const fetchOrders = async () => {
  try {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      return mockOrders;
    }
    const response = await axios.get(`${API_URL}/orders`);
    console.log('API ответ:', response.data); // Добавлено логирование
    return response.data;
  } catch (error) {
    handleError('Ошибка при загрузке заказов:', error);
    console.log('Возвращаем моковые данные заказов из-за ошибки API');
    return mockOrders;
  }
};
 
 export const createOrder = async (orderData: any) => {
   try {
     if (import.meta.env.VITE_USE_MOCK === 'true') {
       const newOrder = { ...orderData, id: Date.now() };
       mockOrders.push(newOrder);
       return newOrder;
     }
     const response = await axios.post(`${API_URL}/orders`, orderData);
     return response.data;
   } catch (error) {
     handleError('Ошибка при создании заказа:', error);
     // В случае ошибки при создании всё равно возвращаем сфабрикованный заказ для тестирования
     const newOrder = { ...orderData, id: Date.now() };
     mockOrders.push(newOrder);
     return newOrder;
   }
 };
 
 export const updateOrder = async (orderData: any) => {
   try {
     if (import.meta.env.VITE_USE_MOCK === 'true') {
       mockOrders = mockOrders.map(o => (o.id === orderData.id ? orderData : o));
       return orderData;
     }
     const response = await axios.put(`${API_URL}/orders/${orderData.id}`, orderData);
     return response.data;
   } catch (error) {
     handleError('Ошибка при обновлении заказа:', error);
     // В случае ошибки всё равно обновляем локальные данные
     mockOrders = mockOrders.map(o => (o.id === orderData.id ? orderData : o));
     return orderData;
   }
 };
 
 export const deleteOrder = async (id: number) => {
   try {
     if (import.meta.env.VITE_USE_MOCK === 'true') {
       mockOrders = mockOrders.filter(o => o.id !== id);
       return;
     }
     await axios.delete(`${API_URL}/orders/${id}`);
   } catch (error) {
     handleError('Ошибка при удалении заказа:', error);
     // В случае ошибки всё равно удаляем из локальных данных
     mockOrders = mockOrders.filter(o => o.id !== id);
   }
 };