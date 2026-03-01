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
function getTaskById(id, userId) {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId) || null;
}

//READ(ВСІ)
function getAllTasks(userId) {
    const stmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
}

//UPDATE(STATUS)
function updateTaskStatus(id, userId, newStatus) {
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?');
    stmt.run(newStatus, now, id, userId);
}

//UPDATE(RESULT)
function saveTaskResult(id, userId, resultData, status = 'DONE') {
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE tasks SET result_data = ?, status = ?, updated_at = ? WHERE id = ? AND user_id = ?');
    stmt.run(resultData, status, now, id, userId);
}

//UPDATE(TEXT)
function updateTaskText(id, userId, newText) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
        UPDATE tasks SET input_text = ?, status = ?, result_data = ?, updated_at = ? 
        WHERE id = ? AND user_id = ?
    `);
    stmt.run(newText, 'QUEUED', null, now, id, userId);
}

//DELETE
function deleteTask(id, userId) {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);
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
