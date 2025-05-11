import express from 'express';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

// Request型の拡張
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Firebase Admin SDKの初期化
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

// CORSの設定
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// JSONパーサーの設定
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// 認証ミドルウェア
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;

    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // ✅ users テーブルに存在しなければ登録
    try {
      const checkUser = db.prepare('SELECT COUNT(*) as count FROM users WHERE id = ?').get(uid) as { count: number };
      if (checkUser.count === 0) {
        db.prepare('INSERT INTO users (id, email, auth_provider) VALUES (?, ?, ?)').run(
          uid,
          email,
          decodedToken.firebase?.sign_in_provider || 'email'
        );
        console.log(`👤 新規ユーザー登録: ${uid}`);

        // ⚙️ user_settings テーブルにも初期レコード作成
        db.prepare(`
          INSERT INTO user_settings (
            user_id,
            daily_task_limit,
            theme_mode,
            medication_effect_mode_on,
            default_sort_option,
            ai_aggressiveness_level,
            is_medication_taken,
            effect_start_time,
            effect_duration_minutes,
            time_to_max_effect_minutes,
            time_to_fade_minutes,
            ai_suggestion_enabled,
            onboarding_completed,
            show_completed_tasks,
            daily_reminder_enabled
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          uid,
          5,              // daily_task_limit
          'default',      // theme_mode
          0,              // medication_effect_mode_on
          'created_at_desc', // default_sort_option
          1,              // ai_aggressiveness_level
          1,              // is_medication_taken
          '08:00',        // effect_start_time
          600,            // effect_duration_minutes
          60,             // time_to_max_effect_minutes
          540,            // time_to_fade_minutes
          1,              // ai_suggestion_enabled
          0,              // onboarding_completed
          1,              // show_completed_tasks
          1               // daily_reminder_enabled
        );
        console.log(`⚙️ user_settings 初期化完了: ${uid}`);
      }
    } catch (err) {
      console.error('❌ usersテーブル登録中にエラー:', err);
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: '無効なトークンです' });
  }
};

// データベースの初期化
const db = new Database('task_manager.db', { verbose: console.log });

// デフォルトカテゴリーの登録
const defaultCategories = [
  { name: '仕事', color: '#FF6B6B', is_default: 1 },
  { name: '私用', color: '#4ECDC4', is_default: 1 },
  { name: 'その他', color: '#FFD93D', is_default: 1 }
];

try {
  const checkCategories = db.prepare('SELECT COUNT(*) as count FROM categories WHERE is_default = 1').get() as { count: number };
  if (checkCategories.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (name, color, is_default) VALUES (?, ?, ?)');
    defaultCategories.forEach(category => {
      insertCategory.run(category.name, category.color, category.is_default);
    });
    console.log('✅ デフォルトカテゴリーを登録しました');
  }
} catch (err) {
  console.error('❌ デフォルトカテゴリー登録中にエラー:', err);
}

// タスク関連のエンドポイント
app.get('/tasks', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  const userId = req.user.uid;
  
  interface TaskWithCategory {
    id: number;
    user_id: string;
    name: string;
    description: string | null;
    due_date: string | null;
    importance: string | null;
    estimated_duration_minutes: number | null;
    progress: number;
    category_id: number | null;
    status: string;
    is_deleted: number;
    is_today_task: number;
    suggested_by_ai: number;
    priority_score: number;
    child_order: number;
    task_depth: number;
    created_at: string;
    updated_at: string | null;
    completed_at: string | null;
    deleted_at: string | null;
    category_name: string | null;
    category_color: string | null;
    category_is_default: number | null;
  }

  const tasks = db.prepare(`
    SELECT t.*, c.name as category_name, c.color as category_color, c.is_default as category_is_default
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND t.is_deleted = 0
  `).all(userId) as TaskWithCategory[];

  // カテゴリー情報を整形
  const formattedTasks = tasks.map(task => ({
    ...task,
    category: task.category_id ? {
      id: task.category_id,
      name: task.category_name,
      color: task.category_color,
      is_default: task.category_is_default
    } : null
  }));

  res.json(formattedTasks);
});

app.post('/tasks', authenticateToken, (req, res) => {
  try {
    console.log('📥 POST /tasks body:', req.body);
    console.log('🔐 req.user:', req.user);

  if (!req.user) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  const userId = req.user.uid;
  const task = {
    ...req.body,
    user_id: userId,
    status: 'pending',
    progress: 0,
    is_deleted: 0,
    is_today_task: 0,
    suggested_by_ai: 0,
    priority_score: 0.0,
    child_order: 0,
    task_depth: 0,
    importance: req.body.importance || 'medium',
    estimated_duration_minutes: req.body.estimated_duration_minutes || 30,
    hurdle_level: req.body.hurdle_level || 1
  };
  
  console.log('🧾 task:', task);

  const stmt = db.prepare(`
    INSERT INTO tasks (
      user_id, name, description, due_date, importance,
      estimated_duration_minutes, progress, category_id,
      status, is_deleted, is_today_task, suggested_by_ai,
      priority_score, child_order, task_depth, hurdle_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    task.user_id,
    task.name,
    task.description,
    task.due_date,
    task.importance,
    task.estimated_duration_minutes,
    task.progress,
    task.category_id,
    task.status,
    task.is_deleted,
    task.is_today_task,
    task.suggested_by_ai,
    task.priority_score,
    task.child_order,
    task.task_depth,
    task.hurdle_level
  );

  res.status(201).json({ ...task, id: result.lastInsertRowid });
} catch (err) {
  console.error('❌ タスク作成中にエラー:', err);
  res.status(500).json({ error: 'サーバーエラー', details: err });
}
});

