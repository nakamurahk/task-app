import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task } from '../types/task';
import { taskApi } from '../lib/api';

interface TaskContextType {
  tasks: Task[];
  completedTasks: Task[];
  loading: boolean;
  error: string | null;
  toggleTask: (taskId: string) => Promise<void>;
  restoreTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'completedAt'>) => Promise<void>;
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

  const toggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = await taskApi.toggleTask(taskId, !task.completed);
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? updatedTask : t))
      );
    } catch (err) {
      setError('タスクの更新に失敗しました');
      console.error(err);
    }
  };

  const restoreTask = async (taskId: string) => {
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

  const deleteTask = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError('タスクの削除に失敗しました');
      console.error(err);
    }
  };

  const addTask = async (newTask: Omit<Task, 'id' | 'completed' | 'completedAt'>) => {
    try {
      const createdTask = await taskApi.createTask(newTask);
      setTasks(prevTasks => [...prevTasks, createdTask]);
    } catch (err) {
      setError('タスクの作成に失敗しました');
      console.error(err);
    }
  };

  // 未完了タスクと完了済みタスクを分離
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <TaskContext.Provider value={{
      tasks: incompleteTasks,
      completedTasks,
      loading,
      error,
      toggleTask,
      restoreTask,
      deleteTask,
      addTask
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