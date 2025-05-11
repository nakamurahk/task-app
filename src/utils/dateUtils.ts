import { parseISO } from 'date-fns';

export const formatDuration = (minutes?: number) => {
  if (!minutes) return '未設定';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}時間${mins}分`;
  }
  return `${mins}分`;
};

export const formatDeadline = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return '今日';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return '明日';
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

export const formatDateForDisplay = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}; 