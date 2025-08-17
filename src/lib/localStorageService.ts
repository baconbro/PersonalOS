import type { AppState } from '../types';

const STORAGE_KEY = 'personal-os-data'; // Changed to match Dashboard.tsx

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
      // First try the correct key
      let data = localStorage.getItem(STORAGE_KEY);
      
      // If not found, try the old key and migrate
      if (!data) {
        const oldData = localStorage.getItem('personalos_data');
        if (oldData) {
          console.log('🔄 Migrating from old localStorage key...');
          localStorage.setItem(STORAGE_KEY, oldData);
          localStorage.removeItem('personalos_data');
          data = oldData;
        }
      }
      
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
