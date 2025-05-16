import React from 'react';
import { Category, TaskPriority } from '../types/task';
import { SlidersHorizontal } from 'lucide-react';

interface TasksFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: TaskFilters) => void;
  initialFilters: TaskFilters;
}

export interface TaskFilters {
  status: 'all' | 'completed' | 'incomplete';
  category: 'all' | string;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg p-6 w-[85%] max-w-[320px]">
        <div className="flex items-center gap-2 mb-6">
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold">タスクフィルター</h2>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">完了状態</h3>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskFilters['status'] })}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全て</option>
              <option value="completed">完了</option>
              <option value="incomplete">未完了</option>
            </select>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">カテゴリ</h3>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value as TaskFilters['category'] })}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全て</option>
              <option value="仕事">仕事</option>
              <option value="私用">私用</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">重要度</h3>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskFilters['priority'] })}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全て</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            適用
          </button>
        </div>
      </div>
    </div>
  );
}; 