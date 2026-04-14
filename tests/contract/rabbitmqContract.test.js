const { GenericContainer, Wait } = require("testcontainers");
const amqplib = require('amqplib');
const rabbitmqService = require('../../src/services/rabbitmqService');

describe("RabbitMQ Contract Test", () => {
    let container;
    let connection;
    let channel;
    let amqpUrl;

    beforeAll(async () => {
        container = await new GenericContainer("rabbitmq:3-management")
            .withExposedPorts(5672)
            .withWaitStrategy(Wait.forLogMessage(/Server startup complete/))
            .start();

        const port = container.getMappedPort(5672);
        const host = container.getHost();
        amqpUrl = `amqp://${host}:${port}`;

        process.env.RABBITMQ_URL = amqpUrl;

        connection = await amqplib.connect(amqpUrl);
        channel = await connection.createChannel();
        await channel.assertQueue('transcription.request', { durable: true });

        await rabbitmqService.connectRabbitMQ();
    }, 120000);

    afterAll(async () => {
        if (channel) await channel.close();
        if (connection) await connection.close();
        await rabbitmqService.closeRabbitMQ();
        if (container) await container.stop();
    });

    it("should match the publish task contract", async () => {
        const taskPayload = { taskId: 'test123', text: 'Hello RabbitMQ', userId: 'user1' };

        await rabbitmqService.publishTask(taskPayload);

        await new Promise(r => setTimeout(r, 500));

        const msg = await channel.get('transcription.request', { noAck: true });
        expect(msg).not.toBe(false);
        if (msg) {
            const parsed = JSON.parse(msg.content.toString());
            expect(parsed).toEqual(taskPayload);
            expect(parsed.taskId).toBe('test123');
            expect(parsed.text).toBe('Hello RabbitMQ');
        }
    });
});
