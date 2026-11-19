import { useState } from 'react';
import { VERBS, getVerb, pastLabel } from '../data/verbs';
import { profileForAge } from '../engine/profile';
import { cardOf, planFor, scheduleRetry, SESSION_LIMITS, type SessionMode, type Step } from '../engine/session';
import { applyAnswer, applyPracticeAnswer, dayNumber, introduce, MAX_BOX } from '../engine/srs';
import { currentStreak, sessionStars } from '../engine/stats';
import type { Progress } from '../storage/progress';
import { Baco } from '../components/Baco';
import { ChoiceQuestion } from '../components/ChoiceQuestion';
import { Icon } from '../components/Icon';
import { PresentCard } from '../components/PresentCard';
import { WriteQuestion } from '../components/WriteQuestion';

interface Props {
  mode: SessionMode;
  progress: Progress;
  update: (change: (progress: Progress) => Progress) => void;
  onExit: () => void;
  /** Empezar otra sesión para seguir aprendiendo. */
  onMore: () => void;
}

interface Result {
  verbId: number;
  correct: boolean;
  retry: boolean;
}

export function Session({ mode, progress, update, onExit, onMore }: Props) {
  const [today] = useState(dayNumber);
  const [profile] = useState(() => profileForAge(progress.settings.age));
  const [steps, setSteps] = useState<Step[]>(
    () => planFor(mode, progress.cards, progress.settings.currentWeek, today, profile).steps,
  );
  const [index, setIndex] = useState(0);
  const [retries, setRetries] = useState<Record<number, number>>({});
  const [results, setResults] = useState<Result[]>([]);

  const step = steps[index];
  const { autoSpeak, name } = progress.settings;

  function handlePresented(verbId: number) {
    update((p) => ({ ...p, cards: { ...p.cards, [verbId]: introduce(cardOf(p.cards, verbId), today) } }));
    setIndex((i) => i + 1);
  }

  /** Guarda la respuesta y devuelve si el verbo se repetirá en esta sesión. */
  function handleAnswer(current: Step, correct: boolean): boolean {
    const earnsStar = correct && !current.retry;
    const answer = current.practice ? applyPracticeAnswer : applyAnswer;
    update((p) => ({
      ...p,
      cards: { ...p.cards, [current.verbId]: answer(cardOf(p.cards, current.verbId), correct, today) },
      studyDays: p.studyDays.includes(today) ? p.studyDays : [...p.studyDays, today],
      stars: p.stars + (earnsStar ? 1 : 0),
    }));
    setResults((r) => [...r, { verbId: current.verbId, correct, retry: Boolean(current.retry) }]);
    if (correct) return false;
    const done = retries[current.verbId] ?? 0;
    setRetries((r) => ({ ...r, [current.verbId]: done + 1 }));
    setSteps((s) => scheduleRetry(s, index, current, done));
    return done < SESSION_LIMITS.maxRetries;
  }

  const next = () => setIndex((i) => i + 1);

  if (!step) return <Summary progress={progress} today={today} results={results} onExit={onExit} onMore={onMore} />;

  const verb = getVerb(step.verbId);
  const percent = Math.round((index / steps.length) * 100);

  return (
    <main className="screen session">
      <header className="session-bar">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Salir de la sesión">
          <Icon name="close" size={20} strokeWidth={3} />
        </button>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={index}
          aria-label="Progreso de la sesión"
        >
          <span style={{ width: `${Math.max(percent, 4)}%` }} />
        </div>
        <span className="session-count">
          {index + 1}/{steps.length}
        </span>
      </header>

      {step.retry && <p className="retry-note">¡Otra vez este! A por él.</p>}

      {step.kind === 'present' && (
        <PresentCard key={index} verb={verb} autoSpeak={autoSpeak} onDone={() => handlePresented(verb.id)} />
      )}
      {step.kind === 'choice' && (
        <ChoiceQuestion
          key={index}
          verb={verb}
          name={name}
          autoSpeak={autoSpeak}
          retry={Boolean(step.retry)}
          onAnswer={(correct) => handleAnswer(step, correct)}
          onContinue={next}
        />
      )}
      {step.kind === 'write' && (
        <WriteQuestion
          key={index}
          verb={verb}
          name={name}
          autoSpeak={autoSpeak}
          retry={Boolean(step.retry)}
          hint={profile.firstLetterHint}
          onAnswer={(correct) => handleAnswer(step, correct)}
          onContinue={next}
        />
      )}
    </main>
  );
}

