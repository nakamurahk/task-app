import React from 'react';
import TasksTaskList from '../components/TasksTaskList';
import { TasksFilterModal, TaskFilters } from '../components/TasksFilterModal';
import { useTasks } from '../contexts/TaskContext';

const Tasks: React.FC = () => {
  const { tasks } = useTasks();
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<TaskFilters>({
    status: 'all',
    category: 'all',
    priority: 'all'
  });

  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && 
        ((filters.status === 'completed' && !task.completed) || 
         (filters.status === 'incomplete' && task.completed))) {
      return false;
    }
    if (filters.category !== 'all' && task.category !== filters.category) {
      return false;
    }
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }
    return true;
  });

  const handleAddTaskClick = () => {
    // タスク追加モーダルを開く処理をここに追加
    console.log('タスク追加ボタンがクリックされました');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TasksTaskList title="タスク一覧" tasks={filteredTasks} onAddTaskClick={handleAddTaskClick} />

      <TasksFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
    </div>
  );
};

export default Tasks; 