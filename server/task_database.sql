DROP VIEW IF EXISTS task_hierarchy_view;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS ai_suggestion_logs;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS daily_conditions;
DROP TABLE IF EXISTS medication_effects;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS recurring_tasks;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS users;
DROP INDEX IF EXISTS idx_tasks_user;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_tasks_category;
DROP INDEX IF EXISTS idx_activity_logs_user;
DROP INDEX IF EXISTS idx_medication_effects_user;
DROP INDEX IF EXISTS idx_daily_conditions_user;
DROP INDEX IF EXISTS idx_ai_suggestion_logs_user;
DROP INDEX IF EXISTS idx_ai_suggestion_logs_task;
DROP INDEX IF EXISTS idx_ai_suggestion_logs_type;
DROP INDEX IF EXISTS idx_ai_suggestion_logs_feedback;
DROP INDEX IF EXISTS idx_reminders_user;
DROP INDEX IF EXISTS idx_reminders_task;
DROP INDEX IF EXISTS idx_reminders_scheduled_time;
DROP INDEX IF EXISTS idx_reminders_delivery_status;
DROP INDEX IF EXISTS idx_recurring_tasks_user;
DROP INDEX IF EXISTS idx_recurring_tasks_category;
DROP INDEX IF EXISTS idx_recurring_tasks_start_date;
DROP INDEX IF EXISTS idx_recurring_tasks_recurrence_end_date;

CREATE TABLE users (
    id TEXT PRIMARY KEY,  -- ← Firebase UIDをそのまま主キーに
    email TEXT NOT NULL,
    password_hash TEXT,
    name TEXT,
    auth_provider TEXT NOT NULL,         -- 'email', 'google', 'apple'
    google_sub_id TEXT,
    apple_sub_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    daily_task_limit INTEGER DEFAULT 5,
    theme_mode TEXT DEFAULT 'default',
    medication_effect_mode_on BOOLEAN DEFAULT 0,
    default_sort_option TEXT DEFAULT 'created_at_desc',
    ai_aggressiveness_level INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    is_default BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE recurring_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    recurrence_rule TEXT NOT NULL,
    recurrence_end_date DATE,
    category_id INTEGER,
    importance TEXT DEFAULT 'medium',
    estimated_duration_minutes INTEGER,
    default_reminder_offset_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    importance TEXT DEFAULT 'medium',
    estimated_duration_minutes INTEGER,
    progress INTEGER DEFAULT 0,
    parent_task_id INTEGER,
    category_id INTEGER,
    is_deleted BOOLEAN DEFAULT 0,
    deleted_at TIMESTAMP,
    is_today_task BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMP,
    recurrence_rule TEXT,
    suggested_by_ai BOOLEAN DEFAULT 0,
    priority_score FLOAT DEFAULT 0.0,
    child_order INTEGER DEFAULT 0,
    task_depth INTEGER DEFAULT 0,
    task_path TEXT,
    parent_recurring_task_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (parent_recurring_task_id) REFERENCES recurring_tasks(id) ON DELETE SET NULL
);

CREATE TABLE medication_effects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    date DATE NOT NULL,
    is_effect_mode_on BOOLEAN DEFAULT 0,
    is_medication_taken BOOLEAN DEFAULT 0,
    effect_start_time TIME,
    effect_duration_minutes INTEGER,
    time_to_max_effect_minutes INTEGER,
    time_to_fade_minutes INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE daily_conditions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    date DATE NOT NULL,
    condition TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    target_id INTEGER,
    target_type TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ai_suggestion_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    task_id INTEGER,
    suggestion_type TEXT NOT NULL,
    input_context TEXT NOT NULL,
    output_summary TEXT NOT NULL,
    output_details TEXT,
    suggested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_feedback TEXT,
    feedback_comment TEXT,
    feedback_timestamp TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

CREATE TABLE reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    task_id INTEGER,
    scheduled_time TIMESTAMP NOT NULL,
    sent_time TIMESTAMP,
    delivery_status TEXT DEFAULT 'pending',
    delivery_method TEXT DEFAULT 'in_app',
    retry_count INTEGER DEFAULT 0,
    last_error_message TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- インデックスとビューはそのままでOK
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_medication_effects_user ON medication_effects(user_id);
CREATE INDEX idx_daily_conditions_user ON daily_conditions(user_id);
CREATE INDEX idx_ai_suggestion_logs_user ON ai_suggestion_logs(user_id);
CREATE INDEX idx_ai_suggestion_logs_task ON ai_suggestion_logs(task_id);
CREATE INDEX idx_ai_suggestion_logs_type ON ai_suggestion_logs(suggestion_type);
CREATE INDEX idx_ai_suggestion_logs_feedback ON ai_suggestion_logs(user_feedback);
CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_task ON reminders(task_id);
CREATE INDEX idx_reminders_scheduled_time ON reminders(scheduled_time);
CREATE INDEX idx_reminders_delivery_status ON reminders(delivery_status);
CREATE INDEX idx_recurring_tasks_user ON recurring_tasks(user_id);
CREATE INDEX idx_recurring_tasks_category ON recurring_tasks(category_id);
CREATE INDEX idx_recurring_tasks_start_date ON recurring_tasks(start_date);
CREATE INDEX idx_recurring_tasks_recurrence_end_date ON recurring_tasks(recurrence_end_date);

CREATE VIEW task_hierarchy_view AS
SELECT 
    id, 
    name, 
    parent_task_id,
    CASE 
        WHEN parent_task_id IS NULL THEN 'parent'
        ELSE 'child'
    END AS task_type,
    task_depth,
    task_path
FROM tasks;

-- デフォルトカテゴリーの追加
INSERT INTO categories (user_id, name, color, is_default) VALUES 
(NULL, '仕事', '#197FE5', 1),    -- 青
(NULL, '個人', '#78A55A', 1),    -- 緑
(NULL, '学習', '#BEB934', 1);    -- 黄
