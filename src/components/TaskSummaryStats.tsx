import React from 'react';
import MiniKPIBox from './MiniKPIBox';

const TaskSummaryStats: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto mb-6">
      <MiniKPIBox label="完了タスク数" value="42 件" icon="✅" />
      <MiniKPIBox label="平均 / 日" value="6.0 件" icon="📊" />
      <MiniKPIBox label="最大完了日" value="5/14（12件）" icon="📅" />
      <MiniKPIBox label="総対応時間" value="132 分" icon="⏱" />
    </div>
  );
};

export default TaskSummaryStats; 