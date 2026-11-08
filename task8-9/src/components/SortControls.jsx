import { SORT_OPTIONS } from "../utils/todos.js";

/**
 * Выбор сортировки списка.
 * @param {{ value: string, onChange: (sortId: string) => void }} props
 */
export default function SortControls({ value, onChange }) {
  return (
    <label className="sort-control">
      <span>Сортировка</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
