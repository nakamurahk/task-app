-- Migrate ai_suggestion_logs
ALTER TABLE ai_suggestion_logs RENAME TO ai_suggestion_logs_old;
CREATE TABLE ai_suggestion_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    suggestion_type TEXT NOT NULL,
    input_context TEXT NOT NULL,
    output_summary TEXT NOT NULL,
    output_details TEXT,
    feedback_timestamp TIMESTAMP
);
INSERT INTO ai_suggestion_logs SELECT * FROM ai_suggestion_logs_old;
DROP TABLE ai_suggestion_logs_old;

-- Migrate recurring_tasks
ALTER TABLE recurring_tasks RENAME TO recurring_tasks_old;
CREATE TABLE recurring_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    recurrence_rule TEXT NOT NULL,
    recurrence_end_date DATE,
    category_id INTEGER REFERENCES categories(id),
    importance TEXT DEFAULT 'medium',
    estimated_duration_minutes INTEGER,
    default_reminder_offset_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO recurring_tasks SELECT * FROM recurring_tasks_old;
DROP TABLE recurring_tasks_old;

-- Migrate reminders
ALTER TABLE reminders RENAME TO reminders_old;
CREATE TABLE reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP NOT NULL,
    sent_time TIMESTAMP,
    delivery_status TEXT DEFAULT 'pending',
    delivery_method TEXT DEFAULT 'in_app',
    retry_count INTEGER DEFAULT 0,
    last_error_message TEXT
);
INSERT INTO reminders SELECT * FROM reminders_old;
DROP TABLE reminders_old;

-- Migrate categories
ALTER TABLE categories RENAME TO categories_old;
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,    -- NULLならデフォルト
    name TEXT NOT NULL,
    color TEXT NOT NULL,                     -- 例: '#FF0000'
    is_default BOOLEAN DEFAULT 0
);
INSERT INTO categories SELECT * FROM categories_old;
DROP TABLE categories_old;

-- Recreate indexes
CREATE INDEX idx_ai_suggestion_logs_user ON ai_suggestion_logs(user_id);
CREATE INDEX idx_ai_suggestion_logs_task ON ai_suggestion_logs(task_id);
CREATE INDEX idx_ai_suggestion_logs_type ON ai_suggestion_logs(suggestion_type);

CREATE INDEX idx_recurring_tasks_user ON recurring_tasks(user_id);
CREATE INDEX idx_recurring_tasks_category ON recurring_tasks(category_id);
CREATE INDEX idx_recurring_tasks_start_date ON recurring_tasks(start_date);
CREATE INDEX idx_recurring_tasks_recurrence_end_date ON recurring_tasks(recurrence_end_date);

CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_task ON reminders(task_id);
CREATE INDEX idx_reminders_scheduled_time ON reminders(scheduled_time);

CREATE INDEX idx_categories_user ON categories(user_id);

-- completedAtカラムの名前変更と形式変換
ALTER TABLE tasks RENAME COLUMN completedAt TO completed_at;

-- 既存データの形式変換
UPDATE tasks 
SET completed_at = strftime('%Y-%m-%d %H:%M:%S', completed_at)
WHERE completed_at IS NOT NULL; 