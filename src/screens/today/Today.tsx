import React, { useState, useMemo, useEffect } from 'react';
import { useTasks } from '../../contexts/TaskContext';
import FocusTime from '../../components/FocusTime';
import { Task } from '../../types/task';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { useSwipeable, SwipeableHandlers, SwipeEventData } from 'react-swipeable';
import TaskDetailModal from '../../components/TaskDetailModal';
import EditTaskModal from '../../components/EditTaskModal';
import { toast } from 'react-hot-toast';
import SettingsDisplayDrawer from '../../components/ui/SettingsDisplayDrawer';
import { userSettingsApi } from '../../lib/api';
import { format } from 'date-fns';
import { useAppStore } from '../../lib/useAppStore';

// Today専用のタスクアイテム（チェックボックスのみ、左スワイプでToday解除）
const TodayTaskItem: React.FC<{ task: Task; onToggle: (task: Task) => void; onRemoveFromToday: (task: Task) => void; displaySettings: { show_hurdle: boolean; show_importance: boolean; show_deadline_alert: boolean; }; }> = ({ task, onToggle, onRemoveFromToday, displaySettings }) => {
  const isCompleted = task.status === 'completed';
  const [isSwipingLeft, setIsSwipingLeft] = useState(false);
  const [isSwipingRight, setIsSwipingRight] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { updateTask } = useTasks();

  const handlePointerDown = () => {
    if (!isCompleted) {
      const timer = setTimeout(() => {
        setShowEditModal(true);
      }, 500);
      setPressTimer(timer);
    }
  };

  const handlePointerUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  // アンドゥ用
  const handleCompleteWithUndo = async () => {
    const now = new Date();
    await updateTask(task.id, { status: 'completed', completed_at: now });
    toast.success(
      <span>
        タスクを完了にしました
        <button
          style={{ marginLeft: 12, color: '#197FE5', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={async () => {
            await updateTask(task.id, { status: 'pending', completed_at: undefined });
            toast.dismiss();
          }}
        >
          元に戻す
        </button>
      </span>,
      { duration: 4000 }
    );
  };

  const swipeHandlers: SwipeableHandlers = useSwipeable({
    onSwiping: (e: SwipeEventData) => {
      if (e.dir === 'Left') {
        setIsSwipingLeft(true);
      }
      if (!isCompleted && e.dir === 'Right') {
        setIsSwipingRight(true);
      }
    },
    onSwipedLeft: () => {
      setIsSwipingLeft(false);
      if (isCompleted) {
        // 完了タスクを未完了に戻す
        updateTask(task.id, { status: 'pending', completed_at: undefined });
        toast.success(
          <span>
            タスクを未完了に戻しました
            <button
              style={{ marginLeft: 12, color: '#197FE5', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={async () => {
                const now = new Date();
                await updateTask(task.id, { status: 'completed', completed_at: now });
                toast.dismiss();
              }}
            >
              元に戻す
            </button>
          </span>,
          { duration: 4000 }
        );
      } else {
        onRemoveFromToday(task);
      }
    },
    onSwipedRight: () => {
      if (!isCompleted) {
        setIsSwipingRight(false);
        handleCompleteWithUndo();
      }
    },
    onSwiped: () => {
      setIsSwipingLeft(false);
      setIsSwipingRight(false);
    },
    delta: 10,
    trackMouse: true,
  });

  return (
    <>
      <div
        className={`task-item flex items-center${isCompleted ? ' bg-gray-50' : ''}`}
        style={{
          borderLeftColor: task.category?.color ||
            (task.category?.name === '仕事' ? '#2196F3' :
             task.category?.name === '私用' ? '#4CAF50' :
             task.category?.name === 'その他' ? '#FFB300' : '#FFD93D'),
          opacity: isCompleted ? 0.6 : 1,
          filter: isCompleted ? 'grayscale(100%)' : 'none',
          transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
          transform: isSwipingLeft ? 'translateX(-100%)' : isSwipingRight ? 'translateX(100px)' : 'translateX(0)',
          background: isSwipingRight ? '#E8F5E9' : isSwipingLeft ? '#FFF3E0' : undefined
        }}
        data-category={task.category?.name || 'その他'}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        {...swipeHandlers}
      >
        {/* 右スワイプ時のラベル */}
        {isSwipingRight && !isCompleted && (
          <div className="absolute left-4 text-green-600 font-bold text-sm">完了</div>
        )}
        {/* 左スワイプ時のラベル */}
        {isSwipingLeft && (
          <div className="absolute right-4 text-orange-600 font-bold text-sm">
            {isCompleted ? '未完了に戻す' : '今日から外す'}
          </div>
        )}
        <div className="task-details flex-1 min-w-0">
          <div className="task-main-info">
            <div className={`task-title truncate${isCompleted ? ' line-through' : ''}`} title={task.name}>
              {/* MM/DD日付（常時表示・省スペース・色のみ変化） */}
              {task.due_date && (() => {
                const d = new Date(task.due_date);
                const now = new Date();
                d.setHours(0,0,0,0);
                now.setHours(0,0,0,0);
                const isOverdue = task.status !== 'completed' && d < now;
                const isToday = task.status !== 'completed' && d.getTime() === now.getTime();
                return (
                  <span className={`text-xs font-bold mr-1 align-middle ${isOverdue ? 'text-red-500' : isToday ? 'text-amber-500' : 'text-gray-400'}`}>{format(d, 'MM/dd')}</span>
                );
              })()}
              <span className="ml-1">{task.name}</span>
            </div>
            <div className="task-hurdle flex-shrink-0 ml-2 flex items-center gap-2">
              {displaySettings.show_hurdle && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ color: '#616161', background: '#F5F5F5', border: '1px solid #BDBDBD' }}>
                  ⚡×{task.hurdle_level || 1}
                </span>
              )}
              {displaySettings.show_importance && task.importance === 'high' && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">高</span>
              )}
              {displaySettings.show_importance && task.importance === 'medium' && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#FFECB3', border: '1px solid #FBC02D', color: '#A67C00', textShadow: '0 1px 2px #fff, 0 -1px 2px #fff' }}>中</span>
              )}
              {displaySettings.show_importance && task.importance === 'low' && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-500 border border-gray-200">低</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        task={task}
      />
    </>
  );
};

