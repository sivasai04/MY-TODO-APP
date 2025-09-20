require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Import mongoose
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

// Import Mongoose Models
const User = require('./models/User');
const Todo = require('./models/Todo');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// --- Middleware ---
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Auth Routes ---
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
        res.status(201).json({ token, user: { id: newUser._id, email: newUser.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error during signup.' });
    }
});


app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        // NOTE: For deployment, 'secure' should be true. For local testing with http, you might need it to be false.
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error during signin.' });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ message: "Logged out successfully" });
});


// --- Protected Todo Routes ---
app.get('/todos', authenticateToken, async (req, res) => {
    try {
        const userTodos = await Todo.find({ userId: req.user.id });
        res.json(userTodos);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch todos.' });
    }
});

app.post('/todos', authenticateToken, async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: "Title is required" });
        
        const newTodo = new Todo({ title, userId: req.user.id });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create todo.' });
    }
});

app.put('/todos/:id', authenticateToken, async (req, res) => {
    try {
        const { title } = req.body;
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id }, // Find a todo by its ID and ensure it belongs to the user
            { title },
            { new: true } // Return the updated document
        );
        if (!updatedTodo) return res.status(404).json({ message: 'Todo not found or user not authorized.' });
        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update todo.' });
    }
});


app.delete('/todos/:id', authenticateToken, async (req, res) => {
    try {
        const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedTodo) return res.status(404).json({ message: 'Todo not found or user not authorized.' });
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete todo.' });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});