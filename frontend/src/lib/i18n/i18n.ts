import i18next from 'i18next';
import { writable } from 'svelte/store';
import en from './locales/en.json';
import ukr from './locales/ukr.json';
import de from './locales/de.json';

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    ukr: { translation: ukr },
    de: { translation: de }
  },
  interpolation: { escapeValue: false }
});

const createI18nStore = () => {
  const { subscribe, set } = writable(i18next.t.bind(i18next));

  return {
    subscribe,
    changeLanguage: async (lang: string) => {
      await i18next.changeLanguage(lang);
      set(i18next.t.bind(i18next)); 
      currentLocale.set(i18next.language);
    }
  };
};

/**
 * @typedef {import('i18next').TFunction} TFunction
 */

/**
 * A Svelte store that provides the i18next translation function.
 * * @example
 * // In a Svelte component:
 * import { t } from '@lib/i18n/i18n';
 * * <h1>{$t('common.welcome')}</h1>
 * * @description
 * - **IMPORTANT:** Always use the `$` prefix (`$t`) to subscribe to the store value.
 * - Key paths are dot-separated (e.g., 'profile.edit').
 * - All strings must be defined in the frontend/lib/i18n/locale/*.json (all three) files.
 * * @returns {TFunction} The i18next translation function.
 */
export const t = createI18nStore();
export const currentLocale = writable(i18next.language);