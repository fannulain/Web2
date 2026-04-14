process.env.NODE_ENV = 'test';
const {
    createTask,
    getTaskById,
    getAllTasks,
    updateTaskStatus,
    saveTaskResult,
    updateTaskText,
    deleteTask
} = require('../../src/models/db');

describe('Database Model (Unit Tests)', () => {
    let mockUserId = 'user123';
    let createdTaskId;

    it('should create a task successfully', () => {
        const inputText = 'test input text';
        createdTaskId = createTask(inputText, mockUserId);
        expect(createdTaskId).toBeDefined();
        expect(typeof createdTaskId).toBe('string');
    });

    it('should get a task by id and userId', () => {
        const task = getTaskById(createdTaskId, mockUserId);
        expect(task).not.toBeNull();
        expect(task.id).toBe(createdTaskId);
        expect(task.user_id).toBe(mockUserId);
        expect(task.status).toBe('CREATED');
        expect(task.input_text).toBe('test input text');
    });

    it('should return null for getTaskById with incorrect userId', () => {
        const task = getTaskById(createdTaskId, 'wrongUser');
        expect(task).toBeNull();
    });

    it('should get all tasks for a specific user', () => {
        const tasks = getAllTasks(mockUserId);
        expect(tasks.length).toBeGreaterThanOrEqual(1);
        expect(tasks[0].id).toBe(createdTaskId);
    });

    it('should update task status', () => {
        updateTaskStatus(createdTaskId, mockUserId, 'QUEUED');
        const task = getTaskById(createdTaskId, mockUserId);
        expect(task.status).toBe('QUEUED');
    });

    it('should save task result (s3Key)', () => {
        saveTaskResult(createdTaskId, mockUserId, 's3TestKey', 'DONE');
        const task = getTaskById(createdTaskId, mockUserId);
        expect(task.status).toBe('DONE');
        expect(task.s3_key).toBe('s3TestKey');
    });

    it('should update task text', () => {
        updateTaskText(createdTaskId, mockUserId, 'new text');
        const task = getTaskById(createdTaskId, mockUserId);
        expect(task.input_text).toBe('new text');
        expect(task.status).toBe('QUEUED');
        expect(task.s3_key).toBeNull();
    });

    it('should delete a task', () => {
        deleteTask(createdTaskId, mockUserId);
        const task = getTaskById(createdTaskId, mockUserId);
        expect(task).toBeNull();
    });
});