const TITLES = ['', '¡Buen trabajo, {n}!', '¡Muy bien, {n}!', '¡Genial, {n}!'];

function Summary({
  progress,
  today,
  results,
  onExit,
  onMore,
}: {
  progress: Progress;
  today: number;
  results: Result[];
  onExit: () => void;
  onMore: () => void;
}) {
  const { name } = progress.settings;
  const firstTries = results.filter((r) => !r.retry);
  const right = firstTries.filter((r) => r.correct).length;
  const stars = sessionStars(right, firstTries.length);
  const missed = [...new Set(results.filter((r) => !r.correct).map((r) => r.verbId))].map(getVerb);
  const streak = currentStreak(progress.studyDays, today);
  const mastered = VERBS.filter((verb) => (progress.cards[verb.id]?.box ?? 0) >= MAX_BOX).length;

  if (results.length === 0) {
    return (
      <main className="screen summary">
        <Baco mood="happy" size={180} />
        <h1 className="title">¡Todo al día, {name}!</h1>
        <p className="muted">Vuelve mañana para repasar.</p>
        <button type="button" className="btn btn-primary btn-block btn-big btn-bottom" onClick={onExit}>
          Volver al inicio
        </button>
      </main>
    );
  }

  return (
    <main className="screen summary">
      <Confetti />
      <Baco mood="party" size={200} />
      <h1 className="title title-big">{TITLES[stars]?.replace('{n}', name)}</h1>
      <p className="summary-score">
        {right} de {firstTries.length} a la primera
      </p>

      <div className="summary-stars" role="img" aria-label={`${stars} de 3 estrellas`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`summary-star ${i === 1 ? 'is-middle' : ''} ${i < stars ? '' : 'is-empty'}`}>
            <Icon name="star" size={i === 1 ? 62 : 48} color={i < stars ? 'var(--star)' : 'var(--star-empty)'} />
          </span>
        ))}
      </div>

      <div className="summary-tiles">
        <span className="summary-tile tint-4">
          <Icon name="star" size={24} color="var(--star)" />
          <strong>+{right}</strong>
          {right === 1 ? 'estrella' : 'estrellas'}
        </span>
        <span className="summary-tile tint-flame">
          <Icon name="flame" size={24} color="var(--flame)" />
          <strong>{streak}</strong>
          {streak === 1 ? 'día seguido' : 'días seguidos'}
        </span>
        <span className="summary-tile tint-3">
          <Icon name="check" size={24} color="var(--ok)" />
          <strong>{mastered}</strong>
          {mastered === 1 ? 'dominado' : 'dominados'}
        </span>
      </div>

      {missed.length > 0 && (
        <section className="card missed" aria-labelledby="missed-title">
          <h2 id="missed-title" className="section-title">
            Mañana repasamos
          </h2>
          <ul>
            {missed.map((verb) => (
              <li key={verb.id}>
                <span lang="en">
                  to {verb.base} → <strong>{pastLabel(verb)}</strong>
                </span>
                <span className="muted small">{verb.meaning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="summary-actions">
        <button type="button" className="btn btn-primary btn-block btn-big" onClick={onMore} autoFocus>
          ¡Quiero más! <Icon name="arrowRight" size={22} strokeWidth={3} />
        </button>
        <button type="button" className="btn btn-secondary btn-block" onClick={onExit}>
          Volver al inicio
        </button>
      </div>
    </main>
  );
}

function Confetti() {
  return (
    <svg className="confetti" viewBox="0 0 390 360" aria-hidden="true">
      <rect x="36" y="64" width="12" height="20" rx="3" fill="#FF8FB1" transform="rotate(-25 42 74)" />
      <rect x="330" y="52" width="12" height="20" rx="3" fill="#5CC8FF" transform="rotate(30 336 62)" />
      <circle cx="82" cy="150" r="6" fill="#FFC531" />
      <circle cx="316" cy="170" r="7" fill="#6C4CF5" />
      <rect x="290" y="250" width="10" height="16" rx="3" fill="#3CC47C" transform="rotate(-20 295 258)" />
      <rect x="52" y="270" width="10" height="16" rx="3" fill="#F08A24" transform="rotate(35 57 278)" />
      <circle cx="190" cy="24" r="5" fill="#FF8FB1" />
      <circle cx="352" cy="300" r="4" fill="#FFC531" />
    </svg>
  );
}
