import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoItem from "./TodoItem.jsx";

const todo = {
  id: "todo-1",
  text: "Купить хлеб",
  completed: false,
  createdAt: new Date("2026-11-15T10:00:00Z").getTime(),
};

function renderItem(overrides = {}) {
  const handlers = {
    onToggle: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
  };

  render(<TodoItem todo={todo} {...handlers} {...overrides} />);

  return handlers;
}

describe("TodoItem", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("показывает текст задачи и дату", () => {
    renderItem();

    expect(screen.getByText("Купить хлеб")).toBeInTheDocument();
    expect(screen.getByText(/15\.11\.2026/)).toBeInTheDocument();
  });

  it("вызывает onToggle с id при изменении чекбокса", () => {
    const { onToggle } = renderItem();

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("todo-1");
  });

  it("вызывает onDelete с id после анимации удаления", () => {
    vi.useFakeTimers();
    const { onDelete } = renderItem();

    fireEvent.click(screen.getByRole("button", { name: "Удалить" }));

    expect(onDelete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("todo-1");
  });

  it("вызывает onEdit с id и новым текстом", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    renderItem({ onEdit });

    await user.click(screen.getByRole("button", { name: "Изменить" }));

    const input = screen.getByRole("textbox", { name: "Новый текст задачи" });
    await user.clear(input);
    await user.type(input, "Купить молоко");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith("todo-1", "Купить молоко");
  });

  it("не сохраняет пустой текст при редактировании", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    renderItem({ onEdit });

    await user.click(screen.getByRole("button", { name: "Изменить" }));

    const input = screen.getByRole("textbox", { name: "Новый текст задачи" });
    await user.clear(input);
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Текст не может быть пустым"
    );
  });

  it("отменяет редактирование без вызова onEdit", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    renderItem({ onEdit });

    await user.click(screen.getByRole("button", { name: "Изменить" }));
    await user.type(
      screen.getByRole("textbox", { name: "Новый текст задачи" }),
      " — новый текст"
    );
    await user.click(screen.getByRole("button", { name: "Отмена" }));

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByText("Купить хлеб")).toBeInTheDocument();
  });
});
