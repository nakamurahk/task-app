-- Drop the view first
DROP VIEW IF EXISTS task_hierarchy_view;

-- Migrate user_settings
ALTER TABLE user_settings RENAME TO user_settings_old;
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    is_default BOOLEAN DEFAULT 0
);
INSERT INTO user_settings SELECT * FROM user_settings_old;
DROP TABLE user_settings_old;

-- Migrate tasks
ALTER TABLE tasks RENAME TO tasks_old;
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    importance TEXT DEFAULT 'medium',
    estimated_duration_minutes INTEGER,
    progress INTEGER DEFAULT 0,
    parent_task_id INTEGER REFERENCES tasks(id),
    category_id INTEGER REFERENCES categories(id),
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
    parent_recurring_task_id INTEGER REFERENCES recurring_tasks(id) ON DELETE SET NULL,
    hurdle_level INTEGER DEFAULT 1
);
INSERT INTO tasks SELECT *, 1 FROM tasks_old;
DROP TABLE tasks_old;

-- Migrate medication_effects
ALTER TABLE medication_effects RENAME TO medication_effects_old;
CREATE TABLE medication_effects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    is_effect_mode_on BOOLEAN DEFAULT 0,
    is_medication_taken BOOLEAN DEFAULT 0,
    effect_start_time TIME,
    effect_duration_minutes INTEGER,
    time_to_max_effect_minutes INTEGER,
    time_to_fade_minutes INTEGER
);
INSERT INTO medication_effects SELECT * FROM medication_effects_old;
DROP TABLE medication_effects_old;

-- Migrate daily_conditions
ALTER TABLE daily_conditions RENAME TO daily_conditions_old;
CREATE TABLE daily_conditions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    condition TEXT NOT NULL
);
INSERT INTO daily_conditions SELECT * FROM daily_conditions_old;
DROP TABLE daily_conditions_old;

-- Migrate activity_logs
ALTER TABLE activity_logs RENAME TO activity_logs_old;
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_id INTEGER,
    target_type TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);
INSERT INTO activity_logs SELECT * FROM activity_logs_old;
DROP TABLE activity_logs_old;

-- Drop users table as it's no longer needed
DROP TABLE IF EXISTS users;

-- Recreate indexes
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_medication_effects_user ON medication_effects(user_id);
CREATE INDEX idx_daily_conditions_user ON daily_conditions(user_id);

-- Recreate the view
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