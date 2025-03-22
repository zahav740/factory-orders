// src/machine-scheduler/components/common/CalendarLegend.tsx
import React from 'react';

const CalendarLegend: React.FC = () => {
  const legendItems = [
    { color: 'bg-gray-900', label: 'Выходные (Пт, Сб)', icon: 'fa-calendar-xmark' },
    { color: 'bg-purple-900/40', label: 'Праздники Израиля', icon: 'fa-star' },
    { color: 'bg-purple-800/30', label: 'Полдня (до 13:00)', icon: 'fa-clock' },
    { color: 'from-indigo-900 to-indigo-800', label: 'В сроке', icon: 'fa-check-circle' },
    { color: 'from-yellow-900 to-yellow-800', label: 'Близко к сроку', icon: 'fa-exclamation-triangle' },
    { color: 'from-red-900 to-red-800', label: 'Просрочено', icon: 'fa-times-circle' },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg mb-6">
      <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-6 h-6 rounded ${item.color.includes('from') ? `bg-gradient-to-r ${item.color}` : item.color} mr-2 shadow-inner`} />
            <span className="text-sm text-gray-300">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarLegend;