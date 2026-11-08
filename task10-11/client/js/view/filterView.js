import { el } from "./dom.js";

export const filterView = {
  render(filters) {
    el.filterType.value = filters.type;
    el.filterCategory.value = filters.categoryId;
    el.filterDateFrom.value = filters.dateFrom;
    el.filterDateTo.value = filters.dateTo;
  },

  getValues() {
    return {
      type: el.filterType.value,
      categoryId: el.filterCategory.value,
      dateFrom: el.filterDateFrom.value,
      dateTo: el.filterDateTo.value,
    };
  },
};
