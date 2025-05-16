import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Category } from '../types/task';
import { taskApi } from '../lib/api';
import { categoryApi } from '../lib/api';

interface TaskContextType {
  tasks: Task[];
  completedTasks: Task[];
  loading: boolean;
  error: string | null;
  toggleTask: (taskId: number) => Promise<void>;
  restoreTask: (taskId: number) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  updateTask: (taskId: number, task: Partial<Task> & { category?: string }) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // タスク一覧の取得
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await taskApi.getTasks();
        setTasks(fetchedTasks);
      } catch (err) {
        setError('タスクの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const toggleTask = async (taskId: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = await taskApi.toggleTask(taskId, task.status !== 'completed');
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? updatedTask : t))
      );
    } catch (err) {
      setError('タスクの更新に失敗しました');
      console.error(err);
    }
  };

  const restoreTask = async (taskId: number) => {
    try {
      const updatedTask = await taskApi.toggleTask(taskId, false);
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? updatedTask : t))
      );
    } catch (err) {
      setError('タスクの更新に失敗しました');
      console.error(err);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError('タスクの削除に失敗しました');
      console.error(err);
    }
  };

  const updateTask = async (taskId: number, updatedTask: Partial<Task> & { category?: string }) => {
    try {
      const task = await taskApi.updateTask(taskId, updatedTask);
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? { ...t, ...task } : t))
      );
    } catch (err) {
      setError('タスクの更新に失敗しました');
      console.error(err);
    }
  };

  const addTask = async (newTask: Omit<Task, 'id' | 'created_at'>) => {
    try {
      const createdTask = await taskApi.createTask(newTask);
      // カテゴリー情報を付与
      let categoryObj: Category | undefined = undefined;
      try {
        const categories = await categoryApi.getCategories();
        categoryObj = categories.find(cat => cat.id === createdTask.category_id);
      } catch (e) {
        // カテゴリー取得失敗時は何もしない
      }
      setTasks(prevTasks => [
        ...prevTasks,
        categoryObj ? { ...createdTask, category: categoryObj } : createdTask
      ]);
    } catch (err) {
      setError('タスクの作成に失敗しました');
      console.error(err);
    }
  };

  // 未完了タスクと完了済みタスクを分離
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <TaskContext.Provider value={{
      tasks,
      completedTasks,
      loading,
      error,
      toggleTask,
      restoreTask,
      deleteTask,
      addTask,
      updateTask
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}; 