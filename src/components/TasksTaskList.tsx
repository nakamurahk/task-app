import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore, Task as AppTask } from '../lib/useAppStore';
import { taskApi } from '../lib/api';
import TasksTaskItem from './TasksTaskItem';
import { Task } from '../types/task';
import { TasksFilterModal, TaskFilters } from './TasksFilterModal';
import type { AppState } from '../lib/useAppStore';

interface TasksTaskListProps {
  title?: string;
  tasks?: Task[];
  onAddTaskClick: () => void;
  displaySettings?: {
    show_hurdle: boolean;
    show_importance: boolean;
    show_deadline_alert: boolean;
  };
  onSettingsClick?: () => void;
}

type SortBy = 'deadline' | 'importance' | 'hurdle';

const TasksTaskList: React.FC<TasksTaskListProps> = ({
  title = 'タスク一覧',
  tasks: propTasks = [],
  onAddTaskClick,
  displaySettings,
  onSettingsClick
}) => {
  // displaySettingsがundefinedの場合は何も描画しない
  if (!displaySettings) {
    return null;
  }

  // zustandストアからタスク一覧を取得
  const tasks = useAppStore((s: AppState) => s.tasks);
  const setTasks = useAppStore((s: AppState) => s.setTasks);

  // 初回マウント時、ストアにデータがなければAPIから取得
  useEffect(() => {
    if ((!tasks || tasks.length === 0) && displaySettings) {
      taskApi.getTasks().then(setTasks).catch(console.error);
    }
  }, [tasks, setTasks, displaySettings]);

  // propsのtasksがあればそれを優先、なければzustandのtasks
  const tasksCombined: Task[] = propTasks.length > 0 ? propTasks : tasks;

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('deadline');
  const [hurdleSortState, setHurdleSortState] = useState<'none' | 'asc' | 'desc'>('none');
  const [importanceSortState, setImportanceSortState] = useState<'none' | 'asc' | 'desc'>('none');
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'incomplete',
    category: 'all',
    priority: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);

  // タスクのフィルタリングとソート処理
  const filteredTasks = useMemo(() => {
    const filtered = tasksCombined.filter((task: Task) => {
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
      return [...filtered].sort((a: Task, b: Task) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    } else if (sortBy === 'hurdle') {
      return [...filtered].sort((a: Task, b: Task) => {
        const hurdleA = a.hurdle_level || 1;
        const hurdleB = b.hurdle_level || 1;
        
        // ハードルスコアが異なる場合は、ハードルスコアでソート
        if (hurdleA !== hurdleB) {
          return hurdleSortState === 'asc' 
            ? hurdleA - hurdleB  // 昇順
            : hurdleB - hurdleA; // 降順
        }
        
        // ハードルスコアが同じ場合は、期限でソート
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    } else if (sortBy === 'importance') {
      return [...filtered].sort((a: Task, b: Task) => {
        const impOrder: Record<'low' | 'medium' | 'high', number> = { low: 1, medium: 2, high: 3 };
        const impA = impOrder[(a.importance as 'low' | 'medium' | 'high')] || 2;
        const impB = impOrder[(b.importance as 'low' | 'medium' | 'high')] || 2;
        if (impA !== impB) {
          return importanceSortState === 'asc' ? impA - impB : impB - impA;
        }
        // 同じ重要度なら日付が近い順
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    }
    return filtered;
  }, [tasksCombined, filters, sortBy, hurdleSortState, importanceSortState]);

  useEffect(() => {
    if (displaySettings) {
      setIsLoading(false);
    }
  }, [displaySettings]);

  if (isLoading) {
    return (
      <div className="task-list-header" style={{ width: '100%' }}>
        <div className="header-top">
          <h2 className="section-title">{title}</h2>
          <div className="animate-pulse w-20 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="flex gap-2 items-center w-full">
          <div className="flex gap-2 flex-1">
            <div className="animate-pulse w-16 h-8 bg-gray-200 rounded"></div>
            <div className="animate-pulse w-20 h-8 bg-gray-200 rounded"></div>
            <div className="animate-pulse w-20 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="task-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="task-item animate-pulse">
              <div className="task-content relative">
                <div className="task-details flex-1 min-w-0">
                  <div className="task-main-info">
                    <div className="task-title">
                      <span className="inline-block w-12 h-4 bg-gray-200 rounded"></span>
                      <span className="inline-block w-32 h-4 bg-gray-200 rounded ml-2"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="task-list-header" style={{ width: '100%' }}>
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
        <div className="flex gap-2 items-center w-full">
          <div className="flex gap-2 flex-1">
            <button
              className={`sort-button ${sortBy === 'deadline' ? 'active' : ''}`}
              onClick={() => setSortBy('deadline')}
            >
              期限
            </button>
            {displaySettings?.show_hurdle && (
              <button
                className={`sort-button ${sortBy === 'hurdle' ? 'active' : ''}`}
                onClick={() => {
                  if (sortBy !== 'hurdle') {
                    setSortBy('hurdle');
                    setHurdleSortState('asc');
                  } else if (hurdleSortState === 'asc') {
                    setHurdleSortState('desc');
                  } else {
                    setHurdleSortState('asc');
                  }
                }}
              >
                {hurdleSortState === 'asc' && sortBy === 'hurdle' ? 'ハードル ▲' :
                  hurdleSortState === 'desc' && sortBy === 'hurdle' ? 'ハードル ▼' : 'ハードル'}
              </button>
            )}
            {displaySettings?.show_importance && (
              <button
                className={`sort-button ${sortBy === 'importance' ? 'active' : ''}`}
                onClick={() => {
                  if (sortBy !== 'importance') {
                    setSortBy('importance');
                    setImportanceSortState('asc');
                  } else if (importanceSortState === 'asc') {
                    setImportanceSortState('desc');
                  } else {
                    setImportanceSortState('asc');
                  }
                }}
              >
                {importanceSortState === 'asc' && sortBy === 'importance' ? '重要度 ▲' :
                  importanceSortState === 'desc' && sortBy === 'importance' ? '重要度 ▼' : '重要度'}
              </button>
            )}
          </div>
          <button onClick={onSettingsClick} className="text-gray-500 hover:text-blue-500 text-base p-0.5 ml-auto"><span>⚙️</span></button>
        </div>
      </div>

      <div className="task-list" style={{ pointerEvents: 'auto', overflow: 'visible' }}>
        {filteredTasks.map((task: Task) => (
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
              displaySettings={displaySettings}
            />
          </div>
        ))}
      </div>

      <TasksFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
    </>
  );
};

export default TasksTaskList; 