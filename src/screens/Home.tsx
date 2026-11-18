import { useMemo } from 'react';
import { VERBS, WEEKS } from '../data/verbs';
import { profileForAge } from '../engine/profile';
import { planSession } from '../engine/session';
import { dayNumber } from '../engine/srs';
import { currentStreak, weekProgress } from '../engine/stats';
import type { Progress } from '../storage/progress';
import { BacoSays } from '../components/Baco';
import { Icon } from '../components/Icon';
import { WeekPath } from '../components/WeekPath';

interface Props {
  progress: Progress;
  onStart: () => void;
  onSettings: () => void;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function Home({ progress, onStart, onSettings }: Props) {
  const { cards, settings } = progress;
  const today = dayNumber();
  const plan = useMemo(
    () => planSession(cards, settings.currentWeek, today, profileForAge(settings.age)),
    [cards, settings.currentWeek, settings.age, today],
  );
  const streak = currentStreak(progress.studyDays, today);
  const weeksDone = WEEKS.filter((week) => weekProgress(cards, week).stars > 0).length;

  const { reviewCount: reviews, newCount: fresh } = plan;
  const hasWork = reviews + fresh > 0;
  const minutes = Math.max(1, Math.round(((reviews + fresh * 2) * 15) / 60));
  const allSeenUpToWeek = VERBS.every((verb) => verb.week > settings.currentWeek || (cards[verb.id]?.box ?? 0) > 0);

  let message: string;
  if (reviews > 0 && fresh > 0) {
    message = `Hoy toca repasar ${plural(reviews, 'verbo', 'verbos')} y conocer ${plural(fresh, 'nuevo', 'nuevos')}. ¿Empezamos?`;
  } else if (reviews > 0) {
    message = `Hoy toca repasar ${plural(reviews, 'verbo', 'verbos')}. ¿Empezamos?`;
  } else if (fresh > 0) {
    message = `Hoy vas a conocer ${plural(fresh, 'verbo nuevo', 'verbos nuevos')}. ¿Empezamos?`;
  } else if (allSeenUpToWeek && settings.currentWeek < WEEKS.length) {
    message = `Ya has visto todos los verbos hasta la semana ${settings.currentWeek}. Si en clase vais por la siguiente, cámbiala en ajustes.`;
  } else {
    message = '¡Todo al día! Vuelve mañana y repasamos juntos.';
  }

  return (
    <main className="screen home">
      <header className="home-head">
        <span className="avatar" aria-hidden="true">
          {settings.name.charAt(0).toUpperCase()}
        </span>
        <h1 className="title">¡Hola, {settings.name}!</h1>
        <button type="button" className="icon-btn" onClick={onSettings} aria-label="Ajustes">
          <Icon name="settings" strokeWidth={2.2} />
        </button>
      </header>

      <div className="pills">
        <span className="pill pill-flame">
          <Icon name="flame" size={20} color="var(--flame)" />
          {streak > 0 ? plural(streak, 'día seguido', 'días seguidos') : 'Empieza tu racha'}
        </span>
        <span className="pill pill-star">
          <Icon name="star" size={20} color="var(--star)" />
          {plural(progress.stars, 'estrella', 'estrellas')}
        </span>
      </div>

      <BacoSays mood={hasWork ? 'normal' : 'happy'}>{message}</BacoSays>

      <section className="card mission" aria-labelledby="mission-title">
        <div className="mission-head">
          <h2 id="mission-title" className="section-title">
            {hasWork ? 'Misión de hoy' : '¡Misión cumplida!'}
          </h2>
          <button type="button" className="chip" onClick={onSettings}>
            Semana {settings.currentWeek}
          </button>
        </div>
        {hasWork ? (
          <>
            <div className="mission-tiles">
              <span className="mission-tile tint-5">
                <strong>{reviews}</strong> {reviews === 1 ? 'repaso' : 'repasos'}
              </span>
              <span className="mission-tile tint-3">
                <strong>{fresh}</strong> {fresh === 1 ? 'nuevo' : 'nuevos'}
              </span>
              <span className="mission-tile tint-4">
                <strong>{minutes}</strong> {minutes === 1 ? 'minuto' : 'minutos'}
              </span>
            </div>
            <button type="button" className="btn btn-primary btn-block btn-big" onClick={onStart}>
              ¡Empezar! <Icon name="arrowRight" size={22} strokeWidth={3} />
            </button>
          </>
        ) : (
          <p className="muted">Repasar justo cuando empiezas a olvidar es lo que hace que los verbos se queden.</p>
        )}
      </section>

      <section aria-labelledby="path-title">
        <div className="path-head">
          <h2 id="path-title" className="section-title">
            Tu camino
          </h2>
          <span className="muted small">
            {weeksDone} de {WEEKS.length} semanas
          </span>
        </div>
        <WeekPath cards={cards} currentWeek={settings.currentWeek} />
      </section>
    </main>
  );
}
