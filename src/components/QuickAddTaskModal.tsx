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
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [hurdleLevel, setHurdleLevel] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [importance, setImportance] = useState<'high' | 'medium' | 'low'>('medium');
  const [isTodayTask, setIsTodayTask] = useState(false);
  const { addTask } = useTasks();
  const { user } = useAuth();

  // カテゴリー一覧を取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoryApi.getCategories();
        console.log('取得したカテゴリー:', fetchedCategories);
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
      is_today_task: isTodayTask,
      suggested_by_ai: false,
      priority_score: 0.0,
      child_order: 0,
      task_depth: 0,
      hurdle_level: hurdleLevel,
      user_id: parseInt(user.uid)
    });

    setTaskName('');
    setDueDate(new Date());
    setSelectedCategoryId(undefined);
    setHurdleLevel(1);
    setShowDetails(false);
    setEstimatedDuration(30);
    setImportance('medium');
    setIsTodayTask(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-[400px] p-2" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>タスクを追加</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            className="task-input w-full text-sm placeholder:text-gray-400"
            placeholder="タスク名を入力（例：企画書の作成）"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            autoFocus
          />

          <div className="space-y-2 max-w-[95%] mx-auto">
            <div className="mb-4">
              <div className="bg-gray-50 text-gray-700 text-sm font-semibold px-0 py-0 rounded">カテゴリー</div>
              <div className="mt-1">
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((category) => {
                    let displayColor = category.color;
                    if (category.name === '仕事') displayColor = '#2196F3';
                    else if (category.name === '私用') displayColor = '#4CAF50';
                    else if (category.name === 'その他') displayColor = '#FFB300';
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors
                          ${selectedCategoryId === category.id ? 'border-blue-400 bg-blue-100' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: displayColor || '#ccc' }}></div>
                        <span className="text-sm">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="bg-gray-50 text-gray-700 text-sm font-semibold px-0 py-0 rounded">期日</div>
              <div className="pl-3 mt-1 text-base">
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setDueDate(today);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-md border ${
                      dueDate && format(dueDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    今日
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setDueDate(tomorrow);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-md border ${
                      dueDate && format(dueDate, 'yyyy-MM-dd') === format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd')
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    明日
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const endOfWeek = new Date();
                      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
                      setDueDate(endOfWeek);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-md border ${
                      dueDate && format(dueDate, 'yyyy-MM-dd') === format(new Date(new Date().setDate(new Date().getDate() + (7 - new Date().getDay()))), 'yyyy-MM-dd')
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    今週中
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const endOfMonth = new Date();
                      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
                      endOfMonth.setDate(0);
                      setDueDate(endOfMonth);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-md border ${
                      dueDate && format(dueDate, 'yyyy-MM-dd') === format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd')
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    今月中
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueDate(undefined)}
                    className={`px-3 py-1.5 text-sm rounded-md border ${
                      !dueDate
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    いつか
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    className="block h-10 px-3 text-sm rounded-md border border-gray-300 bg-gray-50 cursor-pointer"
                    value={dueDate ? format(dueDate, 'yyyy/MM/dd', { locale: ja }) : '未設定'}
                    onClick={() => setShowCalendar(!showCalendar)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <CalendarIcon className="h-5 w-5 align-middle" />
                  </button>
                </div>
                {showCalendar && (
                  <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setShowCalendar(false)} />
                    <div className="relative bg-white rounded-lg shadow-lg">
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
                          "rounded-lg border",
                          "bg-white shadow-xm"
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="bg-gray-50 text-gray-700 text-sm font-semibold px-0 py-0 rounded">ハードル</div>
              <div className="pl-3 mt-1 text-base">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setHurdleLevel(level)}
                      className={`p-1.5 rounded-md border transition-colors ${
                        level <= hurdleLevel
                          ? 'bg-[#E6F0FF] border-[#007BFF]'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      title={
                        level === 1 ? 'やりやすい' :
                        level === 2 ? '普通' :
                        '難しい'
                      }
                    >
                      <span className={`text-xl transition-colors ${
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
            </div>

            <button
              type="button"
              className="detail-button w-full text-[#666] text-sm flex items-center justify-center gap-1 mb-8"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '🔼 詳細設定を閉じる' : '🔽 詳細設定を開く'}
            </button>

            {showDetails && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="bg-gray-50 text-gray-700 text-sm font-semibold px-0 py-0 rounded">推定時間（分）</div>
                    <div className="flex items-center mt-1">
                      <input
                        type="number"
                        className="block h-10 px-3 text-sm rounded-md border border-gray-300 bg-gray-50 w-full"
                        min="1"
                        value={estimatedDuration === 0 ? '' : estimatedDuration}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || val === undefined) {
                            setEstimatedDuration(0);
                          } else {
                            setEstimatedDuration(Number(val));
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      重要度
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { level: 'high', icon: '◎', label: '高' },
                        { level: 'medium', icon: '○', label: '中' },
                        { level: 'low', icon: '△', label: '低' }
                      ].map(({ level, icon, label }) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setImportance(level as 'high' | 'medium' | 'low')}
                          className={`flex-1 p-2 rounded-lg border transition-colors ${
                            importance === level
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-sm">{icon}</span>
                          <span className="ml-1 text-xs">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="isTodayTask"
              checked={isTodayTask}
              onChange={(e) => setIsTodayTask(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isTodayTask" className="ml-2 block text-sm text-gray-700">
              今日のタスクに入れる
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="submit-button w-full"
              disabled={!taskName.trim()}
            >
              登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddTaskModal; 