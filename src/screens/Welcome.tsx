import { useState } from 'react';
import { VERBS } from '../data/verbs';
import { WeekPicker } from '../components/WeekPicker';

export function Welcome({ onStart }: { onStart: (week: number) => void }) {
  const [week, setWeek] = useState<number | null>(null);

  return (
    <main className="screen welcome">
      <header className="welcome-head">
        <p className="eyebrow">Verbos irregulares</p>
        <h1>Vamos a aprender los {VERBS.length} verbos de tu hoja</h1>
      </header>

      <ol className="how">
        <li>
          <strong>Una sesión corta al día.</strong> Unos 10 minutos bastan.
        </li>
        <li>
          <strong>Primero reconoces, luego escribes.</strong> Cada verbo va subiendo de nivel.
        </li>
        <li>
          <strong>Los que fallas vuelven antes;</strong> los que sabes, cada vez más tarde.
        </li>
      </ol>

      <h2 className="section-title">¿En qué semana vais en clase?</h2>
      <p className="muted">Los verbos nuevos saldrán hasta esa semana. Puedes cambiarlo cuando quieras.</p>
      <WeekPicker value={week} onChange={setWeek} />

      <div className="sticky-action">
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={week === null}
          onClick={() => week !== null && onStart(week)}
        >
          Empezar
        </button>
      </div>
    </main>
  );
}
