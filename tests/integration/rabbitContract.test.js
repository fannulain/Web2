const { GenericContainer } = require("testcontainers");
const amqp = require("amqplib");
const rabbitmqService = require("../../src/services/rabbitmqService");
const db = require("../../src/models/db");
jest.mock("../../src/models/db", () => ({
    updateTaskStatus: jest.fn(),
    saveTaskResult: jest.fn()
}));
jest.setTimeout(60000);

describe("Contract Tests", () => {
    let container;
    let rabbitUrl;
    let testChannel;
    let testConnection;

    beforeAll(async () => {
        container = await new GenericContainer("rabbitmq:3-management")
            .withExposedPorts(5672)
            .start();
        const mappedPort = container.getMappedPort(5672);
        const host = container.getHost();
        rabbitUrl = `amqp://${host}:${mappedPort}`;
        process.env.RABBITMQ_URL = rabbitUrl;
        await rabbitmqService.connectRabbitMQ();
        testConnection = await amqp.connect(rabbitUrl);
        testChannel = await testConnection.createChannel();
        await testChannel.assertQueue('transcription.request');
        await testChannel.assertQueue('transcription.events');
    });

    afterAll(async () => {
        if (testChannel) await testChannel.close();
        if (testConnection) await testConnection.close();
        await rabbitmqService.closeRabbitMQ();
        if (container) {
            await container.stop();
        }
    });

    const waitForMessage = async (queue) => {
        return new Promise((resolve) => {
            testChannel.consume(queue, (msg) => {
                if (msg !== null) {
                    testChannel.ack(msg);
                    resolve(msg);
                }
            });
        });
    };

    test("1: Publish Contract", async () => {
        const dummyTask = { taskId: "task-100", text: "Hello World", userId: "user1" };
        await rabbitmqService.publishTask(dummyTask);
        const msg = await waitForMessage("transcription.request");

        expect(msg).toBeDefined();
        const content = JSON.parse(msg.content.toString());
        expect(content).toHaveProperty("taskId", "task-100");
        expect(content).toHaveProperty("text", "Hello World");
        expect(content).toHaveProperty("userId", "user1");
    });

    test("2: Consume Contract", async () => {
        return new Promise((resolve) => {
            rabbitmqService.consumeEvents();
            const EventFromPython = {
                taskId: "task-999",
                userId: "user2",
                status: "DONE",
                result: { s3Key: "minio-fake-key" }
            };
            testChannel.sendToQueue("transcription.events", Buffer.from(JSON.stringify(EventFromPython)));

            setTimeout(() => {
                expect(db.saveTaskResult).toHaveBeenCalledWith("task-999", "user2", "minio-fake-key", "DONE");
                resolve();
            }, 100);
        });
    });
});
