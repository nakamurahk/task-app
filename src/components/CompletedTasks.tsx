import React, { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { Task } from '../types/task';

const CompletedTasks: React.FC = () => {
  const { completedTasks, restoreTask, deleteTask } = useTasks();
  const [showWeek, setShowWeek] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  const todayTasks = completedTasks.filter(task => {
    const completedDate = new Date(task.completedAt!);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });

  const weekTasks = completedTasks.filter(task => {
    const completedDate = new Date(task.completedAt!);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate >= oneWeekAgo && completedDate < today;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTask = (task: Task) => (
    <div className="completed-task-item" key={task.id}>
      <div className="completed-task-content">
        <span className="completed-task-title">{task.title}</span>
        <span className="completed-task-time">
          {formatDate(new Date(task.completedAt!))}
        </span>
      </div>
      <div className="completed-task-actions">
        <button 
          className="restore-button"
          onClick={() => restoreTask(task.id)}
        >
          復元
        </button>
        <button 
          className="delete-button"
          onClick={() => deleteTask(task.id)}
        >
          削除
        </button>
      </div>
    </div>
  );

  return (
    <div className="completed-tasks-section">
      {todayTasks.length > 0 && (
        <div className="completed-tasks-group">
          <h4 className="completed-tasks-subtitle">今日の完了</h4>
          {todayTasks.map(renderTask)}
        </div>
      )}

      {weekTasks.length > 0 && (
        <div className="completed-tasks-group">
          <div className="completed-tasks-header">
            <h4 className="completed-tasks-subtitle">今週の完了</h4>
            <button 
              className="toggle-button"
              onClick={() => setShowWeek(!showWeek)}
            >
              {showWeek ? '今週の完了済みを隠す' : '今週の完了済みを表示'}
            </button>
          </div>
          {showWeek && weekTasks.map(renderTask)}
        </div>
      )}
    </div>
  );
};

export default CompletedTasks; 