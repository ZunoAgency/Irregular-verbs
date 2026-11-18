import { describe, expect, it } from 'vitest';
import { seededRng } from '../lib/random';
import { profileForAge } from './profile';
import { SESSION_LIMITS, planSession, scheduleRetry, type Cards } from './session';
import type { CardState } from './srs';

const TODAY = 20_000;
const card = (box: number, due: number): CardState => ({ box, due, seen: 1, correct: 0, wrong: 0, lastSeen: TODAY - 1 });

describe('planSession', () => {
  it('sin progreso presenta 4 verbos de la semana 1, de dos en dos', () => {
    const plan = planSession({}, 1, TODAY, profileForAge(12), seededRng(1));
    expect(plan.reviewCount).toBe(0);
    expect(plan.newCount).toBe(4);
    expect(plan.steps.map((s) => `${s.kind}:${s.verbId}`)).toEqual([
      'present:1',
      'present:2',
      'choice:1',
      'choice:2',
      'present:3',
      'present:4',
      'choice:3',
      'choice:4',
    ]);
  });

  it('pone primero los repasos pendientes y los pregunta según su caja', () => {
    const cards: Cards = { 1: card(1, TODAY), 2: card(3, TODAY - 2), 3: card(2, TODAY + 1) };
    const plan = planSession(cards, 1, TODAY, profileForAge(12), seededRng(1));
    expect(plan.reviewCount).toBe(2);
    const reviews = plan.steps.slice(0, 2);
    expect(reviews).toEqual(
      expect.arrayContaining([
        { verbId: 1, kind: 'choice' },
        { verbId: 2, kind: 'write' },
      ]),
    );
    // El 3 no toca hasta mañana y ya está presentado: no sale.
    expect(plan.steps.some((s) => s.verbId === 3)).toBe(false);
    expect(plan.steps.filter((s) => s.kind === 'present').map((s) => s.verbId)).toEqual([4, 5, 6, 7]);
  });

  it('presenta antes los verbos de la semana actual que los de semanas anteriores', () => {
    const plan = planSession({}, 3, TODAY, profileForAge(12), seededRng(1));
    expect(plan.steps.filter((s) => s.kind === 'present').map((s) => s.verbId)).toEqual([15, 16, 17, 18]);
  });

  it('no mete verbos de semanas futuras', () => {
    const cards: Cards = {};
    for (let id = 1; id <= 7; id++) cards[id] = card(2, TODAY + 1);
    const plan = planSession(cards, 1, TODAY, profileForAge(12), seededRng(1));
    expect(plan.steps).toHaveLength(0);
  });

  it('si hay muchos repasos atrasados no añade verbos nuevos', () => {
    const cards: Cards = {};
    for (let id = 1; id <= 30; id++) cards[id] = card(2, TODAY - 1);
    const plan = planSession(cards, 6, TODAY, profileForAge(12), seededRng(1));
    expect(plan.reviewCount).toBe(SESSION_LIMITS.maxReviews);
    expect(plan.newCount).toBe(0);
  });
});

describe('planSession según la edad', () => {
  it('con 9 años presenta 3 verbos nuevos y pregunta eligiendo', () => {
    const plan = planSession({}, 1, TODAY, profileForAge(9), seededRng(1));
    expect(plan.newCount).toBe(3);
    expect(plan.steps.filter((s) => s.kind !== 'present').every((s) => s.kind === 'choice')).toBe(true);
  });

  it('con 15 años escribe desde el principio', () => {
    const plan = planSession({}, 1, TODAY, profileForAge(15), seededRng(1));
    expect(plan.steps.filter((s) => s.kind !== 'present').every((s) => s.kind === 'write')).toBe(true);
  });

  it('con 9 años un verbo en la caja 2 se sigue preguntando eligiendo', () => {
    const plan = planSession({ 1: card(2, TODAY) }, 1, TODAY, profileForAge(9), seededRng(1));
    expect(plan.steps[0]).toEqual({ verbId: 1, kind: 'choice' });
  });
});

describe('scheduleRetry', () => {
  it('repite el verbo fallado unas preguntas después', () => {
    const steps = [1, 2, 3, 4, 5, 6].map((verbId) => ({ verbId, kind: 'write' as const }));
    const next = scheduleRetry(steps, 0, steps[0]!, 0);
    expect(next[1 + SESSION_LIMITS.retryGap]).toEqual({ verbId: 1, kind: 'write', retry: true });
  });

  it('si es la última pregunta, la repite al final', () => {
    const steps = [{ verbId: 9, kind: 'choice' as const }];
    expect(scheduleRetry(steps, 0, steps[0]!, 0)).toHaveLength(2);
  });

  it('no repite más de lo permitido', () => {
    const steps = [{ verbId: 9, kind: 'choice' as const }];
    expect(scheduleRetry(steps, 0, steps[0]!, SESSION_LIMITS.maxRetries)).toBe(steps);
  });
});
