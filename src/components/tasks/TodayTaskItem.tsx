const handleToggle = async () => {
  try {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const now = new Date().toISOString();
    
    await updateTask(task.id, {
      status: newStatus,
      completed_at: newStatus === "completed" ? now : null
    });
  } catch (error) {
    console.error("タスクの更新に失敗しました:", error);
  }
}; 