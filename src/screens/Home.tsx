import { useMemo } from 'react';
import { VERBS } from '../data/verbs';
import { planSession } from '../engine/session';
import { dayNumber } from '../engine/srs';
import type { Progress } from '../storage/progress';
import { Icon } from '../components/Icon';
import { WeekGrid } from '../components/WeekGrid';
import { STATUS_LABEL, statusOf, type Status } from '../components/status';

interface Props {
  progress: Progress;
  onStart: () => void;
  onSettings: () => void;
}

export function Home({ progress, onStart, onSettings }: Props) {
  const { cards, settings } = progress;
  const plan = useMemo(() => planSession(cards, settings.currentWeek, dayNumber()), [cards, settings.currentWeek]);
  const totals = useMemo(() => {
    const counts: Record<Status, number> = { unseen: 0, learning: 0, reviewing: 0, mastered: 0 };
    for (const verb of VERBS) counts[statusOf(cards[verb.id])]++;
    return counts;
  }, [cards]);

  const questions = plan.reviewCount + plan.newCount;
  const minutes = Math.max(1, Math.round(((plan.reviewCount + plan.newCount * 2) * 15) / 60));
  const allSeenUpToWeek = VERBS.every((verb) => verb.week > settings.currentWeek || statusOf(cards[verb.id]) !== 'unseen');

  return (
    <main className="screen home">
      <header className="topbar">
        <div>
          <p className="eyebrow">Verbos irregulares</p>
          <h1 className="title">Hola 👋</h1>
        </div>
        <button type="button" className="icon-btn" onClick={onSettings} aria-label="Ajustes">
          <Icon name="settings" />
        </button>
      </header>

      <section className="card today" aria-labelledby="today-title">
        <div className="today-head">
          <h2 id="today-title">Sesión de hoy</h2>
          <button type="button" className="chip" onClick={onSettings}>
            Semana {settings.currentWeek}
          </button>
        </div>
        {questions > 0 ? (
          <>
            <p className="today-counts">
              <span>
                <strong>{plan.reviewCount}</strong> {plan.reviewCount === 1 ? 'repaso' : 'repasos'}
              </span>
              <span>
                <strong>{plan.newCount}</strong> {plan.newCount === 1 ? 'verbo nuevo' : 'verbos nuevos'}
              </span>
              <span className="muted">≈ {minutes} min</span>
            </p>
            <button type="button" className="btn btn-primary btn-block btn-big" onClick={onStart}>
              Empezar
            </button>
          </>
        ) : (
          <div className="all-done">
            <p className="all-done-title">¡Todo al día! 🎉</p>
            <p className="muted">
              {allSeenUpToWeek && settings.currentWeek < 11
                ? 'Ya has visto todos los verbos hasta esta semana. Vuelve mañana para repasar o, si en clase ya habéis pasado a la siguiente, cambia la semana.'
                : 'Vuelve mañana para repasar. Repasar justo cuando empiezas a olvidar es lo que fija los verbos.'}
            </p>
          </div>
        )}
      </section>

      <section className="card" aria-labelledby="progress-title">
        <h2 id="progress-title" className="section-title">
          Tu progreso
        </h2>
        <p className="totals">
          {(Object.keys(STATUS_LABEL) as Status[]).map((status) => (
            <span key={status} className="total">
              <span className={`cell cell-${status}`} />
              <strong>{totals[status]}</strong> {STATUS_LABEL[status].toLowerCase()}
            </span>
          ))}
        </p>
        <WeekGrid cards={cards} currentWeek={settings.currentWeek} />
      </section>
    </main>
  );
}
