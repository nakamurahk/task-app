import React from 'react';
import { useFocus } from '../contexts/FocusContext';
import goodIcon from '../assets/good-cutout.png';
import goodOffIcon from '../assets/good-off.png';
import normalIcon from '../assets/normal-cutout.png';
import normalOffIcon from '../assets/normal-off.png';
import badIcon from '../assets/bad-cutout.png';
import badOffIcon from '../assets/bad-off.png';

// 薬効状態に応じたメッセージを返す関数
const getMedicationMessage = (status: string): string => {
  switch (status) {
    case 'before_peak':
      return 'そろそろ集中力が上がってきます。無理せず始めましょう。';
    case 'peak':
      return 'いま一番集中できる時間です。優先タスクに取り組みましょう！';
    case 'fading':
      return '少しずつ集中力が落ちてきています。無理しすぎずに。';
    case 'off':
      return '集中のピークは過ぎました。軽めのタスクや休憩も検討を。';
    case 'skipped':
      return '今日は服薬していません。自分のペースで過ごしましょう。';
    default:
      return '';
  }
};

// 残り時間を30分単位で表示する関数
const formatRemainingTime = (config: any, status: string): string => {
  if (status === 'skipped') return '';

  const now = new Date();
  const [hours, minutes] = config.defaultTime.split(':').map(Number);
  const medicationTime = new Date();
  medicationTime.setHours(hours, minutes, 0, 0);

  // 今日の服薬時間が過ぎている場合は翌日の服薬時間を設定
  if (medicationTime > now) {
    medicationTime.setDate(medicationTime.getDate() - 1);
  }

  const diffHours = (now.getTime() - medicationTime.getTime()) / (1000 * 60 * 60);
  const remainingHours = config.totalEffectDuration - diffHours;

  if (remainingHours <= 0) return '--分';
  
  const roundedHours = Math.floor(remainingHours);
  const remainingMinutes = Math.round((remainingHours - roundedHours) * 60);
  const roundedMinutes = Math.round(remainingMinutes / 30) * 30;

  if (roundedHours === 0) {
    return `${roundedMinutes}分`;
  } else if (roundedMinutes === 0) {
    return `${roundedHours}時間`;
  } else {
    return `${roundedHours}時間${roundedMinutes}分`;
  }
};

const FocusTime: React.FC = () => {
  const {
    physicalCondition,
    setPhysicalCondition,
    medicationStatus,
    medicationConfig,
    medicationSkipped
  } = useFocus();

  return (
    <div className="focus-time">
      <div className="focus-time-card">
        {/* 体調選択 */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => setPhysicalCondition('good')}
            className={`w-9 h-9 flex items-center justify-center ${
              physicalCondition === 'good' ? 'bg-blue-100' : ''
            }`}
          >
            <img 
              src={physicalCondition === 'good' ? goodIcon : goodOffIcon} 
              alt="良い体調" 
              className="w-8 h-8"
              style={{ objectFit: 'cover', width: '32px', height: '32px' }}
            />
          </button>
          <button
            onClick={() => setPhysicalCondition('normal')}
            className={`w-9 h-9 flex items-center justify-center ${
              physicalCondition === 'normal' ? 'bg-blue-100' : ''
            }`}
          >
            <img 
              src={physicalCondition === 'normal' ? normalIcon : normalOffIcon} 
              alt="普通の体調" 
              className="w-8 h-8"
              style={{ objectFit: 'cover', width: '32px', height: '32px' }}
            />
          </button>
          <button
            onClick={() => setPhysicalCondition('bad')}
            className={`w-9 h-9 flex items-center justify-center ${
              physicalCondition === 'bad' ? 'bg-blue-100' : ''
            }`}
          >
            <img 
              src={physicalCondition === 'bad' ? badIcon : badOffIcon} 
              alt="悪い体調" 
              className="w-8 h-8"
              style={{ objectFit: 'cover', width: '32px', height: '32px' }}
            />
          </button>
        </div>

        {/* 集中状態表示 */}
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">
            集中状態: {getMedicationMessage(medicationStatus)}
          </div>
          {!medicationSkipped && (
            <div className="text-gray-600">
              残り時間: {formatRemainingTime(medicationConfig, medicationStatus)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusTime; 