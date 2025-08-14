import type { AppState } from '../types';

const STORAGE_KEY = 'personalos_data';

export class LocalStorageService {
  static save(data: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Data saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
    }
  }

  static load(): AppState | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        console.log('📂 Data loaded from localStorage');
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to load from localStorage:', error);
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ localStorage cleared');
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error);
    }
  }
}

export default LocalStorageService;
