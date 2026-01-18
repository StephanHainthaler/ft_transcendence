import { init, register, locale } from 'svelte-i18n';

register('en', () => import('./locales/en.json'));
register('ukr', () => import('./locales/ukr.json'));
register('de', () => import('./locales/de.json'));

init({
  fallbackLocale: 'en', //Default language
  initialLocale: 'en',  //Initial language
});