import React, { useState } from 'react';
import TasksTaskList from './TasksTaskList';
import QuickAddTaskModal from './QuickAddTaskModal';

const Tasks: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="tasks-page">
      <TasksTaskList onAddTaskClick={() => setIsModalOpen(true)} />
      <QuickAddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Tasks; 