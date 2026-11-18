import { useEffect } from 'react';
import { FAMILIES, VERBS, pastLabel, pastSpeech, splitExample, type Verb } from '../data/verbs';
import { speak } from '../lib/speech';
import { Icon } from './Icon';
import { SpeakButton } from './SpeakButton';

interface Props {
  verb: Verb;
  autoSpeak: boolean;
  onDone: () => void;
}

export function PresentCard({ verb, autoSpeak, onDone }: Props) {
  const family = FAMILIES[verb.family];
  const relatives = VERBS.filter((other) => other.family === verb.family && other.id !== verb.id)
    .slice(0, 4)
    .map((other) => `${other.base} → ${other.past[0]}`);
  const [before, past, after] = splitExample(verb);

  useEffect(() => {
    if (autoSpeak) speak(`to ${verb.base}. ${pastSpeech(verb)}`);
  }, [verb, autoSpeak]);

  return (
    <section className="card present" aria-labelledby="present-title">
      <p className="eyebrow">
        Verbo nuevo · Semana {verb.week}
      </p>

      <div className="present-forms">
        <div className="form-row">
          <span className="form-label">Infinitivo</span>
          <h2 id="present-title" className="verb">
            to {verb.base}
          </h2>
          <SpeakButton text={`to ${verb.base}`} label={`to ${verb.base}`} />
        </div>
        <span className="form-arrow">
          <Icon name="arrowDown" size={20} />
        </span>
        <div className="form-row">
          <span className="form-label">Past simple</span>
          <p className="verb verb-past">{pastLabel(verb)}</p>
          <SpeakButton text={pastSpeech(verb)} label={pastLabel(verb)} />
        </div>
        <p className="meaning">{verb.meaning}</p>
        {verb.needsAll && <p className="note">Hay que saberse las dos: was (I, he, she, it) y were (you, we, they).</p>}
        {verb.past.length > 1 && !verb.needsAll && <p className="note">Las dos formas son correctas.</p>}
        {verb.pastSpeech && (
          <p className="note">
            Se escribe igual, pero en pasado se pronuncia «{verb.pastSpeech}».
          </p>
        )}
      </div>

      <div className="family">
        <p className="family-name">Familia: {family.name}</p>
        <p className="family-hint">
          {family.hint}
          {relatives.length > 0 && <> Como: {relatives.join(', ')}.</>}
        </p>
      </div>

      <blockquote className="example">
        <p lang="en">
          {before}
          <strong>{past}</strong>
          {after}
          <SpeakButton text={`${before}${verb.pastSpeech ?? past}${after}`} label="la frase" />
        </p>
        <p className="muted">{verb.exampleEs}</p>
      </blockquote>

      <button type="button" className="btn btn-primary btn-block" onClick={onDone} autoFocus>
        Entendido
      </button>
    </section>
  );
}
