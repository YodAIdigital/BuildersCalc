import React from 'react';
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  Settings,
  bindOnlineSync,
} from '../storage/settings';

type Ctx = {
  settings: Settings;
  setSettings: (partial: Partial<Settings>) => void;
};

const SettingsContext = React.createContext<Ctx>({
  settings: defaultSettings,
  setSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = React.useState<Settings>(defaultSettings);

  React.useEffect(() => {
    bindOnlineSync();
    loadSettings().then(setSettingsState);
  }, []);

  const setSettings = (partial: Partial<Settings>) => {
    const next = { ...settings, ...partial };
    setSettingsState(next);
    saveSettings(partial).catch(() => void 0);
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return React.useContext(SettingsContext);
}
