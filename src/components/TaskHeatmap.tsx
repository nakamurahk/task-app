import React from 'react';
import { format, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';

type TaskDataPoint = {
  date: string; // YYYY-MM-DD
  hour: number; // 0〜23
  count: number; // タスク完了数
};

interface TaskHeatmapProps {
  data: TaskDataPoint[];
}

// 色の強度を決定する関数
const getColorClass = (count: number): string => {
  if (count === 0) return 'bg-gray-100';
  if (count <= 2) return 'bg-green-200';
  if (count <= 4) return 'bg-green-400';
  return 'bg-green-600';
};

// 過去30日間の日付を取得
const getLast30Days = (): Date[] => {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => subDays(today, i));
};

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];

const TaskHeatmap: React.FC<TaskHeatmapProps> = ({ data }) => {
  // 30日分のデータを曜日×時間で集計
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0)); // [weekday][hour]

  // 対象日付リスト
  const last30Days = getLast30Days();
  const last30DayStrs = last30Days.map(d => format(d, 'yyyy-MM-dd'));

  // データを曜日×時間で合計
  data.forEach(d => {
    if (last30DayStrs.includes(d.date)) {
      const dateObj = new Date(d.date);
      const weekday = dateObj.getDay(); // 0:日, 1:月, ... 6:土
      grid[weekday][d.hour] += d.count;
    }
  });

  // デバッグ: グリッドの合計値を出力
  console.log('ヒートマップ集計グリッド:', grid);

  const getDateKey = (date: Date) => {
    return `${date.getUTCDay()}_${date.getUTCHours()}`;
  };

  const getDateLabel = (date: Date) => {
    return format(date, 'MM/dd');
  };

  const getTimeLabel = (hour: number) => {
    return `${hour}:00`;
  };

  const getTooltipContent = (day: number, hour: number) => {
    const count = grid[day][hour] || 0;
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (6 - day));
    date.setUTCHours(hour, 0, 0, 0);
    return `${format(date, 'MM/dd')} ${hour}:00 - ${count}件`;
  };

  return (
    <div className="bg-white p-2 rounded-lg">
      {/* 曜日ラベル */}
      <div className="flex">
        <div className="w-10" /> {/* 左端の空白（時間ラベル分） */}
        {weekdayLabels.map((label, i) => (
          <div key={i} className="w-8 text-xs text-gray-600 text-center px-1">
            {label}
          </div>
        ))}
      </div>
      {/* ヒートマップ本体 */}
      <div className="flex">
        {/* 時間ラベル（0時〜23時） */}
        <div className="flex flex-col">
          {Array.from({ length: 24 }, (_, hour) => (
            <div
              key={hour}
              className="h-6 flex items-center justify-end pr-1 text-[10px] text-gray-500"
              style={{ minWidth: '2.5rem' }}
            >
              {`${hour}時`}
            </div>
          ))}
        </div>
        {/* 各曜日のマス */}
        <div className="flex">
          {Array.from({ length: 7 }, (_, weekday) => (
            <div key={weekday} className="flex flex-col">
              {Array.from({ length: 24 }, (_, hour) => {
                const count = grid[weekday][hour];
                const colorClass = getColorClass(count);
                const tooltip = getTooltipContent(weekday, hour);
                return (
                  <div
                    key={`${weekday}-${hour}`}
                    className={`w-8 h-6 ${colorClass} border border-white rounded-md`}
                    title={tooltip}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskHeatmap; 