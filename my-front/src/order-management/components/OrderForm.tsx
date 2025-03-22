import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../../ui-components/components/Button';
import { Input } from '../../ui-components/components/Input';
import { format } from 'date-fns';

interface OrderFormProps {
  order?: any;
  onSubmit: (orderData: any) => void;
  onClose: () => void;
}

// Определим типы для событий
interface FileInputEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    files: FileList | null;
  };
}

interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    value: string;
  };
}

interface SelectChangeEvent extends React.ChangeEvent<HTMLSelectElement> {
  target: HTMLSelectElement & {
    value: string;
  };
}

const OrderForm: React.FC<OrderFormProps> = ({ order, onSubmit, onClose }) => {
  // Инициализация состояния формы
  const [formData, setFormData] = useState({
    id: order?.id || Date.now(),
    blueprintNumber: order?.blueprintNumber || '',
    quantity: order?.quantity || '',
    deadline: order?.deadline ? format(new Date(order.deadline), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    status: order?.status || 'новый',
    operations: order?.operations || [],
    pdfFile: order?.pdfFile || null,
    priority: order?.priority || 1,
    materialType: order?.materialType || '',
  });

  // Валидация формы
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Валидация при изменении данных
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.blueprintNumber.trim()) {
      newErrors.blueprintNumber = 'Номер чертежа обязателен';
    }
    
    if (!formData.quantity) {
      newErrors.quantity = 'Количество обязательно';
    } else if (Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Количество должно быть больше нуля';
    }
    
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [formData]);

  // Обработчик изменения полей формы
  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Обработчик файла PDF
  const handleFileChange = useCallback((e: FileInputEvent) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, pdfFile: file }));
  }, []);

  // Обработчик отправки формы
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(formData);
    }
  }, [formData, isFormValid, onSubmit]);

  // Обработчик добавления операции
  const addOperation = useCallback(() => {
    const newOperation = {
      id: Date.now(),
      machineId: 0,
      opNumber: formData.operations.length + 1,
      opTime: 0,
      opAxes: '3х',
    };
    
    setFormData(prev => ({
      ...prev,
      operations: [...prev.operations, newOperation],
    }));
  }, [formData.operations]);

  // Обработчик изменения операции
  const updateOperation = useCallback((opId: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      operations: prev.operations.map((op: any) =>
        op.id === opId ? { ...op, [field]: value } : op
      ),
    }));
  }, []);

  // Обработчик удаления операции
  const removeOperation = useCallback((opId: number) => {
    setFormData(prev => ({
      ...prev,
      operations: prev.operations.filter((op: any) => op.id !== opId),
    }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              {order ? 'Редактировать заказ' : 'Создать заказ'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Номер чертежа
            </label>
            <Input
              value={formData.blueprintNumber}
              onChange={(e: InputChangeEvent) => handleChange('blueprintNumber', e.target.value)}
              placeholder="Введите номер чертежа"
              error={errors.blueprintNumber}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Количество
            </label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e: InputChangeEvent) => handleChange('quantity', e.target.value)}
              placeholder="Введите количество"
              error={errors.quantity}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Срок выполнения
            </label>
            <div className="relative">
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e: InputChangeEvent) => handleChange('deadline', e.target.value)}
              />
              <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => {
                  // Программно активируем input для выбора даты
                  const input = document.querySelector('input[type="date"]');
                  if (input) {
                    (input as HTMLElement).click();
                  }
                }}
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Статус
            </label>
            <select
              value={formData.status}
              onChange={(e: SelectChangeEvent) => handleChange('status', e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="новый">Новый</option>
              <option value="в работе">В работе</option>
              <option value="завершен">Завершен</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Приоритет
            </label>
            <select
              value={formData.priority}
              onChange={(e: SelectChangeEvent) => handleChange('priority', parseInt(e.target.value))}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1">Обычный (1)</option>
              <option value="2">Высокий (2)</option>
              <option value="3">Срочный (3)</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Материал
            </label>
            <Input
              value={formData.materialType}
              onChange={(e: InputChangeEvent) => handleChange('materialType', e.target.value)}
              placeholder="Тип материала"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Чертеж (PDF файл)
            </label>
            <div className="flex items-center">
              <input
                type="file"
                onChange={handleFileChange as any} // Используем cast к any как временное решение
                className="hidden"
                id="pdf-upload"
                accept=".pdf"
              />
              <label 
                htmlFor="pdf-upload"
                className="cursor-pointer bg-gray-700 text-white py-2 px-4 rounded border border-gray-600 hover:bg-gray-600"
              >
                Выбрать файл
              </label>
              <span className="ml-2 text-gray-300 text-sm">
                {formData.pdfFile ? formData.pdfFile.name || 'Файл выбран' : 'Файл не выбран'}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-300 text-sm font-medium">
                Операции
              </label>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={addOperation} 
                type="button"
              >
                Добавить операцию
              </Button>
            </div>
            
            {formData.operations.length === 0 ? (
              <p className="text-gray-400 text-center py-4 bg-gray-700 rounded">
                Нет операций. Добавьте операцию для заказа.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.operations.map((op: any) => (
                  <div key={op.id} className="bg-gray-700 p-3 rounded relative">
                    <button
                      type="button"
                      onClick={() => removeOperation(op.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-300 text-xs font-medium mb-1">
                          Номер операции
                        </label>
                        <Input
                          type="number"
                          value={op.opNumber}
                          onChange={(e: InputChangeEvent) => updateOperation(op.id, 'opNumber', Number(e.target.value))}
                          placeholder="№"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-xs font-medium mb-1">
                          Оси
                        </label>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className={`px-3 py-2 rounded text-sm ${op.opAxes === '3х' ? 'bg-indigo-600' : 'bg-gray-600'}`}
                            onClick={() => updateOperation(op.id, 'opAxes', '3х')}
                          >
                            3х
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-2 rounded text-sm ${op.opAxes === '4х' ? 'bg-indigo-600' : 'bg-gray-600'}`}
                            onClick={() => updateOperation(op.id, 'opAxes', '4х')}
                          >
                            4х
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-2 rounded text-sm ${op.opAxes === 'токарный' ? 'bg-indigo-600' : 'bg-gray-600'}`}
                            onClick={() => updateOperation(op.id, 'opAxes', 'токарный')}
                          >
                            Токарный
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-xs font-medium mb-1">
                          Время (мин)
                        </label>
                        <Input
                          type="number"
                          value={op.opTime}
                          onChange={(e: InputChangeEvent) => updateOperation(op.id, 'opTime', Number(e.target.value))}
                          placeholder="Время"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-xs font-medium mb-1">
                          Станок
                        </label>
                        <select
                          value={op.machineId}
                          onChange={(e: SelectChangeEvent) => updateOperation(op.id, 'machineId', Number(e.target.value))}
                          className="w-full p-2 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="0">Выберите станок</option>
                          <option value="1">Doosan Hadasha (3х, 4х)</option>
                          <option value="2">Doosan Yashana (3х, 4х)</option>
                          <option value="3">Pinnacle Gdola (3х, 4х)</option>
                          <option value="4">Pinnacle Ktana (3х)</option>
                          <option value="5">Mitsubishi (3х)</option>
                          <option value="6">Okuma (токарный)</option>
                          <option value="7">JohnFord (токарный)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
            <Button variant="secondary" onClick={onClose} type="button">
              Отмена
            </Button>
            <Button variant="primary" type="submit" disabled={!isFormValid}>
              {order ? 'Сохранить изменения' : 'Создать заказ'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;