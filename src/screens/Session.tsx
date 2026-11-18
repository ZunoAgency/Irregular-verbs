import { useState } from 'react';
import { getVerb, pastLabel } from '../data/verbs';
import { cardOf, planSession, scheduleRetry, type Step } from '../engine/session';
import { applyAnswer, dayNumber, introduce } from '../engine/srs';
import type { Progress } from '../storage/progress';
import { ChoiceQuestion } from '../components/ChoiceQuestion';
import { Icon } from '../components/Icon';
import { PresentCard } from '../components/PresentCard';
import { WriteQuestion } from '../components/WriteQuestion';

interface Props {
  progress: Progress;
  update: (change: (progress: Progress) => Progress) => void;
  onExit: () => void;
}

interface Result {
  verbId: number;
  correct: boolean;
  retry: boolean;
}

export function Session({ progress, update, onExit }: Props) {
  const [today] = useState(dayNumber);
  const [steps, setSteps] = useState<Step[]>(
    () => planSession(progress.cards, progress.settings.currentWeek, today).steps,
  );
  const [index, setIndex] = useState(0);
  const [retries, setRetries] = useState<Record<number, number>>({});
  const [results, setResults] = useState<Result[]>([]);

  const step = steps[index];
  const { autoSpeak } = progress.settings;

  function recordStudyDay(p: Progress): number[] {
    return p.studyDays.includes(today) ? p.studyDays : [...p.studyDays, today];
  }

  function handlePresented(verbId: number) {
    update((p) => ({ ...p, cards: { ...p.cards, [verbId]: introduce(cardOf(p.cards, verbId), today) } }));
    setIndex((i) => i + 1);
  }

  function handleAnswer(current: Step, correct: boolean) {
    update((p) => ({
      ...p,
      cards: { ...p.cards, [current.verbId]: applyAnswer(cardOf(p.cards, current.verbId), correct, today) },
      studyDays: recordStudyDay(p),
    }));
    setResults((r) => [...r, { verbId: current.verbId, correct, retry: Boolean(current.retry) }]);
    if (!correct) {
      const done = retries[current.verbId] ?? 0;
      setSteps((s) => scheduleRetry(s, index, current, done));
      setRetries((r) => ({ ...r, [current.verbId]: done + 1 }));
    }
  }

  const next = () => setIndex((i) => i + 1);

  if (!step) return <Summary results={results} onExit={onExit} />;

  const verb = getVerb(step.verbId);
  const percent = Math.round((index / steps.length) * 100);

  return (
    <main className="screen session">
      <header className="session-bar">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Salir de la sesión">
          <Icon name="close" />
        </button>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={index}
          aria-label="Progreso de la sesión"
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <span className="session-count">
          {index + 1}/{steps.length}
        </span>
      </header>

      {step.retry && <p className="retry-note">Otra vez este, ¡a por él!</p>}

      {step.kind === 'present' && (
        <PresentCard key={index} verb={verb} autoSpeak={autoSpeak} onDone={() => handlePresented(verb.id)} />
      )}
      {step.kind === 'choice' && (
        <ChoiceQuestion
          key={index}
          verb={verb}
          autoSpeak={autoSpeak}
          onAnswer={(correct) => handleAnswer(step, correct)}
          onContinue={next}
        />
      )}
      {step.kind === 'write' && (
        <WriteQuestion
          key={index}
          verb={verb}
          autoSpeak={autoSpeak}
          onAnswer={(correct) => handleAnswer(step, correct)}
          onContinue={next}
        />
      )}
    </main>
  );
}

function Summary({ results, onExit }: { results: Result[]; onExit: () => void }) {
  const firstTries = results.filter((r) => !r.retry);
  const right = firstTries.filter((r) => r.correct).length;
  const missed = [...new Set(results.filter((r) => !r.correct).map((r) => r.verbId))].map(getVerb);

  if (results.length === 0) {
    return (
      <main className="screen summary">
        <section className="card">
          <h1 className="title">No hay nada pendiente</h1>
          <p className="muted">Vuelve mañana para repasar.</p>
          <button type="button" className="btn btn-primary btn-block" onClick={onExit}>
            Volver al inicio
          </button>
        </section>
      </main>
    );
  }

  const perfect = right === firstTries.length;

  return (
    <main className="screen summary">
      <section className="card summary-card">
        <p className="summary-emoji" aria-hidden="true">
          {perfect ? '🏆' : '💪'}
        </p>
        <h1 className="title">{perfect ? '¡Perfecto!' : '¡Sesión terminada!'}</h1>
        <p className="summary-score">
          <strong>{right}</strong> de {firstTries.length} a la primera
        </p>

        {missed.length > 0 && (
          <div className="missed">
            <h2 className="section-title">Para mañana</h2>
            <p className="muted">Estos volverán en el próximo repaso:</p>
            <ul>
              {missed.map((verb) => (
                <li key={verb.id}>
                  <span>to {verb.base}</span>
                  <strong lang="en">{pastLabel(verb)}</strong>
                  <span className="muted">{verb.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="button" className="btn btn-primary btn-block" onClick={onExit} autoFocus>
          Volver al inicio
        </button>
      </section>
    </main>
  );
}
