import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Task } from '../types/task';
import { useTasks } from '../contexts/TaskContext';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task }) => {
  const { updateTask, deleteTask } = useTasks();
  const [formData, setFormData] = useState({
    name: task.name,
    due_date: task.due_date || '',
    importance: task.importance,
    estimated_duration_minutes: task.estimated_duration_minutes || 30,
    hurdle_level: task.hurdle_level || 1,
    memo: task.memo || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTask(task.id, formData);
      onClose();
    } catch (error) {
      console.error('タスクの更新に失敗しました:', error);
    }
  };

  const handleDelete = () => {
    if (confirm("このタスクを本当に削除しますか？")) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  タスクを編集
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="bg-gray-50 text-gray-700 text-sm font-semibold px-2 py-1 rounded mb-1">タスク名</div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <div className="bg-gray-50 text-gray-700 text-sm font-semibold px-2 py-1 rounded mb-1">期限</div>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="bg-gray-50 text-gray-700 text-sm font-semibold px-2 py-1 rounded mb-1">ハードルレベル</div>
                    <div className="flex items-center gap-2 mt-1">
                      {[1, 2, 3].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({ ...formData, hurdle_level: level })}
                          className={`p-1.5 rounded-md border transition-colors ${
                            level <= formData.hurdle_level
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
                            level <= formData.hurdle_level
                              ? 'text-yellow-500 drop-shadow-[0_0_2px_rgba(234,179,8,0.3)]'
                              : 'text-gray-300 opacity-30 filter grayscale'
                          }`}>
                            ⚡
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="bg-gray-50 text-gray-700 text-sm font-semibold px-2 py-1 rounded mb-1">所要時間（分）</div>
                    <input
                      type="number"
                      value={formData.estimated_duration_minutes}
                      onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <div className="bg-gray-50 text-gray-700 text-sm font-semibold px-2 py-1 rounded mb-1">重要度</div>
                    <div className="flex items-center gap-2 mt-1">
                      {[
                        { level: 'high', icon: '◎', label: '高' },
                        { level: 'medium', icon: '○', label: '中' },
                        { level: 'low', icon: '△', label: '低' }
                      ].map(({ level, icon, label }) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({ ...formData, importance: level as 'high' | 'medium' | 'low' })}
                          className={`flex-1 p-2 rounded-lg border transition-colors ${
                            formData.importance === level
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

                  <div>
                    <div className="bg-gray-50 text-gray-700 text-sm font-semibold px-2 py-1 rounded mb-1">メモ（任意）</div>
                    <textarea
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                      rows={3}
                      placeholder="自由記述（任意）"
                      value={formData.memo}
                      onChange={e => setFormData({ ...formData, memo: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      className="w-full bg-red-100 text-red-600 border border-red-200 py-2 px-4 rounded focus:outline-none transition-colors"
                      style={{
                        fontWeight: 'bold',
                        maxWidth: 80
                      }}
                      onMouseOver={e => e.currentTarget.classList.add('bg-red-200')}
                      onMouseOut={e => e.currentTarget.classList.remove('bg-red-200')}
                      onClick={handleDelete}
                    >
                      削除
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        style={{ minWidth: 80, maxWidth: 80 }}
                      >
                        保存
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditTaskModal; 