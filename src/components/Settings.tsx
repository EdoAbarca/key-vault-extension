/**
 * Settings Component
 * 
 * UI for configuring vault settings including lock timeout
 */

import { useState, useEffect } from 'react';
import { useSessionStore } from '../store/sessionStore';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const { lockTimeoutMinutes, setLockTimeout } = useSessionStore();
  const [timeout, setTimeout] = useState(lockTimeoutMinutes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTimeout(lockTimeoutMinutes);
  }, [lockTimeoutMinutes]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setLockTimeout(timeout);
      // Give user feedback
      await new Promise(resolve => window.setTimeout(resolve, 300));
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimeoutChange = (value: number) => {
    // Clamp value between 1 and 60
    const clampedValue = Math.max(1, Math.min(60, value));
    setTimeout(clampedValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Lock Timeout Setting */}
          <div>
            <label htmlFor="lock-timeout" className="block text-sm font-medium text-gray-700 mb-2">
              Auto-lock timeout
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Vault will automatically lock after this period of inactivity
            </p>
            
            <div className="flex items-center gap-4">
              <input
                id="lock-timeout"
                type="range"
                min="1"
                max="60"
                value={timeout}
                onChange={(e) => { handleTimeoutChange(Number(e.target.value)); }}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center gap-2 min-w-[100px]">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={timeout}
                  onChange={(e) => { handleTimeoutChange(Number(e.target.value)); }}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">min</span>
              </div>
            </div>
            
            {/* Quick presets */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { handleTimeoutChange(5); }}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                5 min
              </button>
              <button
                onClick={() => { handleTimeoutChange(15); }}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                15 min
              </button>
              <button
                onClick={() => { handleTimeoutChange(30); }}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                30 min
              </button>
              <button
                onClick={() => { handleTimeoutChange(60); }}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                60 min
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800">
                Your vault will automatically lock after the specified time of inactivity. 
                Sensitive data will be cleared from memory when locked.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { void handleSave(); }}
            disabled={isSaving}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
