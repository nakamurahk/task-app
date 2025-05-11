import React, { useState, useMemo } from 'react';
import { useTasks } from '../contexts/TaskContext';
import TasksTaskItem from './TasksTaskItem';
import { Task } from '../types/task';
import { TasksFilterModal, TaskFilters } from './TasksFilterModal';

interface TasksTaskListProps {
  title?: string;
  tasks?: Task[];
  onAddTaskClick: () => void;
}

type SortBy = 'deadline' | 'importance' | 'hurdle';

const TasksTaskList: React.FC<TasksTaskListProps> = ({ title = 'タスク一覧', tasks: propTasks, onAddTaskClick }) => {
  const { tasks: contextTasks, toggleTask } = useTasks();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('deadline');
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    category: 'all',
    priority: 'all'
  });

  const tasks = propTasks || contextTasks;

  // タスクのフィルタリングとソート処理
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
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

    // ソート処理
    if (sortBy === 'deadline') {
      return [...filtered].sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    } else if (sortBy === 'importance') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return [...filtered].sort((a, b) => 
        priorityOrder[a.importance as keyof typeof priorityOrder] - 
        priorityOrder[b.importance as keyof typeof priorityOrder]
      );
    } else if (sortBy === 'hurdle') {
      return [...filtered].sort((a, b) => 
        (b.hurdle_level || 1) - (a.hurdle_level || 1)
      );
    }
    return filtered;
  }, [tasks, filters, sortBy]);

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <div className="header-top">
          <h2 className="section-title">{title}</h2>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="filter-button"
          >
            フィルター
            <span className="dropdown-icon">▼</span>
          </button>
        </div>
        <div className="sort-controls !flex !flex-row !justify-end !items-center !mt-2">
          <div className="!flex !gap-2">
            <button
              className={`sort-button ${sortBy === 'deadline' ? 'active' : ''}`}
              onClick={() => setSortBy('deadline')}
            >
              期限
            </button>
            <button
              className={`sort-button ${sortBy === 'importance' ? 'active' : ''}`}
              onClick={() => setSortBy('importance')}
            >
              重要度
            </button>
            <button
              className={`sort-button ${sortBy === 'hurdle' ? 'active' : ''}`}
              onClick={() => setSortBy('hurdle')}
            >
              ハードル
            </button>
          </div>
        </div>
      </div>

      <div className="task-list" style={{ pointerEvents: 'auto' }}>
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="task-item"
            style={{
              borderLeftColor: task.category?.color || '#FFD93D'
            }}
            data-category={task.category?.name || "その他"}
          >
            <TasksTaskItem
              task={task}
              onToggle={() => toggleTask(task.id)}
            />
          </div>
        ))}
      </div>

      <button className="add-task-button" onClick={onAddTaskClick}>
        <span className="plus-icon">+</span>
      </button>

      <TasksFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
    </div>
  );
};

export default TasksTaskList; 