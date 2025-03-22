// src/machine-scheduler/components/common/LoadingState.tsx
import React from 'react';

interface LoadingStateProps {
  message: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message }) => (
  <div className="bg-gray-800 rounded-xl p-16 shadow-xl">
    <div className="flex flex-col items-center justify-center text-center">
      {/* Fancy loading spinner */}
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 right-0 bottom-0 animate-spin">
          <div className="h-full w-full rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent"></div>
        </div>
        <div className="absolute top-3 left-3 right-3 bottom-3 animate-spin animation-delay-150">
          <div className="h-full w-full rounded-full border-4 border-t-transparent border-r-indigo-400 border-b-transparent border-l-purple-400"></div>
        </div>
        <div className="absolute top-6 left-6 right-6 bottom-6 animate-pulse">
          <div className="h-full w-full rounded-full bg-indigo-900/50"></div>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mt-6 mb-2 text-white">{message}</h3>
      <p className="text-gray-400">
        Пожалуйста, подождите, идет загрузка данных...
      </p>
    </div>
  </div>
);

export default LoadingState;