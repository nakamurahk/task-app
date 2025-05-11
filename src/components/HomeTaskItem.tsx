import React, { useState } from 'react';
import { Task } from '../types/task';

interface HomeTaskItemProps {
  task: Task;
  onToggle: () => void;
}

const HomeTaskItem: React.FC<HomeTaskItemProps> = ({ task, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  const formatDeadline = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return '今日';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明日';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  const formatDateForDisplay = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  return (
    <div className="task-item" data-category={task.category}>
      <div className="task-details">
        <div className="task-main-info">
          <div className="task-title">
            {task.deadline && (
              <span className="task-date">{formatDateForDisplay(task.deadline)}</span>
            )}
            {task.title}
            {task.deadline && (
              <span className={`deadline-dot ${task.deadline < new Date() ? 'overdue' : ''}`} />
            )}
          </div>
          <div className={`task-priority ${getPriorityClass(task.priority)}`}>
            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
          </div>
          <button className="info-button" onClick={toggleExpand} />
          <div
            className={`task-checkbox ${task.completed ? 'checked' : ''}`}
            onClick={onToggle}
          />
        </div>
        {isExpanded && (
          <div className="task-additional-info expanded">
            <div className="task-info-row">
              <span className="task-info-label">カテゴリー:</span>
              <span className="task-info-value">{task.category?.name || "その他"}</span>
            </div>
            <div className="task-info-row">
              <span className="task-info-label">所要時間:</span>
              <span className="task-info-value">{formatDuration(task.duration)}</span>
            </div>
            {task.deadline && (
              <div className="task-info-row">
                <span className="task-info-label">期限:</span>
                <span className="task-info-value">{formatDeadline(task.deadline)}</span>
              </div>
            )}
            <div className="task-info-row">
              <span className="task-info-label">難易度:</span>
              <span className="task-info-value">{task.difficulty}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeTaskItem; 