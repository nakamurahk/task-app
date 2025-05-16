import React, { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { formatDateForDisplay } from '../utils/dateUtils';
import { parseISO } from 'date-fns';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import EditTaskModal from '../components/EditTaskModal';
import DeleteTaskModal from '../components/DeleteTaskModal';
import { useSwipeable, SwipeableHandlers, SwipeEventData } from 'react-swipeable';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TasksTaskItemProps {
  task: Task;
  disableSwipe?: boolean;
  displaySettings?: {
    show_hurdle: boolean;
    show_importance: boolean;
    show_deadline_alert: boolean;
  };
}

const TasksTaskItem: React.FC<TasksTaskItemProps> = ({ 
  task, 
  disableSwipe = false, 
  displaySettings
}) => {
  if (!displaySettings) {
    return null;
  }

  const { deleteTask, updateTask } = useTasks();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const swipeHandlers = useSwipeable({
    onSwiping: (e: SwipeEventData) => {
      if (!disableSwipe && e.dir === 'Right') {
        setIsSwiping(true);
      }
    },
    onSwipedRight: () => {
      if (!disableSwipe) {
        setIsSwiping(false);
        handleAddToToday();
      }
    },
    onSwiped: () => {
      setIsSwiping(false);
    },
    trackMouse: false,
    delta: 10,
    swipeDuration: 500
  });

  useEffect(() => {
    if (displaySettings) {
      setIsLoading(false);
    }
  }, [displaySettings]);

  if (isLoading) {
    return (
      <div className="task-content relative animate-pulse">
        <div className="task-details flex-1 min-w-0">
          <div className="task-main-info">
            <div className="task-title">
              <span className="inline-block w-12 h-4 bg-gray-200 rounded"></span>
              <span className="inline-block w-32 h-4 bg-gray-200 rounded ml-2"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePointerDown = () => {
    const timer = setTimeout(() => {
      setIsEditModalOpen(true);
    }, 500);
    setPressTimer(timer);
  };

  const handlePointerUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleAddToToday = async () => {
    try {
      const updateData = {
        is_today_task: true,
        status: task.status || 'pending'
      };
      console.log('Updating task with data:', updateData);
      await updateTask(task.id, updateData);
      toast.success(
        <span>
          タスクを今日に追加しました
          <button
            style={{ marginLeft: 12, color: '#197FE5', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={async () => {
              await updateTask(task.id, { is_today_task: false });
              toast.dismiss();
            }}
          >
            元に戻す
          </button>
        </span>,
        { duration: 4000 }
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('タスクの追加に失敗しました', {
        duration: 2000,
        position: 'top-center',
      });
    }
  };

  const isCompleted = task.status === 'completed';

  return (
    <div 
      className={`task-content relative${isSwiping ? ' bg-blue-50' : ''}${isCompleted ? ' bg-gray-50' : ''}`}
      style={{
        ...(isSwiping
          ? {
              transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
              transform: 'translateX(80px)'
            }
          : {}),
        ...(isCompleted ? { opacity: 0.6, filter: 'grayscale(100%)' } : {}),
        borderLeftColor: task.category?.color ||
          (task.category?.name === '仕事' ? '#2196F3' :
           task.category?.name === '私用' ? '#4CAF50' :
           task.category?.name === 'その他' ? '#FFB300' : '#FFD93D')
      }}
      onPointerDown={isCompleted ? undefined : handlePointerDown}
      onPointerUp={isCompleted ? undefined : handlePointerUp}
      onPointerLeave={isCompleted ? undefined : handlePointerUp}
      {...(isCompleted ? {} : swipeHandlers)}
    >
      {isSwiping && !isCompleted && (
        <div className="absolute inset-0 flex items-center justify-end pr-4 text-blue-600 font-medium">
          ＋ 今日に追加
        </div>
      )}
      <div className="task-details flex-1 min-w-0">
        <div className="task-main-info">
          <div className={`task-title truncate${isCompleted ? ' line-through' : ''}`} title={task.name} style={isCompleted ? { opacity: 0.6, filter: 'grayscale(100%)' } : {}}>
            {/* MM/DD日付（常時表示・省スペース・色のみ変化） */}
            {task.due_date && (() => {
              const d = new Date(task.due_date);
              const now = new Date();
              d.setHours(0,0,0,0);
              now.setHours(0,0,0,0);
              const isOverdue = task.status !== 'completed' && d < now;
              const isToday = task.status !== 'completed' && d.getTime() === now.getTime();
              return (
                <span className={`text-xs font-bold mr-1 align-middle ${isOverdue ? 'text-red-500' : isToday ? 'text-amber-500' : 'text-gray-400'}`}>
                  {format(d, 'MM/dd')}
                </span>
              );
            })()}
            <span className="ml-1">{task.name}</span>
          </div>
          {/* ハードル・重要度 */}
          <div className="task-hurdle flex-shrink-0 ml-2 flex items-center gap-2">
            {displaySettings?.show_hurdle && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ color: '#616161', background: '#F5F5F5', border: '1px solid #BDBDBD' }}>
                ⚡×{task.hurdle_level || 1}
              </span>
            )}
            {/* 重要度バッジ */}
            {displaySettings?.show_importance && task.importance === 'high' && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">高</span>
            )}
            {displaySettings?.show_importance && task.importance === 'medium' && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#FFECB3', border: '1px solid #FBC02D', color: '#A67C00', textShadow: '0 1px 2px #fff, 0 -1px 2px #fff' }}>中</span>
            )}
            {displaySettings?.show_importance && task.importance === 'low' && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-500 border border-gray-200">低</span>
            )}
          </div>
        </div>
      </div>

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
      />

      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deleteTask(task.id);
          setIsDeleteModalOpen(false);
        }}
        taskName={task.name}
      />
    </div>
  );
};

export default TasksTaskItem; 