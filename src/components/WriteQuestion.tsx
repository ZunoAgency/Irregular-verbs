import { useEffect, useRef, useState, type FormEvent } from 'react';
import { pastSpeech, type Verb } from '../data/verbs';
import { checkPast, type Verdict } from '../engine/answers';
import { speak } from '../lib/speech';
import { Feedback } from './Feedback';
import { QuestionPrompt } from './QuestionPrompt';

interface Props {
  verb: Verb;
  autoSpeak: boolean;
  onAnswer: (correct: boolean) => void;
  onContinue: () => void;
}

export function WriteQuestion({ verb, autoSpeak, onAnswer, onContinue }: Props) {
  const [value, setValue] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus({ preventScroll: true });
    if (autoSpeak) speak(`to ${verb.base}`);
  }, [verb, autoSpeak]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (verdict || value.trim() === '') return;
    const result = checkPast(verb, value);
    setVerdict(result);
    if (autoSpeak) speak(pastSpeech(verb));
    onAnswer(result.correct);
  }

  const state = verdict ? (verdict.correct ? 'is-correct' : 'is-wrong') : '';

  return (
    <section className="card question">
      <QuestionPrompt verb={verb} question="Escribe el past simple" />
      <form className="write" onSubmit={submit}>
        <label className="sr-only" htmlFor="answer">
          Past simple de to {verb.base}
        </label>
        <input
          id="answer"
          ref={input}
          className={`write-input ${state}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          readOnly={verdict !== null}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="done"
          lang="en"
          placeholder="Escribe aquí…"
        />
        {verb.needsAll && !verdict && <p className="note">Escribe las dos formas, separadas por «/».</p>}
        {!verdict && (
          <button type="submit" className="btn btn-primary btn-block" disabled={value.trim() === ''}>
            Comprobar
          </button>
        )}
      </form>
      {verdict && <Feedback verb={verb} verdict={verdict} onContinue={onContinue} showDiff />}
    </section>
  );
}
