import { useLanguageStore } from '../stores/languageStore';
import { translations } from './translations';

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const initialized = useLanguageStore((state) => state.initialized);

  return {
    language,
    initialized,
    t: translations[language],
  };
}
