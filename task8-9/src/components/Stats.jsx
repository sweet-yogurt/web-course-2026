import { memo } from "react";

/**
 * Счётчики задач.
 * @param {{ total: number, remaining: number, completed: number }} props
 */
function Stats({ total, remaining, completed }) {
  return (
    <div className="counter" aria-label="Статистика задач">
      <span>
        Всего: <strong>{total}</strong>
      </span>
      <span>
        Осталось: <strong>{remaining}</strong>
      </span>
      <span>
        Выполнено: <strong>{completed}</strong>
      </span>
    </div>
  );
}

export default memo(Stats);
