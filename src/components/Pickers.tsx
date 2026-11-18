import { WEEKS, verbsOfWeek } from '../data/verbs';
import { MAX_AGE, MIN_AGE } from '../engine/profile';
import { Icon } from './Icon';

const AGES = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

export function AgePicker({
  value,
  onChange,
  labelledBy,
}: {
  value: number | null;
  onChange: (age: number) => void;
  labelledBy: string;
}) {
  return (
    <div className="age-picker" role="radiogroup" aria-labelledby={labelledBy}>
      {AGES.map((age) => (
        <button
          key={age}
          type="button"
          role="radio"
          aria-checked={value === age}
          className={`age-option ${value === age ? 'is-selected' : ''}`}
          onClick={() => onChange(age)}
        >
          {age === MAX_AGE ? `${age}+` : age}
        </button>
      ))}
    </div>
  );
}

export function WeekPicker({ value, onChange }: { value: number | null; onChange: (week: number) => void }) {
  return (
    <div className="week-picker" role="radiogroup" aria-label="Semana">
      {WEEKS.map((week) => {
        const verbs = verbsOfWeek(week);
        const selected = value === week;
        return (
          <button
            key={week}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`week-option tint-${((week - 1) % 5) + 1} ${selected ? 'is-selected' : ''}`}
            onClick={() => onChange(week)}
          >
            <span className="week-option-label">Semana</span>
            <span className="week-option-number">{week}</span>
            <span className="week-option-range" lang="en">
              {verbs[0]?.base} … {verbs[verbs.length - 1]?.base}
            </span>
            {selected && (
              <span className="week-option-check">
                <Icon name="check" size={15} strokeWidth={3.5} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
