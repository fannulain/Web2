const { createNewTask, getTask, getTasks, updateTask, removeTask } = require('../../src/controllers/taskController');
const db = require('../../src/models/db');
const rabbitmqService = require('../../src/services/rabbitmqService');
const minioService = require('../../src/services/minioService');

jest.mock('../../src/models/db');
jest.mock('../../src/services/rabbitmqService');
jest.mock('../../src/services/minioService');

describe('Task Controller (Unit Tests)', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            userId: 'user-1'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('createNewTask', () => {
        it('should return 400 if text is invalid', async () => {
            req.body.text = null;
            await createNewTask(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Valid text is required in the body' });
        });

        it('should create a task and queue it', async () => {
            req.body.text = 'hello';
            db.createTask.mockReturnValue('task-1');
            rabbitmqService.publishTask.mockResolvedValue();

            await createNewTask(req, res);

            expect(db.createTask).toHaveBeenCalledWith('hello', 'user-1');
            expect(db.updateTaskStatus).toHaveBeenCalledWith('task-1', 'user-1', 'QUEUED');
            expect(rabbitmqService.publishTask).toHaveBeenCalledWith({ taskId: 'task-1', text: 'hello', userId: 'user-1' });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'QUEUED' }));
        });

        it('should return 500 if publishing fails', async () => {
            req.body.text = 'hello';
            db.createTask.mockReturnValue('task-1');
            rabbitmqService.publishTask.mockRejectedValue(new Error('Broker down'));

            await createNewTask(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to queue task for processing' });
        });
    });

    describe('getTask', () => {
        it('should return 404 if task not found', async () => {
            req.params.id = 'task-1';
            db.getTaskById.mockReturnValue(null);

            await getTask(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return task without fetching from minio if status is not DONE', async () => {
            req.params.id = 'task-1';
            const mockTask = { id: 'task-1', status: 'QUEUED', user_id: 'user-1' };
            db.getTaskById.mockReturnValue(mockTask);

            await getTask(req, res);

            expect(minioService.getObjectData).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockTask);
        });

        it('should fetch from minio if status is DONE and s3_key exists', async () => {
            req.params.id = 'task-1';
            const mockTask = { id: 'task-1', status: 'DONE', s3_key: 'key-1' };
            db.getTaskById.mockReturnValue(mockTask);
            minioService.getObjectData.mockResolvedValue('{"result": "success"}');

            await getTask(req, res);

            expect(minioService.getObjectData).toHaveBeenCalledWith('key-1');
            expect(res.json).toHaveBeenCalledWith({
                id: 'task-1',
                status: 'DONE',
                result: { result: "success" }
            });
        });

        it('should handle MinIO errors silently when fetching task', async () => {
            req.params.id = 'task-3';
            const mockTask = { id: 'task-3', status: 'DONE', s3_key: 'key-err' };
            db.getTaskById.mockReturnValue(mockTask);
            minioService.getObjectData.mockRejectedValue(new Error('MinIO down'));

            await getTask(req, res);

            expect(minioService.getObjectData).toHaveBeenCalledWith('key-err');
            expect(res.json).toHaveBeenCalledWith({
                id: 'task-3',
                status: 'DONE',
                result: null
            });
        });
    });

    describe('getTasks', () => {
        it('should return all tasks for user and fetch minio data for DONE tasks', async () => {
            const mockTasks = [
                { id: '1', status: 'QUEUED' },
                { id: '2', status: 'DONE', s3_key: 'key-1' },
                { id: '3', status: 'DONE', s3_key: 'key-err' }
            ];
            db.getAllTasks.mockReturnValue(mockTasks);

            minioService.getObjectData.mockImplementation((key) => {
                if (key === 'key-1') return Promise.resolve('{"data": "ok"}');
                return Promise.reject(new Error('S3 err'));
            });

            await getTasks(req, res);

            expect(db.getAllTasks).toHaveBeenCalledWith('user-1');
            expect(res.json).toHaveBeenCalledWith([
                { id: '1', status: 'QUEUED' },
                { id: '2', status: 'DONE', result: { data: 'ok' } },
                { id: '3', status: 'DONE', result: null }
            ]);
        });
    });

    describe('updateTask', () => {
        it('should return 400 if text is invalid', async () => {
            req.params.id = 't-1';
            req.body.text = '';
            await updateTask(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if task not found', async () => {
            req.params.id = 't-nope';
            req.body.text = 'new text';
            db.getTaskById.mockReturnValue(null);

            await updateTask(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should update text, set QUEUED, and publish to queue', async () => {
            req.params.id = 't-1';
            req.body.text = 'updated text';
            db.getTaskById.mockReturnValue({ id: 't-1' });
            rabbitmqService.publishTask.mockResolvedValue();

            await updateTask(req, res);

            expect(db.updateTaskText).toHaveBeenCalledWith('t-1', 'user-1', 'updated text');
            expect(db.updateTaskStatus).toHaveBeenCalledWith('t-1', 'user-1', 'QUEUED');
            expect(rabbitmqService.publishTask).toHaveBeenCalledWith({ taskId: 't-1', text: 'updated text', userId: 'user-1' });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 500 if publishing fails during update', async () => {
            req.params.id = 't-1';
            req.body.text = 'hello';
            db.getTaskById.mockReturnValue({ id: 't-1' });
            rabbitmqService.publishTask.mockRejectedValue(new Error('Broker error'));

            await updateTask(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('removeTask', () => {
        it('should return 404 if task not found', () => {
            req.params.id = 't-nope';
            db.getTaskById.mockReturnValue(null);

            removeTask(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should delete existing task and return 200', () => {
            req.params.id = 't-2';
            db.getTaskById.mockReturnValue({ id: 't-2' });

            removeTask(req, res);
            expect(db.deleteTask).toHaveBeenCalledWith('t-2', 'user-1');
            expect(res.json).toHaveBeenCalledWith({ message: 'Task deleted successfully', id: 't-2' });
        });
    });
});
