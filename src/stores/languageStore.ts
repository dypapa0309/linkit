import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { AppLanguage } from '../i18n/translations';

const STORAGE_KEY = 'linkit.language';

interface LanguageState {
  initialized: boolean;
  language: AppLanguage;
  initialize: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  initialized: false,
  language: 'ko',
  initialize: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const language = stored === 'ko' || stored === 'en' ? stored : 'ko';

    set({
      language,
      initialized: true,
    });
  },
  setLanguage: async (language) => {
    await AsyncStorage.setItem(STORAGE_KEY, language);
    set({ language, initialized: true });
  },
}));
