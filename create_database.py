import sqlite3
import os

# データベースファイルのパス
db_path = os.path.join(os.path.dirname(__file__), 'task_manager.db')
schema_path = os.path.join(os.path.dirname(__file__), 'task_database.sql')

# 既存のデータベースファイルを削除
if os.path.exists(db_path):
    os.remove(db_path)

# データベース接続
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# スキーマファイルを読み込んで実行
with open(schema_path, 'r', encoding='utf-8') as f:
    schema_script = f.read()
    cursor.executescript(schema_script)

# 変更をコミット
conn.commit()

# 接続を閉じる
conn.close()

print(f'データベース {db_path} が正常に作成されました。')

# テーブル一覧を表示
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("\nデータベース内のテーブル:")
for table in tables:
    print(table[0])
conn.close()
