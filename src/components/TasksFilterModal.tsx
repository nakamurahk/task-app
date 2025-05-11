import React from 'react';
import { TaskCategory, TaskPriority } from '../types/task';

interface TasksFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: TaskFilters) => void;
  initialFilters: TaskFilters;
}

export interface TaskFilters {
  status: 'all' | 'completed' | 'incomplete';
  category: 'all' | TaskCategory;
  priority: 'all' | TaskPriority;
}

export const TasksFilterModal: React.FC<TasksFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [filters, setFilters] = React.useState<TaskFilters>(initialFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">タスクフィルター</h2>
          <button
            onClick={onClose}
            className="close-button"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              完了状態
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskFilters['status'] })}
              className="task-input"
            >
              <option value="all">全て</option>
              <option value="completed">完了</option>
              <option value="incomplete">未完了</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value as TaskFilters['category'] })}
              className="task-input"
            >
              <option value="all">全て</option>
              <option value="仕事">仕事</option>
              <option value="私用">私用</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              重要度
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskFilters['priority'] })}
              className="task-input"
            >
              <option value="all">全て</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            キャンセル
          </button>
          <button
            onClick={handleApply}
            className="submit-button"
          >
            適用
          </button>
        </div>
      </div>
    </div>
  );
}; 