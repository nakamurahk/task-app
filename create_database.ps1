$databasePath = "c:\Users\中村彦一郎\OneDrive\デスクトップ\v04-task035\task_manager.db"
$schemaPath = "c:\Users\中村彦一郎\OneDrive\デスクトップ\v04-task035\task_database.sql"

# データベースが既に存在する場合は削除
if (Test-Path $databasePath) {
    Remove-Item $databasePath
}

# SQLiteデータベースを作成し、スキーマを適用
$sqliteCommand = "sqlite3 $databasePath '.read $schemaPath'"
Invoke-Expression $sqliteCommand

Write-Host "データベースが正常に作成されました。"
