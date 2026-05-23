import i18next, { type i18n as I18nInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommon from '@/locales/en/common.json';
import ruCommon from '@/locales/ru/common.json';

export const SUPPORTED_LOCALES = ['ru', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ru';

export const I18N_RESOURCES = {
  en: { common: enCommon },
  ru: { common: ruCommon },
} as const;

let instance: I18nInstance | null = null;

export function getI18n(): I18nInstance {
  if (instance) return instance;
  const next = i18next.createInstance();
  next.use(LanguageDetector).use(initReactI18next);
  next.init({
    resources: I18N_RESOURCES,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  instance = next;
  return next;
}
