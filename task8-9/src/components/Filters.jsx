import { FILTERS } from "../utils/todos.js";

/**
 * Переключатель фильтров списка.
 * @param {{ value: string, onChange: (filterId: string) => void }} props
 */
export default function Filters({ value, onChange }) {
  return (
    <div className="filters" role="group" aria-label="Фильтр задач">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          className={
            filter.id === value ? "filter-btn active" : "filter-btn"
          }
          aria-pressed={filter.id === value}
          onClick={() => onChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
