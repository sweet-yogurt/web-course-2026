import { memo } from "react";

function Filters({ filters, categories, onChange, onReset }) {
  function update(patch) {
    onChange({ ...filters, ...patch });
  }

  return (
    <section className="filters">
      <h2>Фильтры</h2>
      <div className="filters-grid">
        <label>
          Тип
          <select
            value={filters.type}
            onChange={(event) => update({ type: event.target.value })}
          >
            <option value="all">Все</option>
            <option value="income">Только доходы</option>
            <option value="expense">Только расходы</option>
          </select>
        </label>

        <label>
          Категория
          <select
            value={filters.categoryId}
            onChange={(event) => update({ categoryId: event.target.value })}
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name} ({category.type === "income" ? "доход" : "расход"})
              </option>
            ))}
          </select>
        </label>

        <label>
          С даты
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => update({ dateFrom: event.target.value })}
          />
        </label>

        <label>
          По дату
          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => update({ dateTo: event.target.value })}
          />
        </label>

        <button type="button" className="btn-secondary" onClick={onReset}>
          Сбросить
        </button>
      </div>
    </section>
  );
}

export default memo(Filters);
