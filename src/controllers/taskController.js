const {
    createTask,
    getTaskById,
    getAllTasks,
    updateTaskText,
    deleteTask,
    updateTaskStatus
} = require('../models/db');
const { simulateHeavyProcessing } = require('../services/taskService');

function createNewTask(req, res) {
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
}

function getTask(req, res) {
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
}

function getTasks(req, res) {
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
}

function updateTask(req, res) {
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
}

function removeTask(req, res) {
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
}

module.exports = {
    createNewTask,
    getTask,
    getTasks,
    updateTask,
    removeTask
};