app.patch('/tasks/:id', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  const taskId = req.params.id;
  const userId = req.user.uid;
  const updates = req.body;

  const stmt = db.prepare(`
    UPDATE tasks SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      due_date = COALESCE(?, due_date),
      importance = COALESCE(?, importance),
      estimated_duration_minutes = COALESCE(?, estimated_duration_minutes),
      progress = COALESCE(?, progress),
      category_id = COALESCE(?, category_id),
      status = COALESCE(?, status),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ? AND is_deleted = 0
  `);

  const result = stmt.run(
    updates.name,
    updates.description,
    updates.due_date,
    updates.importance,
    updates.estimated_duration_minutes,
    updates.progress,
    updates.category_id,
    updates.status,
    taskId,
    userId
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: 'タスクが見つかりません' });
  }
  res.json({ ...updates, id: taskId });
});

app.delete('/tasks/:id', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  const taskId = req.params.id;
  const userId = req.user.uid;

  const stmt = db.prepare(`
    UPDATE tasks 
    SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND user_id = ?
  `);

  const result = stmt.run(taskId, userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'タスクが見つかりません' });
  }
  res.status(204).send();
});

app.patch('/tasks/:id/toggle', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  const taskId = req.params.id;
  const userId = req.user.uid;
  const { completed } = req.body;

  const stmt = db.prepare(`
    UPDATE tasks SET
      status = ?,
      completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ? AND is_deleted = 0
  `);

  const result = stmt.run(
    completed ? 'completed' : 'pending',
    completed ? 'completed' : 'pending',
    taskId,
    userId
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: 'タスクが見つかりません' });
  }
  res.json({ id: taskId, status: completed ? 'completed' : 'pending' });
});

// カテゴリー一覧の取得
app.get('/categories', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, name, color, is_default
      FROM categories
      WHERE user_id IS NULL OR user_id = ?
    `);
    
    const categories = stmt.all(req.user?.uid);
    res.json(categories);
  } catch (err) {
    console.error('カテゴリー取得中にエラー:', err);
    res.status(500).json({ error: 'サーバーエラー', details: err });
  }
});

// ユーザー設定関連のエンドポイント
app.get('/user-settings', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  const userId = req.user.uid;

  const settings = db.prepare(`
    SELECT * FROM user_settings WHERE user_id = ?
  `).get(userId);

  if (!settings) {
    return res.status(404).json({ error: 'ユーザー設定が見つかりません' });
  }

  res.json(settings);
});

app.patch('/user-settings/medication-effect-mode', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  const userId = req.user.uid;
  const { medication_effect_mode_on } = req.body;

  if (typeof medication_effect_mode_on !== 'number' || ![0, 1].includes(medication_effect_mode_on)) {
    return res.status(400).json({ error: '無効な値です' });
  }

  const stmt = db.prepare(`
    UPDATE user_settings 
    SET medication_effect_mode_on = ?
    WHERE user_id = ?
  `);

  try {
    stmt.run(medication_effect_mode_on, userId);
    res.json({ medication_effect_mode_on });
  } catch (err) {
    console.error('❌ 薬効モード更新中にエラー:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーが起動しました: http://localhost:${port}`);
}); 