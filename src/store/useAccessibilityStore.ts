import { create } from 'zustand';
import { SupportedLanguage } from '@/types';

const A11Y_STORAGE_KEY = 'godavari_flow_a11y_prefs_v1';

interface AccessibilityPreferencesState {
  language: SupportedLanguage;
  seniorCitizenMode: boolean;
  highContrastMode: boolean;
  reducedMotionMode: boolean;

  setLanguage: (lang: SupportedLanguage) => void;
  toggleSeniorCitizenMode: () => void;
  setSeniorCitizenMode: (enabled: boolean) => void;
  toggleHighContrastMode: () => void;
  toggleReducedMotionMode: () => void;
}

function loadSavedA11yPrefs() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    language: 'en' as SupportedLanguage,
    seniorCitizenMode: false,
    highContrastMode: false,
    reducedMotionMode: false,
  };
}

function saveAndApplyDOMAttributes(prefs: {
  language: SupportedLanguage;
  seniorCitizenMode: boolean;
  highContrastMode: boolean;
  reducedMotionMode: boolean;
}) {
  try {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('lang', prefs.language);
      root.setAttribute('data-lang', prefs.language);
      root.setAttribute('data-senior-mode', String(prefs.seniorCitizenMode));
      root.setAttribute('data-high-contrast', String(prefs.highContrastMode));
      root.setAttribute('data-reduced-motion', String(prefs.reducedMotionMode));
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(prefs));
    }
  } catch {
    // Ignore storage write errors
  }
}

const initialPrefs = loadSavedA11yPrefs();
saveAndApplyDOMAttributes(initialPrefs);

export const useAccessibilityStore = create<AccessibilityPreferencesState>(
  (set, get) => ({
    language: initialPrefs.language || 'en',
    seniorCitizenMode: Boolean(initialPrefs.seniorCitizenMode),
    highContrastMode: Boolean(initialPrefs.highContrastMode),
    reducedMotionMode: Boolean(initialPrefs.reducedMotionMode),

    setLanguage: (language) => {
      const next = { ...get(), language };
      saveAndApplyDOMAttributes(next);
      set({ language });
    },

    toggleSeniorCitizenMode: () => {
      const seniorCitizenMode = !get().seniorCitizenMode;
      const next = { ...get(), seniorCitizenMode };
      saveAndApplyDOMAttributes(next);
      set({ seniorCitizenMode });
    },

    setSeniorCitizenMode: (seniorCitizenMode) => {
      const next = { ...get(), seniorCitizenMode };
      saveAndApplyDOMAttributes(next);
      set({ seniorCitizenMode });
    },

    toggleHighContrastMode: () => {
      const highContrastMode = !get().highContrastMode;
      const next = { ...get(), highContrastMode };
      saveAndApplyDOMAttributes(next);
      set({ highContrastMode });
    },

    toggleReducedMotionMode: () => {
      const reducedMotionMode = !get().reducedMotionMode;
      const next = { ...get(), reducedMotionMode };
      saveAndApplyDOMAttributes(next);
      set({ reducedMotionMode });
    },
  })
);

