import { useState } from "react";
import './styles.css'
type Todo = {
  id: string;
  description: string;
  markDone: boolean;
};

const generateId = () => crypto.randomUUID();

export default function ToDoApp() {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [value, setValue] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const handleAddTodo = () => {
    if (!value.trim()) return;

    if (editId === null) {
      setTodoList(prev => [
        ...prev,
        { id: generateId(), description: value.trim(), markDone: false }
      ]);
    } else {
      setTodoList(prev =>
        prev.map(todo =>
          todo.id === editId
            ? { ...todo, description: value.trim() }
            : todo
        )
      );
      setEditId(null);
    }

    setValue("");
  };

  const handleRemoveTodo = (id: string) => {
    setTodoList(prev => prev.filter(todo => todo.id !== id));

    if (editId === id) {
      setEditId(null);
      setValue("");
    }
  };

  const handleEditTodo = (id: string) => {
    const editTodo = todoList.find(todo => todo.id === id);
    if (!editTodo) return;

    setEditId(id);
    setValue(editTodo.description);
  };

  const handleMarkAsRead = (id: string) => {
    setTodoList(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, markDone: !todo.markDone }
          : todo
      )
    );
  };

  return (
    <div>
      {todoList.map(todo => (
      
        <div className="todo-item" key={todo.id}>
  <input
    type="checkbox"
    checked={todo.markDone}
    onChange={() => handleMarkAsRead(todo.id)}
  />
  <p className={todo.markDone ? "completed" : ""}>
    {todo.description}
  </p>
  <div className="actions">
    <button className="delete-btn" onClick={() => handleRemoveTodo(todo.id)}>X</button>
    <button className="edit-btn" onClick={() => handleEditTodo(todo.id)}>Edit</button>
  </div>
</div>
      ))}

     <div className="input-section">
  <input
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
  <button className="primary-btn" onClick={handleAddTodo}>
    {editId ? "Update" : "Add New"}
  </button>
</div>
    </div>
  );
}