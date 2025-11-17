import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  useEffect(() => {
    checkBackendStatus();
    fetchTodos();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setBackendStatus('connected');
      console.log('Backend status:', response.data);
    } catch (err) {
      setBackendStatus('disconnected');
      setError('Backend server is not responding. Please make sure the backend is running on port 5000.');
      console.error('Backend connection error:', err);
    }
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/todos`);
      setTodos(response.data);
    } catch (err) {
      if (err.response && err.response.status === 503) {
        setError('Database is not connected. The backend is running but MongoDB needs configuration.');
      } else {
        setError('Failed to connect to backend. Please make sure the server is running on port 5000.');
      }
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      setError('');
      const response = await axios.post(`${API_BASE_URL}/todos`, {
        title: newTodo.trim()
      });
      setTodos([response.data, ...todos]);
      setNewTodo('');
    } catch (err) {
      setError('Failed to add todo. Backend might be disconnected.');
      console.error('Error adding todo:', err);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      setError('');
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, {
        completed: !completed
      });
      setTodos(todos.map(todo => 
        todo._id === id ? response.data : todo
      ));
    } catch (err) {
      setError('Failed to update todo.');
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      setError('');
      await axios.delete(`${API_BASE_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (err) {
      setError('Failed to delete todo.');
      console.error('Error deleting todo:', err);
    }
  };

  return (
    <div className="container">
      <h1>✅ MERN Todo App</h1>
      
      {/* Backend Status Indicator */}
      <div style={{
        padding: '10px',
        marginBottom: '20px',
        borderRadius: '5px',
        textAlign: 'center',
        backgroundColor: backendStatus === 'connected' ? '#e8f5e8' : '#ffebee',
        color: backendStatus === 'connected' ? '#2e7d32' : '#c62828',
        border: `1px solid ${backendStatus === 'connected' ? '#4caf50' : '#f44336'}`
      }}>
        Backend Status: 
        <strong>
          {backendStatus === 'connected' ? ' ✅ Connected' : 
           backendStatus === 'disconnected' ? ' ❌ Disconnected' : ' 🔄 Checking...'}
        </strong>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter a new todo..."
          className="todo-input"
          disabled={backendStatus !== 'connected'}
        />
        <button 
          type="submit" 
          className="add-btn"
          disabled={backendStatus !== 'connected'}
        >
          Add Todo
        </button>
      </form>

      {loading ? (
        <div className="loading">Loading todos...</div>
      ) : backendStatus !== 'connected' ? (
        <div className="loading" style={{textAlign: 'center'}}>
          <h3>Backend Connection Required</h3>
          <p>Please make sure your backend server is running on port 5000.</p>
          <button onClick={checkBackendStatus} style={{marginTop: '10px'}}>
            Retry Connection
          </button>
        </div>
      ) : (
        <ul className="todo-list">
          {todos.map(todo => (
            <li 
              key={todo._id} 
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <div className="todo-content">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo._id, todo.completed)}
                  className="todo-checkbox"
                />
                <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                  {todo.title}
                </span>
              </div>
              <div className="todo-actions">
                <button 
                  onClick={() => deleteTodo(todo._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {todos.length === 0 && backendStatus === 'connected' && !loading && (
        <div className="loading">No todos yet. Add one above!</div>
      )}
    </div>
  );
}

export default App;