import i18next from 'i18next';
import { writable } from 'svelte/store';
import en from './locales/en.json';
import ukr from './locales/ukr.json';
import de from './locales/de.json';
import { Writable } from '$lib/types/writable';
import { get } from 'svelte/store';

export const localeSettings = new Writable<string>('app_locale');
const savedLocale = typeof window !== 'undefined' ? localStorage.getItem('app_locale') : 'en';


i18next.init({
  lng: savedLocale || 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    ukr: { translation: ukr },
    de: { translation: de }
  },
  interpolation: { escapeValue: false },
  parseMissingKeyHandler: (key) => {
    console.warn(`Missing translation key: ${key}`);
    return "";
  }
});

const createI18nStore = () => {
  const safeT = () => (key: string, options?: string) => {
    let res;

    if (typeof options === 'string')
      res = i18next.t(key, { defaultValue: options });
    else
      res = i18next.t(key, options);
    if (res === key) {
      console.warn(`Missing translation for key: ${key}`);
      return options ? options : "";
    }
    return res;
  };

  const { subscribe, set } = writable(safeT());

  return {
    subscribe,
    changeLanguage: async (lang: string) => {
      await i18next.changeLanguage(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_locale', lang);}
      set(safeT()); 
      currentLocale.set(lang);
    }
  };
};

/**
 * A Svelte store that provides the i18next translation function.
 *
 * @example
 * // In a Svelte component:
 * import { t } from '@lib/i18n/i18n';
 *
 * <h1>{$t('common.welcome')}</h1>
 * <h2>{$t('common.greeting', 'Hello!')}</h2> <!-- default string if missing -->
 *
 * @description
 * - **IMPORTANT:** `$t` is a Svelte store. Use the `$` prefix to subscribe to its value.
 * - The store value is a function like `i18next.t(key, options)`.
 * - The second parameter `options` can be:
 *     - a string → used as the default value if the key is missing
 *     - an object (`TOptions`) → standard i18next options
 * - Key paths are dot-separated (e.g., 'profile.edit').
 * - All translation strings must be defined in `frontend/lib/i18n/locales/*.json`.
 * - Use `t.changeLanguage(lang: string)` to switch the current language.
 *
 * @returns {object} A store with:
 *   - `changeLanguage(lang: string)`: function to switch the current language.
 */

export const t = createI18nStore();
export const currentLocale = writable(i18next.language);
export { get };
