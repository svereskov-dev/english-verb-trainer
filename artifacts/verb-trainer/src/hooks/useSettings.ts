import { useState, useEffect } from 'react';
import { getSettings, saveSettings, Settings, Difficulty, Theme } from '../db/settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!settings) return;
    const updated = { ...settings, ...newSettings };
    await saveSettings(updated);
    setSettings(updated);
  };

  return { settings, updateSettings };
}
