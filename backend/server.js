const express = require('express');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-super-secret-key-that-is-long-and-secure'; 


app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser()); 


const USERS_DB_FILE = './users.json';
const TODOS_DB_FILE = './todos.json';

const readDB = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return []; 
    }
};

const writeDB = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token; 
    if (!token) return res.sendStatus(401); 

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user;
        next();
    });
};


app.post('/signup', (req, res) => {
    const { email, password } = req.body;
    const users = readDB(USERS_DB_FILE);

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = { id: Date.now(), email, password: hashedPassword };
    users.push(newUser);
    writeDB(USERS_DB_FILE, users);
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'strict' });
    res.status(201).json({ token, user: { id: newUser.id, email: newUser.email } });
});


app.post('/signin', (req, res) => { 
    const { email, password } = req.body;
    const users = readDB(USERS_DB_FILE);
    const user = users.find(u => u.email === email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'strict' }); 
    res.json({ token, user: { id: user.id, email: user.email } });
});

app.post('/logout', (req, res) => { 
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
});


app.get('/todos', authenticateToken, (req, res) => {
    const allTodos = readDB(TODOS_DB_FILE);
    const userTodos = allTodos.filter(todo => todo.userId === req.user.id);
    res.json(userTodos);
});

app.post('/todos', authenticateToken, (req, res) => { 
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    
    const allTodos = readDB(TODOS_DB_FILE);
    const newTodo = { id: Date.now(), title, userId: req.user.id };
    allTodos.push(newTodo);
    writeDB(TODOS_DB_FILE, allTodos);
    res.status(201).json(newTodo);
});

app.delete('/todos/:id', authenticateToken, (req, res) => { 
    const todoId = parseInt(req.params.id);
    let allTodos = readDB(TODOS_DB_FILE);

    const todo = allTodos.find(t => t.id === todoId);
    if (!todo || todo.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You do not own this todo" });
    }
    
    allTodos = allTodos.filter(t => t.id !== todoId);
    writeDB(TODOS_DB_FILE, allTodos);
    res.sendStatus(204); 
});



app.put('/todos/:id', authenticateToken, (req, res) => {
    const todoId = parseInt(req.params.id);
    const { title } = req.body;
    let allTodos = readDB(TODOS_DB_FILE);

    const todoIndex = allTodos.findIndex(t => t.id === todoId);

    if (todoIndex === -1 || allTodos[todoIndex].userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden or Todo not found" });
    }
    
    allTodos[todoIndex].title = title;
    writeDB(TODOS_DB_FILE, allTodos);
    
    res.json(allTodos[todoIndex]); 
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});