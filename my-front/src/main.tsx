import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './core-ui/App'
import './index.css'

// Добавьте консоль для отладки
console.log('Инициализация приложения...');

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('Приложение отрендерено успешно');
  } catch (error) {
    console.error('Ошибка при рендеринге:', error);
  }
} else {
  console.error('Элемент #root не найден!');
}