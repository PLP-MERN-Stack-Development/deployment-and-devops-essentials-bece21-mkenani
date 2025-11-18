require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// --- Task 1: Security & Logging Configuration ---
app.use(express.json());
app.use(cors());
app.use(helmet()); // Secure HTTP Headers
app.use(morgan('combined')); // Logging for production

// --- Database Connection (MongoDB Atlas) ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

// --- Simple To-Do Model ---
const TodoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
});
const Todo = mongoose.model('Todo', TodoSchema);

// --- Routes ---
// Health Check (Task 5 Requirement)
app.get('/health', (req, res) => res.status(200).send('OK'));

app.get('/todos', async (req, res) => {
    const todos = await Todo.find();
    res.json(todos);
});

app.post('/todos', async (req, res) => {
    const newTodo = new Todo({ text: req.body.text });
    await newTodo.save();
    res.json(newTodo);
});

// --- Global Error Handling (Task 1 Requirement) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});