import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  // Карточки с функциями системы
  const features = [
    {
      title: 'Управление заказами',
      description: 'Создавайте, редактируйте и отслеживайте статусы всех заказов в единой системе',
      icon: '📋',
      link: '/orders'
    },
    {
      title: 'Планирование расписания',
      description: 'Автоматический расчет оптимального расписания работы станков',
      icon: '⏱️',
      link: '/calculation'
    },
    {
      title: 'Календарь станков',
      description: 'Визуализация загрузки станков и планирование производства',
      icon: '📅',
      link: '/calendar'
    }
  ];

  return (
    <div className="py-8">
      {/* Заголовок */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Система управления производством</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Интеллектуальное планирование и эффективное управление заказами для вашего предприятия
        </p>
      </div>

      {/* Карточки с функциями */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {features.map((feature, index) => (
          <Link 
            to={feature.link} 
            key={index}
            className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-gray-700"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h2 className="text-xl font-semibold text-white mb-2">{feature.title}</h2>
            <p className="text-gray-300">{feature.description}</p>
          </Link>
        ))}
      </div>

      {/* Статистика */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-white">15+</div>
            <div className="text-gray-200">Активных заказов</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white">98%</div>
            <div className="text-gray-200">Своевременное выполнение</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white">5</div>
            <div className="text-gray-200">Станков на производстве</div>
          </div>
        </div>
      </div>
      
      {/* Дополнительная информация */}
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">Начните работу с системой</h2>
        <p className="text-gray-300 mb-6">
          Переходите к любому разделу системы через меню навигации или карточки выше
        </p>
        <Link 
          to="/orders" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Перейти к заказам
        </Link>
      </div>
    </div>
  );
};

export default HomePage;