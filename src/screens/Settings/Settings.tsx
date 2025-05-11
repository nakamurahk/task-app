import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocus } from '../../contexts/FocusContext';
import { useAuth } from '../../contexts/AuthContext';

const Settings: React.FC = () => {
  const { medicationConfig, setMedicationConfig, medicationSkipped, setMedicationSkipped, isEffectModeOn, setIsEffectModeOn, handleEffectModeChange } = useFocus();
  const { logout } = useAuth();
  const [config, setConfig] = useState(medicationConfig);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      // エラーはAuthContextで処理される
    }
  };

  return (
    <div className="settings-page mx-5 py-6 bg-white min-h-screen overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">設定</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">薬効設定</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">
                  薬効モード
                </label>
                <button
                  type="button"
                  onClick={() => handleEffectModeChange(!isEffectModeOn)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    isEffectModeOn ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      isEffectModeOn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {isEffectModeOn && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      初期服用時刻
                    </label>
                    <input
                      type="time"
                      value={config.defaultTime}
                      onChange={(e) => setConfig({ ...config, defaultTime: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      効果持続時間（時間）
                    </label>
                    <input
                      type="number"
                      value={config.totalEffectDuration}
                      onChange={(e) => setConfig({ ...config, totalEffectDuration: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      効き始めまでの時間（時間）
                    </label>
                    <input
                      type="number"
                      value={config.onsetTime}
                      onChange={(e) => setConfig({ ...config, onsetTime: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ピーク終了時間（服用後の時間）
                    </label>
                    <input
                      type="number"
                      value={config.peakOutTime}
                      onChange={(e) => setConfig({ ...config, peakOutTime: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={medicationSkipped}
                        onChange={(e) => setMedicationSkipped(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">今日は服薬していない</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 