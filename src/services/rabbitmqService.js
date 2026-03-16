const amqp = require('amqplib');

let channel = null;
const QUEUE_NAME = 'transcription.request';

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log('RabbitMQ connected and queue ensured');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
    }
}

async function publishTask(taskData) {
    if (!channel) {
        console.error('Cannot publish task: RabbitMQ channel not initialized');
        throw new Error('RabbitMQ channel not initialized');
    }

    try {
        // taskData { taskId, text, userId }
        const messageBuffer = Buffer.from(JSON.stringify(taskData));
        channel.sendToQueue(QUEUE_NAME, messageBuffer, { persistent: true });
        console.log(`[Queue] Task ${taskData.taskId} published to ${QUEUE_NAME}`);
    } catch (error) {
        console.error(`[Queue] Failed to publish task ${taskData.taskId}`, error);
        throw error;
    }
}

module.exports = {
    connectRabbitMQ,
    publishTask
};
