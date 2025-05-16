import React, { useState, useEffect } from 'react';
import Drawer from './Drawer';
import { Checkbox } from './checkbox';

interface SettingsDisplayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings: {
    show_hurdle: boolean;
    show_importance: boolean;
    show_deadline_alert: boolean;
  };
  onSave: (settings: {
    show_hurdle: boolean;
    show_importance: boolean;
    show_deadline_alert: boolean;
  }) => Promise<void>;
}

const SettingsDisplayDrawer: React.FC<SettingsDisplayDrawerProps> = ({ isOpen, onClose, initialSettings, onSave }) => {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
    setSaved(false);
  }, [initialSettings, isOpen]);

  const handleChange = (key: keyof typeof settings) => (checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    await onSave(settings);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
    onClose();
  };

  const isChanged =
    settings.show_hurdle !== initialSettings.show_hurdle ||
    settings.show_importance !== initialSettings.show_importance ||
    settings.show_deadline_alert !== initialSettings.show_deadline_alert;

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">表示項目のカスタマイズ</h2>
      <div className="space-y-4 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox checked={settings.show_hurdle} onCheckedChange={v => handleChange('show_hurdle')(!!v)} />
          <span className="text-base">ハードル</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox checked={settings.show_importance} onCheckedChange={v => handleChange('show_importance')(!!v)} />
          <span className="text-base">重要度</span>
        </label>
      </div>
      <div className="sticky bottom-0 left-0 right-0 bg-white pt-2 pb-1 z-10 flex flex-col gap-2">
        <button
          className={`w-[60%] mx-auto py-2 rounded-lg text-white font-bold transition-colors mb-1 ${saved ? 'bg-green-400' : 'bg-blue-500 hover:bg-blue-600'} ${loading || !isChanged ? 'bg-gray-400 opacity-60 cursor-not-allowed' : ''}`}
          onClick={handleSave}
          disabled={loading || !isChanged}
        >
          {saved ? '保存しました！' : '保存'}
        </button>
      </div>
    </Drawer>
  );
};

export default SettingsDisplayDrawer; 