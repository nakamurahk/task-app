import { Task, Category } from '../types/task';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// カテゴリー関連のAPI
export const categoryApi = {
  // カテゴリー一覧の取得
  getCategories: async (): Promise<Category[]> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('カテゴリーの取得に失敗しました');
    }
    return response.json();
  }
};

// タスク関連のAPI
export const taskApi = {
  // タスク一覧の取得
  getTasks: async (): Promise<Task[]> => {
    const token = await auth.currentUser?.getIdToken();
    const [tasks, categories] = await Promise.all([
      fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      }).then(res => res.json()),
      categoryApi.getCategories()
    ]);

    // デバッグ: APIから受け取ったtasks配列の長さと内容を出力
    console.log('APIから受け取ったtasks件数:', tasks.length);
    console.log('APIから受け取ったtasks:', tasks);
    // タスクにカテゴリー情報を追加
    return tasks.map((task: Task) => ({
      ...task,
      is_today_task: !!task.is_today_task,
      status: String(task.status) === '1' ? 'completed' : (String(task.status) === '0' ? 'pending' : task.status),
      category: categories.find((c: Category) => c.id === task.category_id)
    }));
  },

  // タスクの作成
  createTask: async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: task.name,
        description: task.description,
        due_date: task.due_date,
        importance: task.importance,
        estimated_duration_minutes: task.estimated_duration_minutes,
        category_id: task.category_id ? parseInt(String(task.category_id), 10) : null,
        hurdle_level: task.hurdle_level || 1
      })
    });
    if (!response.ok) {
      throw new Error('タスクの作成に失敗しました');
    }
    return response.json();
  },

  // タスクの更新
  updateTask: async (taskId: number, task: Partial<Task> & { category?: string }): Promise<Task> => {
    const token = await auth.currentUser?.getIdToken();
    const requestBody = Object.entries(task).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        if (key === 'category') {
          acc.category_id = parseInt(value as string, 10);
        } else if (key === 'is_today_task') {
          acc[key] = value ? 1 : 0;
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    console.log('Sending update request with body:', requestBody);
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Update task failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error('タスクの更新に失敗しました');
    }
    return response.json();
  },

  // タスクの削除
  deleteTask: async (taskId: number): Promise<void> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('タスクの削除に失敗しました');
    }
  },

  // タスクの完了状態の切り替え
  toggleTask: async (taskId: number, completed: boolean): Promise<Task> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ completed })
    });
    if (!response.ok) {
      throw new Error('タスクの更新に失敗しました');
    }
    return response.json();
  }
};

// ユーザー設定関連のAPI
export const userSettingsApi = {
  // ユーザー設定の取得
  getUserSettings: async () => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/user-settings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('ユーザー設定の取得に失敗しました');
    }
    return response.json();
  },

  // 薬効モードの更新
  updateMedicationEffectMode: async (isOn: boolean) => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/user-settings/medication-effect-mode`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ medication_effect_mode_on: isOn ? 1 : 0 })
    });
    if (!response.ok) {
      throw new Error('薬効モードの更新に失敗しました');
    }
    return response.json();
  },

  // 薬効モードの設定値を更新
  updateMedicationConfig: async (config: {
    effect_start_time: string;
    effect_duration_minutes: number;
    time_to_max_effect_minutes: number;
    time_to_fade_minutes: number;
  }) => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/user-settings/medication-config`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(config)
    });
    if (!response.ok) {
      throw new Error('薬効モードの設定値の更新に失敗しました');
    }
    return response.json();
  },

  // 表示項目の設定をまとめて更新
  updateDisplaySettings: async (settings: {
    show_hurdle?: boolean;
    show_importance?: boolean;
    show_deadline_alert?: boolean;
  }) => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/user-settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    if (!response.ok) {
      throw new Error('表示項目設定の更新に失敗しました');
    }
    return response.json();
  }
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
} 