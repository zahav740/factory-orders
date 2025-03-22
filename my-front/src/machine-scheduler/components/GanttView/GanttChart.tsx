// src/machine-scheduler/components/GanttView/GanttChart.tsx
import React from 'react';

interface GanttChartProps {
  schedules: any[];
  startDate: Date;
  endDate: Date;
  orders: any[];
}

const GanttChart: React.FC<GanttChartProps> = (props) => {
  // Пока не используем пропсы props.schedules, props.startDate, props.endDate, props.orders
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="text-xl font-semibold mb-4">Диаграмма загрузки станков</h3>
      <div>Диаграмма Ганта</div>
    </div>
  );
};

export default GanttChart;
