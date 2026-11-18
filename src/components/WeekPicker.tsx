import { WEEKS, verbsOfWeek } from '../data/verbs';

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
            className={`week-option ${selected ? 'is-selected' : ''}`}
            onClick={() => onChange(week)}
          >
            <strong>Semana {week}</strong>
            <span>
              {verbs[0]?.base} … {verbs[verbs.length - 1]?.base}
            </span>
          </button>
        );
      })}
    </div>
  );
}
