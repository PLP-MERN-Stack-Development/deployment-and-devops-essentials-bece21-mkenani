import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // 1. READ (GET)
  useEffect(() => {
    fetch(`${API_BASE}/todos`)
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(err => console.error("Error fetching:", err));
  }, []);

  // 2. CREATE (POST)
  const addTodo = async () => {
    if (!input) return;
    const res = await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });
    const data = await res.json();
    setTodos([...todos, data]);
    setInput('');
  };

  // 3. UPDATE (PUT) - Toggle Complete
  const toggleComplete = async (id, currentStatus) => {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !currentStatus })
    });
    const data = await res.json();

    // Update local state to reflect change immediately
    setTodos(todos.map(todo => 
      todo._id === id ? data : todo
    ));
  };

  // 4. DELETE (DELETE)
  const deleteTodo = async (id) => {
    await fetch(`${API_BASE}/todos/${id}`, {
      method: "DELETE"
    });

    // Filter out the deleted item from local state
    setTodos(todos.filter(todo => todo._id !== id));
  };

  return (
    <div className="App">
      <h1>Deployment Demo Todo</h1>
      
      <div className="add-todo">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Add a task..." 
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo._id} className="todo-item">
            <span 
              style={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
              onClick={() => toggleComplete(todo._id, todo.completed)}
            >
              {todo.text}
            </span>
            
            <button 
              onClick={() => deleteTodo(todo._id)}
              style={{ marginLeft: '10px', background: 'red', color: 'white' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;