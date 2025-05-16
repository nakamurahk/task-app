import React from 'react';
import TaskAnalytics from '../components/TaskAnalytics';

const Analyze: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">タスク分析</h1>
      <TaskAnalytics />
    </div>
  );
};

export default Analyze; 