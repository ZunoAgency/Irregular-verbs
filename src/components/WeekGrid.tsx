import { WEEKS, verbsOfWeek } from '../data/verbs';
import type { Cards } from '../engine/session';
import { STATUS_LABEL, statusOf } from './status';

export function WeekGrid({ cards, currentWeek }: { cards: Cards; currentWeek: number }) {
  return (
    <ol className="week-rows">
      {WEEKS.map((week) => {
        const verbs = verbsOfWeek(week);
        const mastered = verbs.filter((verb) => statusOf(cards[verb.id]) === 'mastered').length;
        const rowClass = ['week-row', week > currentWeek && 'is-future', week === currentWeek && 'is-current']
          .filter(Boolean)
          .join(' ');
        return (
          <li key={week} className={rowClass}>
            <span className="week-label">S{week}</span>
            <span className="week-cells">
              {verbs.map((verb) => {
                const status = statusOf(cards[verb.id]);
                return (
                  <span key={verb.id} className={`cell cell-${status}`} title={`to ${verb.base}: ${STATUS_LABEL[status]}`} />
                );
              })}
            </span>
            <span className="week-count" aria-label={`${mastered} de ${verbs.length} dominados`}>
              {mastered}/{verbs.length}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
