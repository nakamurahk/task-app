import { Task, Category } from '../types/task';

const API_BASE_URL = 'http://localhost:3001';

// カテゴリー関連のAPI
export const categoryApi = {
  // カテゴリー一覧の取得
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    const [tasks, categories] = await Promise.all([
      fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
      }).then(res => res.json()),
      categoryApi.getCategories()
    ]);

    // タスクにカテゴリー情報を追加
    return tasks.map((task: Task) => ({
      ...task,
      category: categories.find((c: Category) => c.id === task.category_id)
    }));
  },

  // タスクの作成
  createTask: async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        name: task.name,
        description: task.description,
        due_date: task.due_date?.toISOString().split('T')[0],
        importance: task.importance,
        estimated_duration_minutes: task.estimated_duration_minutes,
        category_id: task.category ? parseInt(task.category, 10) : undefined
      })
    });
    if (!response.ok) {
      throw new Error('タスクの更新に失敗しました');
    }
    return response.json();
  },

  // タスクの削除
  deleteTask: async (taskId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('タスクの削除に失敗しました');
    }
  },

  // タスクの完了状態の切り替え
  toggleTask: async (taskId: number, completed: boolean): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    const response = await fetch(`${API_BASE_URL}/user-settings`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    const response = await fetch(`${API_BASE_URL}/user-settings/medication-effect-mode`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ medication_effect_mode_on: isOn ? 1 : 0 })
    });
    if (!response.ok) {
      throw new Error('薬効モードの更新に失敗しました');
    }
    return response.json();
  }
}; 