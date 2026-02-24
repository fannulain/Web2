const express = require('express');
const {
    createTask,
    getTaskById,
    updateTaskStatus,
    saveTaskResult,
    getAllTasks
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

function simulateHeavyProcessing(taskId, text) {
    //оновлення статусу на PROCESSING
    updateTaskStatus(taskId, 'PROCESSING');
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
            saveTaskResult(taskId, resultData, 'DONE');
            console.log(`[Task ${taskId}] Status changed to DONE. Result saved.`);
        } catch (e) {
            console.error(`[Task ${taskId}] Error processing task:`, e);
            updateTaskStatus(taskId, 'ERROR');
        }
    }, processingTime);
}

//POST /tasks
app.post('/tasks', (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Valid text is required in the body' });
    }

    //створення нового завдання
    const taskId = createTask(text);
    console.log(`[Task ${taskId}] Created new task.`);

    //оновлення статусу на QUEUED
    updateTaskStatus(taskId, 'QUEUED');
    console.log(`[Task ${taskId}] Status changed to QUEUED.`);

    //симуляція обробки
    simulateHeavyProcessing(taskId, text);

    //повертаємо інформацію про створене завдання
    return res.status(201).json({
        id: taskId,
        status: 'QUEUED',
        message: 'Task received and queued for processing.'
    });
});

//GET /tasks/:id
app.get('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const task = getTaskById(id);

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
    const tasks = getAllTasks();

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Data Storage: tasks.db`);
});
