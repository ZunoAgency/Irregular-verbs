import { WEEKS } from '../data/verbs';
import type { CardState } from '../engine/srs';

export interface Settings {
  /** Semana en la que va la clase: hasta aquí entran verbos nuevos. */
  currentWeek: number;
  /** Leer en voz alta el verbo al presentarlo y al corregir. */
  autoSpeak: boolean;
  /** Ya se ha elegido la semana la primera vez. */
  onboarded: boolean;
}

export interface Progress {
  version: 1;
  cards: Record<number, CardState | undefined>;
  settings: Settings;
  /** Días (dayNumber) en los que se ha estudiado algo. */
  studyDays: number[];
}

const STORAGE_KEY = 'verbos-irregulares:v1';

export function emptyProgress(): Progress {
  return {
    version: 1,
    cards: {},
    settings: { currentWeek: 1, autoSpeak: true, onboarded: false },
    studyDays: [],
  };
}

export function loadProgress(): Progress {
  const fresh = emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (parsed.version !== 1) return fresh;
    const week = Number(parsed.settings?.currentWeek);
    return {
      version: 1,
      cards: parsed.cards ?? {},
      settings: {
        ...fresh.settings,
        ...parsed.settings,
        currentWeek: WEEKS.includes(week) ? week : 1,
      },
      studyDays: Array.isArray(parsed.studyDays) ? parsed.studyDays : [],
    };
  } catch {
    return fresh;
  }
}

/** Guarda el progreso; devuelve false si el navegador no deja (modo privado, sin espacio…). */
export function saveProgress(progress: Progress): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
