import React, { memo } from 'react';
import { Input } from '../../ui-components/components/Input';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

// Используем memo для оптимизации рендеринга
const SearchBar: React.FC<SearchBarProps> = memo(({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по номеру чертежа"
          className="pl-10"
        />
      </div>
      
      <div className="w-full md:w-64">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Все статусы</option>
          <option value="новый">Новый</option>
          <option value="в работе">В работе</option>
          <option value="завершен">Завершен</option>
        </select>
      </div>
    </div>
  );
});

// Для отладки в React DevTools
SearchBar.displayName = 'SearchBar';

export default SearchBar;