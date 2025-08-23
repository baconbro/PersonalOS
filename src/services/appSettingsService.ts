export interface AppSettings {
  rlEngineEnabled: boolean;
}

const STORAGE_KEY = 'personal-os-app-settings';

class AppSettingsService {
  private settings: AppSettings;

  constructor() {
    this.settings = this.load();
  }

  private load(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    // defaults
    return { rlEngineEnabled: false };
  }

  private save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings)); } catch {}
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  updateSettings(update: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...update };
    this.save();
    // emit event for listeners (App.tsx)
    window.dispatchEvent(new CustomEvent('app-settings-changed', { detail: { ...this.settings } }));
  }
}

export const appSettingsService = new AppSettingsService();
