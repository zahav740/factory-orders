// my-front/src/api-client/ordersApi.ts
import axios from 'axios';
import { adaptOrderFromApi, adaptOrderForApi, Order } from './ordersAdapter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Моковые данные для станков
let mockMachines = [
  { id: 1, name: 'Doosan Hadasha', releaseDate: '2025-03-22', types: ['3х', '4х'] },
  { id: 2, name: 'Doosan Yashana', releaseDate: '2025-03-23', types: ['3х', '4х'] },
  { id: 3, name: 'Pinnacle Gdola', releaseDate: '2025-03-25', types: ['3х', '4х'] },
  { id: 4, name: 'Pinnacle Ktana', releaseDate: '2025-03-26', types: ['3х'] },
  { id: 5, name: 'Mitsubishi', releaseDate: '2025-03-27', types: ['3х'] },
  { id: 6, name: 'Okuma', releaseDate: '2025-03-28', types: ['токарный'] },
  { id: 7, name: 'JohnFord', releaseDate: '2025-03-29', types: ['токарный'] },
];

/**
 * Обработка ошибок API запросов
 */
export const handleError = (message: string, error: unknown): void => {
  console.error(message, error);
};

/**
 * Получение списка заказов
 */
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      return []; // Возвращаем пустой массив, т.к. нет моковых данных заказов
    }
    
    console.log('Отправка запроса к API на получение заказов');
    const response = await axios.get(`${API_URL}/orders`);
    console.log('API ответ:', response.data);
    
    // Применяем адаптер для преобразования формата данных
    const adaptedOrders = response.data.map((order: any) => adaptOrderFromApi(order));
    console.log('Адаптированные данные заказов:', adaptedOrders);
    
    return adaptedOrders;
  } catch (error) {
    handleError('Ошибка при загрузке заказов:', error);
    console.log('Возвращаем пустой массив из-за ошибки API');
    return [];
  }
};

/**
 * Получение конкретного заказа по ID
 */
export const getOrderById = async (id: number): Promise<Order | null> => {
  try {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      return null;
    }
    
    const response = await axios.get(`${API_URL}/orders/${id}`);
    console.log(`Получен заказ #${id}:`, response.data);
    
    // Применяем адаптер для преобразования формата данных
    return adaptOrderFromApi(response.data);
  } catch (error) {
    handleError(`Ошибка при получении заказа #${id}:`, error);
    return null;
  }
};

/**
 * Создание нового заказа
 */
export const createOrder = async (orderData: any) => {
  try {
    const adaptedOrder = adaptOrderForApi(orderData);
    console.log('Создание заказа с данными:', adaptedOrder);
    
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      return adaptedOrder;
    }
    
    const response = await axios.post(`${API_URL}/orders`, adaptedOrder);
    return adaptOrderFromApi(response.data);
  } catch (error) {
    handleError('Ошибка при создании заказа:', error);
    throw error;
  }
};

/**
 * Обновление существующего заказа
 */
export const updateOrder = async (orderData: any) => {
  try {
    const adaptedOrder = adaptOrderForApi(orderData);
    console.log(`Обновление заказа #${adaptedOrder.id}:`, adaptedOrder);
    
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      return adaptedOrder;
    }
    
    const response = await axios.patch(`${API_URL}/orders/${adaptedOrder.id}`, adaptedOrder);
    return adaptOrderFromApi(response.data);
  } catch (error) {
    handleError('Ошибка при обновлении заказа:', error);
    throw error;
  }
};

/**
 * Удаление заказа
 */
export const deleteOrder = async (id: number) => {
  try {
    console.log(`Удаление заказа #${id}`);
    
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      return;
    }
    
    await axios.delete(`${API_URL}/orders/${id}`);
  } catch (error) {
    handleError('Ошибка при удалении заказа:', error);
    throw error;
  }
};

/**
 * Получение списка станков - всегда используем моковые данные
 */
export const fetchMachines = async () => {
  console.log('Машины всегда используют моковые данные');
  return mockMachines;
};

/**
 * Обновление даты освобождения станка
 */
export const updateMachineReleaseDate = async (machineId: number, releaseDate: string) => {
  try {
    console.log(`Обновление даты освобождения станка #${machineId} на ${releaseDate}`);
    
    mockMachines = mockMachines.map(m => 
      m.id === machineId ? { ...m, releaseDate } : m
    );
    
    return mockMachines.find(m => m.id === machineId);
  } catch (error) {
    handleError('Ошибка при обновлении даты станка:', error);
    throw error;
  }
};