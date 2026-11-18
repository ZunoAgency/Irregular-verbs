import { useEffect, useMemo, useState } from 'react';
import { pastSpeech, type Verb } from '../data/verbs';
import { checkPast, type Verdict } from '../engine/answers';
import { pastChoices } from '../engine/distractors';
import { speak } from '../lib/speech';
import { Feedback } from './Feedback';
import { QuestionPrompt } from './QuestionPrompt';

interface Props {
  verb: Verb;
  autoSpeak: boolean;
  onAnswer: (correct: boolean) => void;
  onContinue: () => void;
}

export function ChoiceQuestion({ verb, autoSpeak, onAnswer, onContinue }: Props) {
  const { options, correct } = useMemo(() => pastChoices(verb), [verb]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  useEffect(() => {
    if (autoSpeak) speak(`to ${verb.base}`);
  }, [verb, autoSpeak]);

  function choose(option: string) {
    if (chosen) return;
    const isCorrect = option === correct;
    setChosen(option);
    setVerdict(isCorrect ? { correct: true } : checkPast(verb, option));
    if (autoSpeak) speak(pastSpeech(verb));
    onAnswer(isCorrect);
  }

  return (
    <section className="card question">
      <QuestionPrompt verb={verb} question="¿Cuál es el past simple?" />
      <div className="choices" role="group" aria-label="Opciones">
        {options.map((option) => {
          let state = '';
          if (chosen) {
            if (option === correct) state = 'is-correct';
            else if (option === chosen) state = 'is-wrong';
            else state = 'is-dim';
          }
          return (
            <button
              key={option}
              type="button"
              className={`choice ${state}`}
              onClick={() => choose(option)}
              disabled={chosen !== null}
              lang="en"
            >
              {option}
            </button>
          );
        })}
      </div>
      {verdict && <Feedback verb={verb} verdict={verdict} onContinue={onContinue} />}
    </section>
  );
}
