# 管理者権限で実行する必要があります

$sqlite_path = "C:\sqlite"

# SQLiteフォルダが存在しない場合は作成
if (!(Test-Path -Path $sqlite_path)) {
    New-Item -ItemType Directory -Path $sqlite_path
}

# システム環境変数PATHを取得
$oldPath = [Environment]::GetEnvironmentVariable('Path', 'Machine')

# SQLiteパスが既に存在しない場合のみ追加
if ($oldPath -notlike "*$sqlite_path*") {
    $newPath = $oldPath + ";$sqlite_path"
    [Environment]::SetEnvironmentVariable('Path', $newPath, 'Machine')
    Write-Host "SQLiteパスを追加しました: $sqlite_path"
} else {
    Write-Host "SQLiteパスは既に存在します。"
}

# 現在のセッションのPATHも更新
$env:Path += ";$sqlite_path"

Write-Host "SQLiteパスの設定が完了しました。"
