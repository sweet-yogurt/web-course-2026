import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoForm from "./TodoForm.jsx";

describe("TodoForm", () => {
  it("рендерит поле ввода, выбор статуса и кнопку добавления", () => {
    render(<TodoForm onAdd={vi.fn()} />);

    expect(
      screen.getByRole("textbox", { name: "Текст новой задачи" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Статус новой задачи" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Добавить" })
    ).toBeInTheDocument();
  });

  it("вызывает onAdd с введённым текстом и статусом", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<TodoForm onAdd={onAdd} />);

    await user.type(
      screen.getByRole("textbox", { name: "Текст новой задачи" }),
      "  Купить молоко  "
    );
    await user.click(screen.getByRole("button", { name: "Добавить" }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("Купить молоко", false);
  });

  it("передаёт completed=true, если выбран статус «Выполненная»", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<TodoForm onAdd={onAdd} />);

    await user.type(
      screen.getByRole("textbox", { name: "Текст новой задачи" }),
      "Сделать зарядку"
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Статус новой задачи" }),
      "done"
    );
    await user.click(screen.getByRole("button", { name: "Добавить" }));

    expect(onAdd).toHaveBeenCalledWith("Сделать зарядку", true);
  });

  it("не вызывает onAdd для пустого текста и показывает ошибку", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<TodoForm onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: "Добавить" }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Введите текст задачи"
    );
  });

  it("очищает поле после успешного добавления", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<TodoForm onAdd={onAdd} />);

    const input = screen.getByRole("textbox", {
      name: "Текст новой задачи",
    });

    await user.type(input, "Задача");
    await user.click(screen.getByRole("button", { name: "Добавить" }));

    expect(input).toHaveValue("");
  });
});
