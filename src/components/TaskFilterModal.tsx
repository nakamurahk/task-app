import React from 'react';
import { Task, TaskCategory, TaskPriority } from '../types/task';

interface TaskFilterModalProps {
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

export const TaskFilterModal: React.FC<TaskFilterModalProps> = ({
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">タスクフィルター</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
            >
              <option value="all">全て</option>
              <option value="仕事">仕事</option>
              <option value="私用">私用</option>
              <option value="健康">健康</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              重要度
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskFilters['priority'] })}
              className="w-full p-2 border rounded"
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            適用
          </button>
        </div>
      </div>
    </div>
  );
}; 