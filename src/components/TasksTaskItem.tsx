import React, { useState } from 'react';
import { Task } from '../types/task';
import { formatDateForDisplay, formatDuration } from '../utils/dateUtils';
import { parseISO } from 'date-fns';

interface TasksTaskItemProps {
  task: Task;
}

const TasksTaskItem: React.FC<TasksTaskItemProps> = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getPriorityClass = (importance: string) => {
    switch (importance) {
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

  const renderHurdleLevel = (level: number) => {
    return '⚡'.repeat(level);
  };

  return (
    <div className="task-content">
      <div className="task-details">
        <div className="task-main-info">
          <div className="task-title">
            {task.due_date && (
              <span className="task-date">{formatDateForDisplay(task.due_date)}</span>
            )}
            {task.name}
            {task.due_date && (
              <span className={`deadline-dot ${parseISO(task.due_date) < new Date() ? 'overdue' : ''}`} />
            )}
          </div>
          <div className="task-hurdle">
            {renderHurdleLevel(task.hurdle_level || 1)}
          </div>
          <button className={`info-button ${isExpanded ? 'expanded' : ''}`} onClick={toggleExpand}>
            {isExpanded ? '🔼' : '🔽'}
          </button>
        </div>
        {isExpanded && (
          <div className="task-additional-info expanded">
            <div className="task-info-row">
              <span className="task-info-label">カテゴリー:</span>
              <span className="task-info-value">{task.category?.name || "その他"}</span>
            </div>
            <div className="task-info-row">
              <span className="task-info-label">所要時間:</span>
              <span className="task-info-value">{formatDuration(task.estimated_duration_minutes)}</span>
            </div>
            <div className="task-info-row">
              <span className="task-info-label">重要度:</span>
              <span className="task-info-value">{task.importance === 'high' ? '高' : task.importance === 'medium' ? '中' : '低'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksTaskItem; 