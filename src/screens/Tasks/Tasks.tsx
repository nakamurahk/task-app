import React, { useState, useEffect } from 'react';
import { useTasks } from '../../contexts/TaskContext';
import { Task } from '../../types/task';
import TasksTaskList from '../../components/TasksTaskList';
import { TasksFilterModal, TaskFilters } from '../../components/TasksFilterModal';
import QuickAddTaskModal from '../../components/QuickAddTaskModal';
import SettingsDisplayDrawer from '../../components/ui/SettingsDisplayDrawer';
import { userSettingsApi } from '../../lib/api';
import { FiSettings } from 'react-icons/fi';

const Tasks: React.FC = () => {
  const { tasks: contextTasks } = useTasks();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    category: 'all',
    priority: 'all'
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [displaySettings, setDisplaySettings] = useState<{
    show_hurdle: boolean;
    show_importance: boolean;
    show_deadline_alert: boolean;
  } | null>(null);

  useEffect(() => {
    userSettingsApi.getUserSettings().then(settings => {
      setDisplaySettings({
        show_hurdle: !!settings.show_hurdle,
        show_importance: !!settings.show_importance,
        show_deadline_alert: !!settings.show_deadline_alert
      });
    });
  }, [isDrawerOpen]);

  const handleSaveDisplaySettings = async (settings: typeof displaySettings) => {
    if (!settings) return;
    await userSettingsApi.updateDisplaySettings(settings);
    setDisplaySettings(settings);
  };

  const filteredTasks = contextTasks.filter(task => {
    if (filters.status !== 'all' && 
        ((filters.status === 'completed' && task.status !== 'completed') || 
         (filters.status === 'incomplete' && task.status === 'completed'))) {
      return false;
    }
    if (filters.category !== 'all' && task.category?.name !== filters.category) {
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

  if (!displaySettings) {
    return null;
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="w-full">
        <TasksTaskList 
          tasks={filteredTasks} 
          onAddTaskClick={handleAddTaskClick} 
          displaySettings={displaySettings}
          onSettingsClick={() => setIsDrawerOpen(true)}
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
        <SettingsDisplayDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          initialSettings={displaySettings}
          onSave={handleSaveDisplaySettings}
        />
        <button 
          onClick={handleAddTaskClick}
          className="fixed bottom-20 right-4 z-50 bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
        >
          ＋
        </button>
      </div>
    </div>
  );
};

export default Tasks; 