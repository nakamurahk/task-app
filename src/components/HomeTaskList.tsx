import React from 'react';
import { useAppStore, AppState } from '../lib/useAppStore';
import { Task } from '../types/task';
import HomeTaskItem from './HomeTaskItem';

interface HomeTaskListProps {
  onAddTaskClick: () => void;
}

const HomeTaskList: React.FC<HomeTaskListProps> = ({ onAddTaskClick }) => {
  const tasks = useAppStore((s: AppState) => s.tasks);
  const toggleTask = useAppStore((s: AppState) => s.toggleTask);
  // is_today_taskがtrueのタスクのみをフィルタリング
  const todayTasks = tasks.filter((task: Task) => task.is_today_task);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">今日のタスク</h2>
        <button
          onClick={onAddTaskClick}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ＋ タスクを追加
        </button>
      </div>

      {todayTasks.length > 0 ? (
        <div className="space-y-2">
          {todayTasks.map((task: Task) => (
            <HomeTaskItem 
              key={task.id} 
              task={task} 
              onToggle={() => toggleTask(task.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            今日のタスクはまだ選ばれていません
          </p>
          <button
            onClick={onAddTaskClick}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            タスクを追加する
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeTaskList; 