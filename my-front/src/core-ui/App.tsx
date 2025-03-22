import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import './styles/index.css';
import '../core-ui/styles/index.css'; // Проверьте правильность пути

// Используем динамический импорт с корректными путями
const OrdersPage = lazy(() => import('../order-management/components/OrdersPage'));
const CalculationPage = lazy(() => import('../schedule-calculator/components/CalculationPage'));
const MachineScheduleCalendar = lazy(() => import('../machine-scheduler/components/MachineScheduleCalendar'));
const HomePage = lazy(() => import('./components/HomePage'));

const App: React.FC = () => (
  <div className="app-container">
    <Router>
      <Navbar />
      <div className="content-wrapper">
        <Suspense fallback={<div className="loader">Загрузка...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/calculation" element={<CalculationPage />} />
            <Route path="/calendar" element={<MachineScheduleCalendar />} />
            <Route path="/about" element={<div className="p-6 text-white">О системе</div>} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  </div>
);

export default App;