import { useState, type FormEvent } from 'react';
import { BacoSays } from '../components/Baco';
import { Icon } from '../components/Icon';
import { AgePicker, WeekPicker } from '../components/Pickers';
import { cleanName, type Settings } from '../storage/progress';

interface Props {
  settings: Settings;
  /** Solo falta el nombre y la edad (quien ya eligió semana antes). */
  profileOnly: boolean;
  onDone: (changes: Partial<Settings>) => void;
}

export function Welcome({ settings, profileOnly, onDone }: Props) {
  const [step, setStep] = useState<'profile' | 'week'>('profile');
  const [name, setName] = useState(settings.name);
  const [age, setAge] = useState<number | null>(settings.age);
  const [week, setWeek] = useState<number | null>(settings.onboarded ? settings.currentWeek : null);

  const clean = cleanName(name);
  const profileReady = clean !== '' && age !== null;

  function submitProfile(event: FormEvent) {
    event.preventDefault();
    if (!profileReady) return;
    if (profileOnly) onDone({ name: clean, age });
    else setStep('week');
  }

  if (step === 'profile') {
    return (
      <main className="screen welcome">
        {!profileOnly && <Steps current={0} />}
        <BacoSays>
          ¡Hola! Soy <strong className="baco-name">Baco</strong>, el camaleón. Cambio de color igual que los verbos
          irregulares cambian de forma.
        </BacoSays>

        <header className="welcome-head">
          <h1 className="title">Cuéntame un poco de ti</h1>
          <p className="muted">Así podré llamarte por tu nombre y ponerte retos a tu medida.</p>
        </header>

        <form className="welcome-form" onSubmit={submitProfile}>
          <div className="field">
            <label className="field-label" htmlFor="name">
              ¿Cómo te llamas?
            </label>
            <input
              id="name"
              className="text-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Escribe tu nombre"
              autoComplete="given-name"
              autoCapitalize="words"
              maxLength={24}
              enterKeyHint="next"
            />
          </div>

          <div className="field">
            <span className="field-label" id="age-label">
              ¿Cuántos años tienes?
            </span>
            <AgePicker value={age} onChange={setAge} labelledBy="age-label" />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-big btn-bottom" disabled={!profileReady}>
            {clean ? `¡Vamos, ${clean}!` : '¡Vamos!'} <Icon name="arrowRight" size={22} strokeWidth={3} />
          </button>
          <p className="fine-print">Tu nombre y tu edad solo se guardan en este dispositivo.</p>
        </form>
      </main>
    );
  }

  return (
    <main className="screen welcome">
      <div className="topbar">
        <button type="button" className="icon-btn" onClick={() => setStep('profile')} aria-label="Volver">
          <Icon name="back" />
        </button>
        <Steps current={1} />
        <span className="topbar-spacer" />
      </div>

      <BacoSays>Los verbos nuevos saldrán hasta la semana que elijas.</BacoSays>

      <h1 className="title">¿En qué semana vais en clase, {clean}?</h1>
      <WeekPicker value={week} onChange={setWeek} />

      <button
        type="button"
        className="btn btn-primary btn-block btn-big btn-bottom"
        disabled={week === null}
        onClick={() => week !== null && onDone({ name: clean, age, currentWeek: week, onboarded: true })}
      >
        ¡Empezar! <Icon name="arrowRight" size={22} strokeWidth={3} />
      </button>
    </main>
  );
}

function Steps({ current }: { current: number }) {
  return (
    <div className="steps" aria-label={`Paso ${current + 1} de 2`}>
      {[0, 1].map((i) => (
        <span key={i} className={i === current ? 'is-current' : ''} />
      ))}
    </div>
  );
}
