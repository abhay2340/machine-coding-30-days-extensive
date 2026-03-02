import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToDoApp from './index'
describe("ToDoApp", () => {
  it("adds a todo", async () => {
    render(<ToDoApp />);
    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /add new/i });

    await userEvent.type(input, "Learn Testing");
    await userEvent.click(button);

    expect(screen.getByText("Learn Testing")).toBeInTheDocument();
  });

  it("does not add empty todo", async () => {
    render(<ToDoApp />);
    const button = screen.getByRole("button", { name: /add new/i });

    await userEvent.click(button);

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("toggles a todo", async () => {
    render(<ToDoApp />);
    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button");

    await userEvent.type(input, "Task");
    await userEvent.click(button);

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("edits a todo", async () => {
    render(<ToDoApp />);
    const input = screen.getByRole("textbox");
    const addBtn = screen.getByRole("button");

    await userEvent.type(input, "Old Task");
    await userEvent.click(addBtn);

    const editBtn = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editBtn);

    await userEvent.clear(input);
    await userEvent.type(input, "Updated Task");

    const updateBtn = screen.getByRole("button", { name: /update/i });
    await userEvent.click(updateBtn);

    expect(screen.getByText("Updated Task")).toBeInTheDocument();
  });

  it("deletes a todo", async () => {
    render(<ToDoApp />);
    const input = screen.getByRole("textbox");
    const addBtn = screen.getByRole("button");

    await userEvent.type(input, "Delete Me");
    await userEvent.click(addBtn);

    const deleteBtn = screen.getByRole("button", { name: "X" });
    await userEvent.click(deleteBtn);

    expect(screen.queryByText("Delete Me")).not.toBeInTheDocument();
  });
});