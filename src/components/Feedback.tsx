import { useEffect, useRef } from 'react';
import { pastLabel, type Verb } from '../data/verbs';
import { diffWords, type DiffPart } from '../lib/diff';
import type { Verdict } from '../engine/answers';
import { Icon } from './Icon';

interface Props {
  verb: Verb;
  verdict: Verdict;
  onContinue: () => void;
  /** Mostrar la comparación letra a letra (solo cuando el alumno ha escrito). */
  showDiff?: boolean;
}

export function Feedback({ verb, verdict, onContinue, showDiff = false }: Props) {
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    button.current?.focus({ preventScroll: true });
    button.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, []);

  const alternatives = verb.needsAll ? [] : verb.past;

  return (
    <div className={`feedback ${verdict.correct ? 'is-correct' : 'is-wrong'}`} role="status">
      <div className="feedback-head">
        <span className="feedback-icon">
          <Icon name={verdict.correct ? 'check' : 'cross'} size={20} />
        </span>
        <strong>{verdict.correct ? '¡Correcto!' : verdict.message}</strong>
      </div>

      {!verdict.correct && showDiff && verdict.given && verdict.kind !== 'missingForm' && (
        <dl className="diff">
          <dt>Tu respuesta</dt>
          <dd>
            <Letters parts={diffWords(verdict.given, verdict.closest).answer} kind="extra" />
          </dd>
          <dt>Correcta</dt>
          <dd>
            <Letters parts={diffWords(verdict.given, verdict.closest).solution} kind="missing" />
          </dd>
        </dl>
      )}

      <p className="feedback-answer">
        to {verb.base} → <strong>{pastLabel(verb)}</strong>
        {alternatives.length > 1 && <span className="muted"> (valen las dos)</span>}
      </p>

      <button ref={button} type="button" className="btn btn-primary btn-block" onClick={onContinue}>
        Continuar
      </button>
    </div>
  );
}

function Letters({ parts, kind }: { parts: DiffPart[]; kind: 'extra' | 'missing' }) {
  return (
    <span className="letters">
      {parts.map((part, i) =>
        part.changed ? (
          <mark key={i} className={`letters-${kind}`}>
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  );
}
