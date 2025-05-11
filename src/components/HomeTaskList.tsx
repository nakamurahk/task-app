import React, { useMemo } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { useAppContext } from '../contexts/AppContext';
import HomeTaskItem from './HomeTaskItem';
import CompletedTasks from './CompletedTasks';

interface HomeTaskListProps {
  onAddTaskClick: () => void;
}

const HomeTaskList: React.FC<HomeTaskListProps> = ({ onAddTaskClick }) => {
  const { tasks, toggleTask } = useTasks();
  const { selectedTasks } = useAppContext();

  // タスクのメモ化
  const displayTasks = useMemo(() => {
    // selectedTasksが存在する場合のみ表示
    return selectedTasks.map((task, index) => ({
      ...task,
      originalIndex: index
    }));
  }, [selectedTasks]);

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2 className="section-title">今日のタスク</h2>
        <div className="text-sm text-gray-500 mt-1">
          <p>・今日やるタスクを表示する欄です（予定）</p>
          <p>・AIが推薦するか、手動でタスク一覧からスワイプで持ち込んだタスクを表示します（予定）</p>
        </div>
      </div>

      {displayTasks.length > 0 && (
        <div className="task-list">
          {displayTasks.map((task, index) => (
            <div
              key={`task-${task.id}`}
              style={{
                borderLeftColor: task.category?.color || '#FFD93D',
                cursor: 'default',
                pointerEvents: 'auto'
              }}
              data-category={task.category?.name || "その他"}
            >
              <HomeTaskItem
                task={task}
                onToggle={() => toggleTask(task.id)}
              />
            </div>
          ))}
        </div>
      )}

      <CompletedTasks />
    </div>
  );
};

export default HomeTaskList; 