const Today: React.FC = () => {
  const { tasks, updateTask } = useTasks();
  const [sortBy, setSortBy] = useState<'deadline' | 'hurdle' | 'importance'>('deadline');
  const [hurdleSortState, setHurdleSortState] = useState<'none' | 'asc' | 'desc'>('none');
  const [importanceSortState, setImportanceSortState] = useState<'none' | 'asc' | 'desc'>('none');
  const todayTasks = tasks.filter(task => task.is_today_task);
  const [showCompleted, setShowCompleted] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [displaySettings, setDisplaySettings] = useState<{
    show_hurdle: boolean;
    show_importance: boolean;
    show_deadline_alert: boolean;
  } | null>(null);
  const userSettings = useAppStore(s => s.userSettings);

  useEffect(() => {
    userSettingsApi.getUserSettings().then(settings => {
      setDisplaySettings({
        show_hurdle: !!settings.show_hurdle,
        show_importance: !!settings.show_importance,
        show_deadline_alert: !!settings.show_deadline_alert
      });
    });
  }, [isDrawerOpen]);

  const handleSaveDisplaySettings = async (settings: typeof displaySettings) => {
    if (!settings) return;
    await userSettingsApi.updateDisplaySettings(settings);
    setDisplaySettings(settings);
  };

  // 未完了・完了で分割
  const incompleteTasks = todayTasks.filter(t => t.status !== 'completed');
  const completedTasks = todayTasks.filter(t => t.status === 'completed');

  // displaySettingsが読み込まれるまで何も表示しない
  if (!displaySettings) {
    return null;
  }

  // ソート処理
  const sortedIncomplete = [...incompleteTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    } else if (sortBy === 'hurdle') {
      const hurdleA = a.hurdle_level || 1;
      const hurdleB = b.hurdle_level || 1;
      if (hurdleA !== hurdleB) {
        return hurdleSortState === 'asc' ? hurdleA - hurdleB : hurdleB - hurdleA;
      }
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    } else if (sortBy === 'importance') {
      const impOrder: Record<'low' | 'medium' | 'high', number> = { low: 1, medium: 2, high: 3 };
      const impA = impOrder[(a.importance as 'low' | 'medium' | 'high')] || 2;
      const impB = impOrder[(b.importance as 'low' | 'medium' | 'high')] || 2;
      if (impA !== impB) {
        return importanceSortState === 'asc' ? impA - impB : impB - impA;
      }
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    return 0;
  });

  const sortedCompleted = [...completedTasks].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
  });

  // 完了チェック切り替え
  const handleToggle = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const now = new Date();
    
    await updateTask(task.id, {
      status: newStatus,
      completed_at: newStatus === "completed" ? now : undefined
    });
  };

  // Todayから除外
  const handleRemoveFromToday = async (task: Task) => {
    await updateTask(task.id, { is_today_task: false });
  };

  // デバッグ用ログ
  console.log('全tasks', tasks);
  console.log('todayTasks', todayTasks);
  console.log('completedTasks', completedTasks);
  console.log('sortedCompleted', sortedCompleted);
  tasks.forEach(task => {
    console.log(`id=${task.id}, name=${task.name}, status=${task.status}, is_today_task=${task.is_today_task}`);
  });

  return (
    <div className="w-full px-4 py-6">
      {userSettings?.medication_effect_mode_on === 1 && <FocusTime />}
      <div className="flex items-center justify-between mb-2">
        <h2 className="section-title">今日のタスク</h2>
        <button onClick={() => setIsDrawerOpen(true)} className="text-gray-500 hover:text-blue-500 text-base p-0.5"><span>⚙️</span></button>
      </div>
      <div className="sort-controls flex flex-row justify-end items-center mt-2 mb-4 gap-2">
        <button
          className={`sort-button${sortBy === 'deadline' ? ' active' : ''}`}
          onClick={() => setSortBy('deadline')}
        >
          期限
        </button>
        {displaySettings.show_hurdle && (
          <button
            className={`sort-button${sortBy === 'hurdle' ? ' active' : ''}`}
            onClick={() => {
              if (sortBy !== 'hurdle') {
                setSortBy('hurdle');
                setHurdleSortState('asc');
              } else if (hurdleSortState === 'asc') {
                setHurdleSortState('desc');
              } else {
                setHurdleSortState('asc');
              }
            }}
          >
            {hurdleSortState === 'asc' && sortBy === 'hurdle' ? 'ハードル ▲' :
              hurdleSortState === 'desc' && sortBy === 'hurdle' ? 'ハードル ▼' : 'ハードル'}
          </button>
        )}
        {displaySettings.show_importance && (
          <button
            className={`sort-button${sortBy === 'importance' ? ' active' : ''}`}
            onClick={() => {
              if (sortBy !== 'importance') {
                setSortBy('importance');
                setImportanceSortState('asc');
              } else if (importanceSortState === 'asc') {
                setImportanceSortState('desc');
              } else {
                setImportanceSortState('asc');
              }
            }}
          >
            {importanceSortState === 'asc' && sortBy === 'importance' ? '重要度 ▲' :
              importanceSortState === 'desc' && sortBy === 'importance' ? '重要度 ▼' : '重要度'}
          </button>
        )}
      </div>
      <div className="space-y-2">
        {sortedIncomplete.map(task => (
          <TodayTaskItem key={task.id} task={task} onToggle={handleToggle} onRemoveFromToday={handleRemoveFromToday} displaySettings={displaySettings} />
        ))}
        {sortedIncomplete.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            今日のタスクはありません
          </div>
        )}
      </div>
      {sortedCompleted.length > 0 && (
        <div className="mt-10">
          <button
            className="w-full flex items-center justify-between text-base font-semibold mb-4 px-2 py-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors text-gray-500 border border-gray-100"
            onClick={() => setShowCompleted(v => !v)}
            aria-expanded={showCompleted}
          >
            <span>完了したタスク</span>
            <span className="ml-2">{showCompleted ? '▲' : '▼'}</span>
          </button>
          {showCompleted && (
            <div className="space-y-2">
              {sortedCompleted.map(task => (
                <div key={task.id} className="bg-white rounded shadow-none">
                  <TodayTaskItem task={task} onToggle={handleToggle} onRemoveFromToday={handleRemoveFromToday} displaySettings={displaySettings} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <SettingsDisplayDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        initialSettings={displaySettings}
        onSave={handleSaveDisplaySettings}
      />
    </div>
  );
};

export default Today; 