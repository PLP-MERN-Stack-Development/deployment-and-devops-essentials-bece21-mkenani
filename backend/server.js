const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// In-memory storage as fallback
let inMemoryTodos = [];
let nextId = 1;

// MongoDB Connection with fallback
const MONGODB_URI = process.env.MONGODB_URI;
let usingMongoDB = false;

console.log('🔗 Attempting MongoDB connection...');
console.log('Database URL:', MONGODB_URI);

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    usingMongoDB = true;
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.log('⚠️  MongoDB connection failed, using in-memory storage');
    console.log('💡 For production, use MongoDB Atlas with proper network configuration');
    console.log('Error:', error.message);
    usingMongoDB = false;
  }
};

// Connect to database (but don't block server startup)
connectToDatabase();

// Todo Schema (for MongoDB)
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Todo = usingMongoDB ? mongoose.model('Todo', todoSchema) : null;

// Routes
app.get('/api/health', async (req, res) => {
  const dbStatus = usingMongoDB ? 
    (mongoose.connection.readyState === 1 ? 'connected' : 'disconnected') : 
    'in-memory';
  
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      type: usingMongoDB ? 'mongodb' : 'in-memory',
      readyState: usingMongoDB ? mongoose.connection.readyState : 'N/A'
    },
    urls: {
      frontend: process.env.FRONTEND_URL,
      backend: `http://localhost:${process.env.PORT || 5000}`
    }
  });
});

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    if (usingMongoDB && Todo) {
      const todos = await Todo.find().sort({ createdAt: -1 });
      res.json(todos);
    } else {
      // Use in-memory storage
      res.json(inMemoryTodos);
    }
  } catch (error) {
    // Fallback to in-memory if MongoDB fails
    res.json(inMemoryTodos);
  }
});

// Create a new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (usingMongoDB && Todo) {
      const todo = new Todo({ title });
      await todo.save();
      res.status(201).json(todo);
    } else {
      // Use in-memory storage
      const todo = {
        _id: `mem-${nextId++}`,
        title,
        completed: false,
        createdAt: new Date()
      };
      inMemoryTodos.unshift(todo);
      res.status(201).json(todo);
    }
  } catch (error) {
    // Fallback to in-memory if MongoDB fails
    const todo = {
      _id: `mem-${nextId++}`,
      title: req.body.title,
      completed: false,
      createdAt: new Date()
    };
    inMemoryTodos.unshift(todo);
    res.status(201).json(todo);
  }
});

// Update a todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    if (usingMongoDB && Todo) {
      const todo = await Todo.findByIdAndUpdate(
        id,
        { completed },
        { new: true }
      );
      
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      res.json(todo);
    } else {
      // Use in-memory storage
      const todoIndex = inMemoryTodos.findIndex(todo => todo._id === id);
      if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      inMemoryTodos[todoIndex].completed = completed;
      res.json(inMemoryTodos[todoIndex]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (usingMongoDB && Todo) {
      const todo = await Todo.findByIdAndDelete(id);
      
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      res.json({ message: 'Todo deleted successfully' });
    } else {
      // Use in-memory storage
      const todoIndex = inMemoryTodos.findIndex(todo => todo._id === id);
      if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      inMemoryTodos.splice(todoIndex, 1);
      res.json({ message: 'Todo deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
});