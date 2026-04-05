jest.mock('../../src/models/db', () => ({
    createTask: jest.fn(),
    getTaskById: jest.fn(),
    getAllTasks: jest.fn(),
    updateTaskText: jest.fn(),
    deleteTask: jest.fn(),
    updateTaskStatus: jest.fn()
}));

jest.mock('../../src/services/rabbitmqService', () => ({
    publishTask: jest.fn()
}));

jest.mock('../../src/services/minioService', () => ({
    getObjectData: jest.fn()
}));

const { createNewTask, updateTask, getTask, getTasks, removeTask } = require('../../src/controllers/taskController');
const db = require('../../src/models/db');
const rabbitmqService = require('../../src/services/rabbitmqService');
const minioService = require('../../src/services/minioService');

describe('Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, userId: 'Vitalii', params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('createNewTask', () => {
        test('400, if no valid text', async () => {
            req.body.text = 123;

            await createNewTask(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Valid text is required in the body' });
        });

        test('create task and publish to RabbitMQ', async () => {
            req.body.text = 'Some NLP text';
            db.createTask.mockReturnValue('mock-id');
            rabbitmqService.publishTask.mockResolvedValue();

            await createNewTask(req, res);

            expect(db.createTask).toHaveBeenCalledWith('Some NLP text', 'Vitalii');
            expect(db.updateTaskStatus).toHaveBeenCalledWith('mock-id', 'Vitalii', 'QUEUED');
            expect(rabbitmqService.publishTask).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateTask', () => {
        test('404, if no task', async () => {
            req.params.id = 'fake-id';
            req.body.text = 'New text';

            db.getTaskById.mockReturnValue(null);

            await updateTask(req, res);

            expect(db.getTaskById).toHaveBeenCalledWith('fake-id', 'Vitalii');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
        });

        test('update task', async () => {
            req.params.id = 'real-id';
            req.body.text = 'Correct new text';

            db.getTaskById.mockReturnValue({ id: 'real-id', text: 'Old text', status: 'DONE' });
            rabbitmqService.publishTask.mockResolvedValue();

            await updateTask(req, res);

            expect(db.updateTaskText).toHaveBeenCalledWith('real-id', 'Vitalii', 'Correct new text');
            expect(db.updateTaskStatus).toHaveBeenCalledWith('real-id', 'Vitalii', 'QUEUED');
            expect(rabbitmqService.publishTask).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getTask', () => {
        test('404, if no task', async () => {
            req.params.id = 'not-found';
            db.getTaskById.mockReturnValue(null);

            await getTask(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('get data from MinIO, if status DONE', async () => {
            req.params.id = 'task-1';
            db.getTaskById.mockReturnValue({
                id: 'task-1',
                status: 'DONE',
                s3_key: 'my-s3-key'
            });
            minioService.getObjectData.mockResolvedValue('{"status": "DONE"}');

            await getTask(req, res);

            expect(minioService.getObjectData).toHaveBeenCalledWith('my-s3-key');
            expect(res.json).toHaveBeenCalledWith({
                id: 'task-1',
                status: 'DONE',
                result: { status: 'DONE' }
            });
        });
    });

    describe('getTasks', () => {
        test('get all tasks with data from MinIO', async () => {
            db.getAllTasks.mockReturnValue([
                { id: '1', status: 'DONE', s3_key: 'key-1' },
                { id: '2', status: 'QUEUED' }
            ]);

            minioService.getObjectData.mockResolvedValue('{"progress": 60}');

            await getTasks(req, res);

            expect(res.json).toHaveBeenCalledWith([
                { id: '1', status: 'DONE', result: { progress: 60 } },
                { id: '2', status: 'QUEUED' }
            ]);
        });
    });

    describe('removeTask', () => {
        test('404, if no task', () => {
            req.params.id = 'ghost';
            db.getTaskById.mockReturnValue(null);

            removeTask(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('delete task', () => {
            req.params.id = 'real';
            db.getTaskById.mockReturnValue({ id: 'real' });

            removeTask(req, res);

            expect(db.deleteTask).toHaveBeenCalledWith('real', 'Vitalii');
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Task deleted successfully' }));
        });
    });
});
