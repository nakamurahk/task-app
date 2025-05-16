import React, { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, eachDayOfInterval, eachWeekOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import TaskCountGraph from './TaskCountGraph';
import TaskHeatmap from './TaskHeatmap';
import TaskSummaryStats from './TaskSummaryStats';
import { useAppStore, AppState } from '../lib/useAppStore';
import { Task } from '../types/task';

// Task型の最低限必要なプロパティ
interface Task {
  id: number;
  user_id: number;
  name: string;
  created_at: Date;
  importance: string;
  progress: number;
  is_deleted: boolean;
  is_today_task: boolean;
  status: string;
  completed_at?: Date;
  priority_score: number;
  child_order: number;
  task_depth: number;
  suggested_by_ai: boolean;
}

type Period = '7days' | '14days' | '28days' | '90days';

const TaskAnalytics: React.FC = () => {
  // zustandストアからtasksを取得
  const tasks = useAppStore((s: AppState) => s.tasks);
  const [period, setPeriod] = useState<Period>('7days');
  const [graphData, setGraphData] = useState<{ date: string; count: number }[]>([]);
  const [heatmapData, setHeatmapData] = useState<{ date: string; hour: number; count: number }[]>([]);

  // グラフデータの集計
  useEffect(() => {
    const days = period === '7days' ? 7 : period === '14days' ? 14 : period === '28days' ? 28 : 90;
    const today = new Date();
    const startDate = subDays(today, days - 1);
    // 完了したタスクのみをフィルタリング
    const completedTasks = tasks.filter((task: Task) =>
      task.status === 'completed' &&
      task.completed_at &&
      new Date(task.completed_at) >= startDate
    );
    let data: { date: string; count: number }[] = [];
    if (days <= 14) {
      // 日単位の集計
      const dailyCounts = new Map<string, number>();
      const dateRange = eachDayOfInterval({ start: startDate, end: today });
      dateRange.forEach((date: Date) => {
        dailyCounts.set(format(date, 'yyyy-MM-dd'), 0);
      });
      completedTasks.forEach((task: Task) => {
        const completedDate = format(new Date(task.completed_at!), 'yyyy-MM-dd');
        dailyCounts.set(completedDate, (dailyCounts.get(completedDate) || 0) + 1);
      });
      data = Array.from(dailyCounts.entries()).map(([date, count]) => ({ date, count }));
    } else {
      // 週単位の集計
      const weekStarts = eachWeekOfInterval({ start: startDate, end: today }, { weekStartsOn: 1 });
      const weeklyCounts = new Map<string, number>();
      weekStarts.forEach((weekStart: Date) => {
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        weeklyCounts.set(weekKey, 0);
      });
      completedTasks.forEach((task: Task) => {
        const weekStart = startOfWeek(new Date(task.completed_at!), { weekStartsOn: 1 });
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        if (weeklyCounts.has(weekKey)) {
          weeklyCounts.set(weekKey, (weeklyCounts.get(weekKey) || 0) + 1);
        }
      });
      data = Array.from(weeklyCounts.entries()).map(([date, count]) => ({ date, count }));
    }
    setGraphData(data);
  }, [tasks, period]);

  // ヒートマップデータの集計
  useEffect(() => {
    // 完了タスクのみ
    const completedTasks = tasks.filter((task: Task) => task.status === 'completed' && task.completed_at);
    // 日付・時間ごとに集計
    const hourlyCounts = completedTasks.reduce((acc: Record<string, number>, task: Task) => {
      const completedDate = new Date(task.completed_at!);
      const dateKey = format(completedDate, 'yyyy-MM-dd');
      const hour = completedDate.getHours();
      const key = `${dateKey}_${hour}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const data = Object.entries(hourlyCounts).map(([key, count]) => {
      const [date, hour] = key.split('_');
      return {
        date,
        hour: parseInt(hour),
        count: Number(count)
      };
    });
    setHeatmapData(data);
  }, [tasks]);

  return (
    <section className="px-4 py-6">
      <h2 className="section-title mb-6">アナリティクス（ダミー）</h2>
      {/* 1. タスク完了推移グラフ */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">タスク完了推移</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">1週間</option>
            <option value="14days">2週間</option>
            <option value="28days">4週間</option>
            <option value="90days">3ヶ月</option>
          </select>
        </div>
        <TaskCountGraph 
          data={graphData} 
          period={period === '7days' ? 7 : period === '14days' ? 14 : period === '28days' ? 28 : 90} 
        />
      </div>
      {/* 2. ミニ統計ボックス */}
      <TaskSummaryStats />
      {/* 3. サブ：ヒートマップをアコーディオンで表示 */}
      <details className="bg-white rounded-lg shadow p-6">
        <summary className="cursor-pointer text-blue-600 hover:text-blue-700 transition-colors duration-200">
          時間帯の傾向を見る
        </summary>
        <div className="mt-4">
          <TaskHeatmap data={heatmapData} />
        </div>
      </details>
    </section>
  );
};

export default TaskAnalytics; 