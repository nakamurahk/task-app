import React, { useState } from 'react';
import { useTasks } from '../../contexts/TaskContext';
import { Task } from '../../types/task';
import TasksTaskList from '../../components/TasksTaskList';
import { TasksFilterModal, TaskFilters } from '../../components/TasksFilterModal';
import QuickAddTaskModal from '../../components/QuickAddTaskModal';

const Tasks: React.FC = () => {
  const { tasks: contextTasks } = useTasks();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    category: 'all',
    priority: 'all'
  });

  const filteredTasks = contextTasks.filter(task => {
    if (filters.status !== 'all' && 
        ((filters.status === 'completed' && task.status !== 'completed') || 
         (filters.status === 'incomplete' && task.status === 'completed'))) {
      return false;
    }
    if (filters.category !== 'all' && task.category_id !== filters.category) {
      return false;
    }
    if (filters.priority !== 'all' && task.importance !== filters.priority) {
      return false;
    }
    return true;
  });

  const handleAddTaskClick = () => {
    setIsAddTaskModalOpen(true);
  };

  return (
    <div className="tasks-page">
      <div className="tasks-content">
        <TasksTaskList 
          title="タスク一覧" 
          tasks={filteredTasks} 
          onAddTaskClick={handleAddTaskClick} 
        />

        <TasksFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={setFilters}
          initialFilters={filters}
        />

        <QuickAddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Tasks; 