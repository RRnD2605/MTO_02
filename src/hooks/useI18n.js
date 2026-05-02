import { useState, useCallback } from 'react';
import fr from '../i18n/fr.js';
import en from '../i18n/en.js';

const TRANSLATIONS = { fr, en };
const LS_LANG_KEY = 'meteo_golf_lang_v1';

const getInitialLang = () => {
  const stored = localStorage.getItem(LS_LANG_KEY);
  if (stored && TRANSLATIONS[stored]) return stored;
  const browser = navigator.language.slice(0, 2);
  return TRANSLATIONS[browser] ? browser : 'fr';
};

export function useI18n() {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((newLang) => {
    if (!TRANSLATIONS[newLang]) return;
    localStorage.setItem(LS_LANG_KEY, newLang);
    setLangState(newLang);
  }, []);

  const t = useCallback(
    (key, vars = {}) => {
      const dict = TRANSLATIONS[lang] || fr;
      let str = dict[key] ?? key;
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
      return str;
    },
    [lang]
  );

  return { lang, setLang, t };
}
