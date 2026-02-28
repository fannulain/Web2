const Database = require('better-sqlite3')
const { v4: uuidv4 } = require('uuid');
const db = new Database('tasks.db')

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        status TEXT NOT NULL,
        input_text TEXT,
        result_data TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
`);

//CREATE
function createTask(inputText, userId) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
        INSERT INTO tasks (id, user_id, status, input_text, result_data, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, 'CREATED', inputText, null, now, now)
    return id;
}

//READ(ОДНУ)
function getTaskById(id) {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id) || null;
}

//READ(ВСІ)
function getAllTasks() {
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
    return stmt.all();
}

//UPDATE(STATUS)
function updateTaskStatus(id, newStatus) {
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?');
    stmt.run(newStatus, now, id);
}

//UPDATE(RESULT)
function saveTaskResult(id, resultData, status = 'DONE') {
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE tasks SET result_data = ?, status = ?, updated_at = ? WHERE id = ?');
    stmt.run(resultData, status, now, id);
}

//UPDATE(TEXT)
function updateTaskText(id, newText) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
        UPDATE tasks SET input_text = ?, status = ?, result_data = ?, updated_at = ? 
        WHERE id = ?
    `);
    stmt.run(newText, 'QUEUED', null, now, id);
}

//DELETE
function deleteTask(id) {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(id);
}

module.exports = {
    createTask,
    getTaskById,
    updateTaskStatus,
    saveTaskResult,
    getAllTasks,
    updateTaskText,
    deleteTask
};
