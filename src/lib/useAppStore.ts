import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { taskApi } from './api';

// 型定義（必要に応じて拡張）
export interface User {
  id: number;
  name: string;
  email: string;
  // ...他のプロパティ
}
export interface Task {
  id: number;
  name: string;
  status: string;
  completed_at?: Date;
  // ...他のプロパティ
}
export interface UserSettings {
  effect_start_time?: string;
  effect_duration_minutes?: number;
  time_to_max_effect_minutes?: number;
  time_to_fade_minutes?: number;
  is_medication_taken?: number;
  medication_effect_mode_on?: number;
  // 必要に応じて他のプロパティも追加
}

export interface AppState {
  user: User | null;
  tasks: Task[];
  userSettings: UserSettings | null;
  isEffectModeOn: boolean;
  medicationConfig: {
    defaultTime: string;
    totalEffectDuration: number;
    onsetTime: number;
    peakOutTime: number;
  };
  setUser: (user: User | null) => void;
  setTasks: (tasks: Task[]) => void;
  setUserSettings: (settings: UserSettings | null) => void;
  setIsEffectModeOn: (on: boolean) => void;
  setMedicationConfig: (config: {
    defaultTime: string;
    totalEffectDuration: number;
    onsetTime: number;
    peakOutTime: number;
  }) => void;
  toggleTask: (taskId: number) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      tasks: [],
      userSettings: null,
      isEffectModeOn: false,
      medicationConfig: {
        defaultTime: '08:00',
        totalEffectDuration: 10,
        onsetTime: 2,
        peakOutTime: 8
      },
      setUser: (user) => set({ user }),
      setTasks: (tasks) => set({ tasks }),
      setUserSettings: (userSettings) => {
        set({ userSettings });
        // userSettingsの値からisEffectModeOnやmedicationConfigも更新
        if (userSettings) {
          set({
            isEffectModeOn: userSettings.medication_effect_mode_on === 1,
            medicationConfig: userSettings.effect_start_time ? {
              defaultTime: userSettings.effect_start_time,
              totalEffectDuration: (userSettings.effect_duration_minutes ?? 600) / 60,
              onsetTime: (userSettings.time_to_max_effect_minutes ?? 60) / 60,
              peakOutTime: ((userSettings.time_to_max_effect_minutes ?? 60) + (userSettings.time_to_fade_minutes ?? 540)) / 60
            } : get().medicationConfig
          });
        }
      },
      setIsEffectModeOn: (on) => set({ isEffectModeOn: on }),
      setMedicationConfig: (config) => set({ medicationConfig: config }),
      toggleTask: async (taskId: number) => {
        // API呼び出し
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;
        const updatedTask = await taskApi.toggleTask(taskId, task.status !== 'completed');
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updatedTask } : t
          ),
        }));
      },
    }),
    { name: 'app-storage' }
  )
); 