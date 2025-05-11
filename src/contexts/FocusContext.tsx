import React, { createContext, useContext, useState, useEffect } from 'react';
import { FocusContextType, MedicationEffectConfig, MedicationStatus, PhysicalCondition } from '../types/focus';
import { userSettingsApi } from '../lib/api';

// 薬効状態を計算する関数
const calculateMedicationStatus = (
  config: MedicationEffectConfig,
  skipped: boolean,
  isEffectModeOn: boolean
): MedicationStatus => {
  if (!isEffectModeOn || skipped) return 'off';

  const now = new Date();
  const [hours, minutes] = config.defaultTime.split(':').map(Number);
  const medicationTime = new Date();
  medicationTime.setHours(hours, minutes, 0, 0);

  const diffHours = (now.getTime() - medicationTime.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return 'off';
  if (diffHours < config.onsetTime) return 'before_peak';
  if (diffHours < config.peakOutTime) return 'peak';
  if (diffHours < config.totalEffectDuration) return 'fading';
  return 'off';
};

// 初期設定値
const initialConfig: MedicationEffectConfig = {
  defaultTime: '08:00',
  totalEffectDuration: 10,
  onsetTime: 2,
  peakOutTime: 8
};

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [physicalCondition, setPhysicalCondition] = useState<PhysicalCondition>('normal');
  const [medicationConfig, setMedicationConfig] = useState<MedicationEffectConfig>(initialConfig);
  const [medicationSkipped, setMedicationSkipped] = useState<boolean>(false);
  const [medicationStatus, setMedicationStatus] = useState<MedicationStatus>('off');
  const [isEffectModeOn, setIsEffectModeOn] = useState<boolean>(false);

  // 初期設定の読み込み
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings = await userSettingsApi.getUserSettings();
        setIsEffectModeOn(settings.medication_effect_mode_on === 1);
      } catch (error) {
        console.error('ユーザー設定の読み込みに失敗しました:', error);
      }
    };
    loadUserSettings();
  }, []);

  // 薬効モードの更新
  const handleEffectModeChange = async (isOn: boolean) => {
    try {
      await userSettingsApi.updateMedicationEffectMode(isOn);
      setIsEffectModeOn(isOn);
    } catch (error) {
      console.error('薬効モードの更新に失敗しました:', error);
    }
  };

  // 5分ごとに薬効状態を更新
  useEffect(() => {
    const updateStatus = () => {
      setMedicationStatus(calculateMedicationStatus(medicationConfig, medicationSkipped, isEffectModeOn));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [medicationConfig, medicationSkipped, isEffectModeOn]);

  return (
    <FocusContext.Provider
      value={{
        physicalCondition,
        setPhysicalCondition,
        medicationStatus,
        medicationConfig,
        setMedicationConfig,
        medicationSkipped,
        setMedicationSkipped,
        isEffectModeOn,
        setIsEffectModeOn: handleEffectModeChange,
        handleEffectModeChange
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}; 