import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  // --- Task 1: Environment Variable Configuration ---
  // Vite uses import.meta.env.VITE_... 
  // Create React App uses process.env.REACT_APP_...
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_BASE}/todos`)
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(err => console.error("Error fetching:", err));
  }, []);

  const addTodo = async () => {
    const res = await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });
    const data = await res.json();
    setTodos([...todos, data]);
    setInput('');
  };

  return (
    <div className="App">
      <h1>Deployment Demo Todo</h1>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>Add Task</button>
      <ul>
        {todos.map(todo => (
          <li key={todo._id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;