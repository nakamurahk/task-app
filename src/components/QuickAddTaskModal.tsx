import React, { useState, useEffect } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { Task, Category } from '../types/task';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from 'lucide-react';
import { categoryApi } from '../lib/api';

interface QuickAddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickAddTaskModal: React.FC<QuickAddTaskModalProps> = ({ isOpen, onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [hurdleLevel, setHurdleLevel] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [importance, setImportance] = useState<'high' | 'medium' | 'low'>('medium');
  const { addTask } = useTasks();
  const { user } = useAuth();

  // カテゴリー一覧を取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoryApi.getCategories();
        setCategories(fetchedCategories);
        // 仕事カテゴリーをデフォルトで選択
        const workCategory = fetchedCategories.find(cat => cat.name === '仕事');
        if (workCategory) {
          setSelectedCategoryId(workCategory.id);
        }
      } catch (error) {
        console.error('カテゴリーの取得に失敗しました:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || !user) return;

    addTask({
      name: taskName.trim(),
      description: '',
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
      importance: importance,
      estimated_duration_minutes: estimatedDuration,
      category_id: selectedCategoryId,
      status: 'pending',
      progress: 0,
      is_deleted: false,
      is_today_task: false,
      suggested_by_ai: false,
      priority_score: 0.0,
      child_order: 0,
      task_depth: 0,
      hurdle_level: hurdleLevel,
      user_id: parseInt(user.uid),
      created_at: new Date()
    });

    setTaskName('');
    setDueDate(new Date());
    setSelectedCategoryId(undefined);
    setHurdleLevel(1);
    setShowDetails(false);
    setEstimatedDuration(30);
    setImportance('medium');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>タスクを追加</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              タスク名
            </label>
            <input
              type="text"
              className="task-input w-full"
              placeholder="例：企画書の作成"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              カテゴリー
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(selectedCategoryId === category.id ? undefined : category.id)}
                  className={`p-2 rounded-lg border transition-colors ${
                    selectedCategoryId === category.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              期日
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                className="task-input w-full bg-gray-50 pr-10"
                value={format(dueDate, 'yyyy/MM/dd', { locale: ja })}
              />
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex items-center justify-center h-full"
              >
                <CalendarIcon className="h-6 w-6" />
              </button>
            </div>
            {showCalendar && (
              <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg border">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      setDueDate(date);
                      setShowCalendar(false);
                    }
                  }}
                  className={cn(
                    "rounded-lg border p-2",
                    "bg-white shadow-sm"
                  )}
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              ハードル
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setHurdleLevel(level)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <span className={`text-2xl transition-colors ${
                    level <= hurdleLevel 
                      ? 'text-yellow-500 drop-shadow-[0_0_2px_rgba(234,179,8,0.3)]' 
                      : 'text-gray-300 opacity-30 filter grayscale'
                  }`}>
                    ⚡
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="detail-button w-full mt-2"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '詳細を隠す' : `詳細を入力⚙️（${estimatedDuration}分・${importance === 'high' ? '高' : importance === 'medium' ? '中' : '低'}）`}
          </button>

          {showDetails && (
            <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  推定時間（分）
                </label>
                <input
                  type="number"
                  className="task-input w-full"
                  min="1"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  重要度
                </label>
                <div className="flex items-center gap-2">
                  {['high', 'medium', 'low'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setImportance(level as 'high' | 'medium' | 'low')}
                      className={`p-2 rounded-lg border transition-colors ${
                        importance === level
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {level === 'high' ? '高' : level === 'medium' ? '中' : '低'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="submit-button w-full mt-4"
            disabled={!taskName.trim()}
          >
            登録
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickAddTaskModal; 