const amqp = require('amqplib');
const { updateTaskStatus, saveTaskResult } = require('../models/db');

let channel = null;
const QUEUE_NAME = 'transcription.request';
const EVENTS_QUEUE = 'transcription.events';

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        await channel.assertQueue(EVENTS_QUEUE, { durable: true });
        console.log('RabbitMQ connected and queues ensured');
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

async function consumeEvents() {
    if (!channel) {
        console.error('Cannot consume events, RabbitMQ not initialized');
        return;
    }

    console.log(`API is listening events in ${EVENTS_QUEUE}`);

    channel.consume(EVENTS_QUEUE, (msg) => {
        if (msg !== null) {
            try {
                const eventData = JSON.parse(msg.content.toString());
                const { taskId, userId, status, progress, result } = eventData;

                console.log(`[Event] Received update for Task ${taskId}: ${status}`);

                if (status === 'PROCESSING') {
                    const progressData = JSON.stringify({ progress: progress || 'Started background processing' });
                    saveTaskResult(taskId, userId, progressData, 'PROCESSING');
                } else if (status === 'DONE') {
                    const s3Key = result && result.s3Key ? result.s3Key : null;
                    saveTaskResult(taskId, userId, s3Key, 'DONE');
                } else if (status === 'ERROR') {
                    updateTaskStatus(taskId, userId, 'ERROR');
                }

                channel.ack(msg);
            } catch (error) {
                console.error(`[Event] Failed to process message`, error);
                channel.ack(msg);
            }
        }
    }, { noAck: false });
}

module.exports = {
    connectRabbitMQ,
    publishTask,
    consumeEvents
};
