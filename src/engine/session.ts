import { VERBS } from '../data/verbs';
import { shuffle, type Rng } from '../lib/random';
import { kindFor, profileForAge, type LearnerProfile } from './profile';
import { isDue, newCard, type CardState, type QuestionKind } from './srs';

export type StepKind = 'present' | QuestionKind;

export interface Step {
  verbId: number;
  kind: StepKind;
  /** Repetición dentro de la sesión tras un fallo. */
  retry?: boolean;
}

export const SESSION_LIMITS = {
  /** Repasos como máximo por sesión (los más urgentes primero). */
  maxReviews: 20,
  /** Preguntas que pasan antes de repetir un verbo fallado. */
  retryGap: 3,
  /** Veces que se repite un verbo fallado dentro de la misma sesión. */
  maxRetries: 2,
};

export interface SessionPlan {
  steps: Step[];
  reviewCount: number;
  newCount: number;
}

export type Cards = Record<number, CardState | undefined>;

export function cardOf(cards: Cards, verbId: number): CardState {
  return cards[verbId] ?? newCard();
}

/**
 * Prepara la sesión del día:
 *  - primero los repasos pendientes (se eligen los más urgentes y se mezclan),
 *  - después los verbos nuevos (cuántos depende de la edad): los de la semana
 *    actual primero y luego los de semanas anteriores que aún no se han visto.
 *    Se presentan de dos en dos y se preguntan justo después.
 */
export function planSession(
  cards: Cards,
  currentWeek: number,
  today: number,
  profile: LearnerProfile = profileForAge(null),
  rng: Rng = Math.random,
): SessionPlan {
  const due = VERBS.filter((verb) => isDue(cardOf(cards, verb.id), today))
    .sort((a, b) => {
      const ca = cardOf(cards, a.id);
      const cb = cardOf(cards, b.id);
      return ca.box - cb.box || ca.due - cb.due || a.id - b.id;
    })
    .slice(0, SESSION_LIMITS.maxReviews);

  const reviews: Step[] = shuffle(due, rng).map((verb) => ({
    verbId: verb.id,
    kind: kindFor(profile, cardOf(cards, verb.id).box),
  }));

  const unseen = VERBS.filter((verb) => verb.week <= currentWeek && cardOf(cards, verb.id).box === 0).sort(
    (a, b) => Number(b.week === currentWeek) - Number(a.week === currentWeek) || a.id - b.id,
  );
  const newVerbs = due.length >= SESSION_LIMITS.maxReviews ? [] : unseen.slice(0, profile.newPerSession);

  const steps = [...reviews];
  for (let i = 0; i < newVerbs.length; i += 2) {
    const batch = newVerbs.slice(i, i + 2);
    for (const verb of batch) steps.push({ verbId: verb.id, kind: 'present' });
    for (const verb of batch) steps.push({ verbId: verb.id, kind: kindFor(profile, 1) });
  }

  return { steps, reviewCount: reviews.length, newCount: newVerbs.length };
}

/** Cuenta lo que hay pendiente sin preparar la sesión entera (para la pantalla de inicio). */
export function pendingCounts(cards: Cards, currentWeek: number, today: number): { reviews: number; unseen: number } {
  let reviews = 0;
  let unseen = 0;
  for (const verb of VERBS) {
    const card = cardOf(cards, verb.id);
    if (isDue(card, today)) reviews++;
    else if (card.box === 0 && verb.week <= currentWeek) unseen++;
  }
  return { reviews, unseen };
}

/** Inserta la repetición de un verbo fallado unas preguntas más adelante. */
export function scheduleRetry(steps: Step[], index: number, step: Step, retriesSoFar: number): Step[] {
  if (step.kind === 'present' || retriesSoFar >= SESSION_LIMITS.maxRetries) return steps;
  const at = Math.min(steps.length, index + 1 + SESSION_LIMITS.retryGap);
  const next = [...steps];
  next.splice(at, 0, { verbId: step.verbId, kind: step.kind, retry: true });
  return next;
}
