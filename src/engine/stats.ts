import { verbsOfWeek } from '../data/verbs';
import type { Cards } from './session';

/** Días seguidos estudiando, contando hoy o, si hoy aún no, hasta ayer. */
export function currentStreak(studyDays: number[], today: number): number {
  const days = new Set(studyDays);
  let day = days.has(today) ? today : today - 1;
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day--;
  }
  return streak;
}

/** Estrellas de una sesión según los aciertos a la primera: 3 (≥90 %), 2 (≥70 %) o 1. */
export function sessionStars(right: number, total: number): number {
  if (total === 0) return 0;
  const ratio = right / total;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  return 1;
}

export interface WeekProgress {
  week: number;
  total: number;
  /** Verbos acertados al menos una vez después de presentarlos (caja ≥ 2). */
  learned: number;
  /** 0 si la semana no está completa; 1, 2 o 3 según lo afianzados que estén sus verbos. */
  stars: number;
}

/**
 * Una semana está completa cuando todos sus verbos se han acertado al menos
 * una vez (★); ★★ cuando todos están ya en repaso (caja ≥ 3) y ★★★ cuando
 * todos están dominados (caja 5).
 */
export function weekProgress(cards: Cards, week: number): WeekProgress {
  const boxes = verbsOfWeek(week).map((verb) => cards[verb.id]?.box ?? 0);
  const all = (min: number) => boxes.every((box) => box >= min);
  const stars = all(2) ? 1 + Number(all(3)) + Number(all(5)) : 0;
  return { week, total: boxes.length, learned: boxes.filter((box) => box >= 2).length, stars };
}
