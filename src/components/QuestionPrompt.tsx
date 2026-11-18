import type { Verb } from '../data/verbs';
import { SpeakButton } from './SpeakButton';

export function QuestionPrompt({ verb, question }: { verb: Verb; question: string }) {
  return (
    <div className="prompt">
      <p className="eyebrow">{question}</p>
      <div className="prompt-verb">
        <h2 className="verb">to {verb.base}</h2>
        <SpeakButton text={`to ${verb.base}`} label={`to ${verb.base}`} />
      </div>
      <p className="meaning">{verb.meaning}</p>
    </div>
  );
}
