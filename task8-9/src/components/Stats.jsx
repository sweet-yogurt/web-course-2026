import { memo } from "react";

/**
 * Счётчики задач.
 * @param {{ total: number, remaining: number, completed: number }} props
 */
function Stats({ total, remaining, completed }) {
  return (
    <section className="stats" aria-label="Статистика задач">
      <div className="stat">
        <span className="stat__label">Всего</span>
        <strong className="stat__value">{total}</strong>
      </div>
      <div className="stat stat--remaining">
        <span className="stat__label">Осталось</span>
        <strong className="stat__value">{remaining}</strong>
      </div>
      <div className="stat stat--completed">
        <span className="stat__label">Выполнено</span>
        <strong className="stat__value">{completed}</strong>
      </div>
    </section>
  );
}

export default memo(Stats);
