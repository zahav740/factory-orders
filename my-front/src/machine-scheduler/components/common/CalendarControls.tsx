// src/machine-scheduler/components/common/CalendarControls.tsx
import React from 'react';
import { format, addMonths, subMonths } from 'date-fns';

interface CalendarControlsProps {
  machines: any[];
  selectedMachine: string;
  onMachineChange: (machine: string) => void;
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onToggleViewMode: () => void;
  viewMode: 'calendar' | 'gantt';
}

const CalendarControls: React.FC<CalendarControlsProps> = ({
  machines,
  selectedMachine,
  onMachineChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onToggleViewMode,
  viewMode,
}) => {
  const handleQuickDateRange = (range: 'month' | 'quarter' | 'halfYear' | 'year') => {
    const today = new Date();
    let newEndDate;
    
    switch (range) {
      case 'month':
        newEndDate = addMonths(today, 1);
        break;
      case 'quarter':
        newEndDate = addMonths(today, 3);
        break;
      case 'halfYear':
        newEndDate = addMonths(today, 6);
        break;
      case 'year':
        newEndDate = addMonths(today, 12);
        break;
      default:
        newEndDate = addMonths(today, 1);
    }
    
    onStartDateChange(today);
    onEndDateChange(newEndDate);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Настройки календаря</h2>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
              viewMode === 'calendar' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => viewMode !== 'calendar' && onToggleViewMode()}
          >
            <i className="fas fa-calendar mr-2"></i>
            Календарь
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
              viewMode === 'gantt' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => viewMode !== 'gantt' && onToggleViewMode()}
          >
            <i className="fas fa-chart-gantt mr-2"></i>
            Диаграмма
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-indigo-300">Станок:</label>
          <div className="relative">
            <select
              value={selectedMachine}
              onChange={(e) => onMachineChange(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="Все Станки">Все Станки</option>
              {machines.map(machine => (
                <option key={machine.id} value={machine.name}>
                  {machine.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-indigo-300">Начальная дата:</label>
          <input
            type="date"
            value={format(startDate, 'yyyy-MM-dd')}
            onChange={(e) => onStartDateChange(new Date(e.target.value))}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 focus:outline-none"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-indigo-300">Конечная дата:</label>
          <input
            type="date"
            value={format(endDate, 'yyyy-MM-dd')}
            onChange={(e) => onEndDateChange(new Date(e.target.value))}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 focus:outline-none"
          />
        </div>
      </div>
      
      <div className="mt-6 border-t border-gray-700 pt-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-indigo-300 mr-2">Быстрый выбор периода:</span>
          <button
            onClick={() => handleQuickDateRange('month')}
            className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full hover:bg-indigo-700 transition-colors"
          >
            1 месяц
          </button>
          <button
            onClick={() => handleQuickDateRange('quarter')}
            className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full hover:bg-indigo-700 transition-colors"
          >
            3 месяца
          </button>
          <button
            onClick={() => handleQuickDateRange('halfYear')}
            className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full hover:bg-indigo-700 transition-colors"
          >
            6 месяцев
          </button>
          <button
            onClick={() => handleQuickDateRange('year')}
            className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full hover:bg-indigo-700 transition-colors"
          >
            1 год
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarControls;