//заглушка без БД
//todo: підключи sqlite і зроби запити

const { v4: uuidv4 } = require('uuid');

const mockDatabase = new Map();

function createTask(inputText) {
    const id = uuidv4();
    const newTask = {
        id,
        status: 'CREATED',
        input_text: inputText,
        result_data: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    mockDatabase.set(id, newTask);
    return id;
}

function getTaskById(id) {
    return mockDatabase.get(id) || null;
}

function updateTaskStatus(id, newStatus) {
    const task = mockDatabase.get(id);
    if (task) {
        task.status = newStatus;
        task.updated_at = new Date().toISOString();
    }
}

function saveTaskResult(id, resultData, status = 'DONE') {
    const task = mockDatabase.get(id);
    if (task) {
        task.result_data = resultData;
        task.status = status;
        task.updated_at = new Date().toISOString();
    }
}

function getAllTasks() {
    return Array.from(mockDatabase.values()).sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );
}

module.exports = {
    createTask,
    getTaskById,
    updateTaskStatus,
    saveTaskResult,
    getAllTasks
};
