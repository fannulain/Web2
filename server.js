const express = require('express');
const jwt = require('jsonwebtoken');
const {
    createTask,
    getTaskById,
    updateTaskStatus,
    saveTaskResult,
    getAllTasks,
    updateTaskText,
    deleteTask
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key';

app.use(express.json());

function simulateHeavyProcessing(taskId, text, userId) {
    //оновлення статусу на PROCESSING
    updateTaskStatus(taskId, userId, 'PROCESSING');
    console.log(`[Task ${taskId}] Status changed to PROCESSING. Starting work...`);

    //симуляція обробки завдання
    const processingTime = Math.floor(Math.random() * 5000) + 5000;

    setTimeout(() => {
        try {
            console.log(`[Task ${taskId}] Work finished. Parsing dataset...`);
            //симуляція аналізу, рахуємо кількість символів та слів
            const charCount = text.length;
            const wordCount = text.trim().split(/\s+/).length;

            const resultData = JSON.stringify({
                wordCount,
                charCount,
                analysis: "Text analysis completed successfully."
            });

            //оновлення статусу на DONE
            saveTaskResult(taskId, userId, resultData, 'DONE');
            console.log(`[Task ${taskId}] Status changed to DONE. Result saved.`);
        } catch (e) {
            console.error(`[Task ${taskId}] Error processing task:`, e);
            updateTaskStatus(taskId, userId, 'ERROR');
        }
    }, processingTime);
}

//POST /login
app.post('/login', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    const token = jwt.sign({ userId: username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
});

// Middleware для перевірки токена
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.userId = decoded.userId;
        next();
    });
}

//Захищаєм всі маршрути
app.use('/tasks', authenticateToken);

//POST /tasks
app.post('/tasks', authenticateToken, (req, res) => {
    const { text } = req.body;
    const userId = req.userId;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Valid text is required in the body' });
    }

    //створення нового завдання з прив'язкою до користувача
    const taskId = createTask(text, userId);
    console.log(`[Task ${taskId}] Created new task.`);

    //оновлення статусу на QUEUED
    updateTaskStatus(taskId, userId, 'QUEUED');
    console.log(`[Task ${taskId}] Status changed to QUEUED.`);

    //симуляція обробки
    simulateHeavyProcessing(taskId, text, userId);

    //повертаємо інформацію про створене завдання
    return res.status(201).json({
        id: taskId,
        status: 'QUEUED',
        message: 'Task received and queued for processing.'
    });
});

//GET /tasks/:id
app.get('/tasks/:id', (req, res) => {
    const task = getTaskById(req.params.id, req.userId);

    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    //парсимо стрінг в об'єкт
    if (task.result_data) {
        try {
            task.result_data = JSON.parse(task.result_data);
        } catch (e) {
            //поки нічого не робимо
        }
    }

    return res.json(task);
});

//GET /tasks
app.get('/tasks', (req, res) => {
    const tasks = getAllTasks(req.userId);

    //форматування списку завдань
    const formattedTasks = tasks.map(task => {
        if (task.result_data) {
            try {
                task.result_data = JSON.parse(task.result_data);
            } catch (e) { }
        }
        return task;
    });

    return res.json(formattedTasks);
});

// PUT /tasks/:id
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Valid text is required to update the task' });
    }

    //перевірка чи існує
    const task = getTaskById(id, userId);
    if (!task) {
        console.log(`[Task ${id}] Update failed: Task not found.`);
        return res.status(404).json({ error: 'Task not found' });
    }

    //оновлення тексту
    updateTaskText(id, userId, text);
    console.log(`[Task ${id}] Input text updated.`);

    simulateHeavyProcessing(id, text, userId);

    return res.json({
        message: 'Task updated successfully',
        id: id
    });
});

app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    //перевірка чи існує
    const task = getTaskById(id, userId);
    if (!task) {
        console.log(`[Task ${id}] Delete failed: Task not found.`);
        return res.status(404).json({ error: 'Task not found' });
    }

    //видалення
    deleteTask(id, userId);
    console.log(`[Task ${id}] Task deleted from database.`);

    return res.json({
        message: 'Task deleted successfully',
        id: id
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Data Storage: tasks.db`);
});
