const amqp = require('amqplib');
const { getTaskById, updateTaskStatus, saveTaskResult } = require('./src/models/db');

const QUEUE_NAME = 'transcription.request';

async function startWorker() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log(`Worker is waiting in ${QUEUE_NAME}`);
        channel.prefetch(1);
        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const taskData = JSON.parse(msg.content.toString());
                const { taskId, text, userId } = taskData;
                console.log(`\nReceived new task from queue:`, taskData);
                try {
                    const existingTask = getTaskById(taskId, userId);
                    if (existingTask && existingTask.status === 'DONE') {
                        console.log(`[Task ${taskId}] DONE. Idempotency, skip.`);
                        channel.ack(msg);
                        return;
                    }
                    updateTaskStatus(taskId, userId, 'PROCESSING');
                    console.log(`[Task ${taskId}] PROCESSING. Starting work`);
                    const processingTime = Math.floor(Math.random() * 5000) + 5000;
                    await new Promise(resolve => setTimeout(resolve, processingTime));
                    console.log(`[Task ${taskId}] finished. Parsing dataset`);
                    const charCount = text.length;
                    const wordCount = text.trim().split(/\s+/).length;
                    const resultData = JSON.stringify({
                        wordCount,
                        charCount,
                        analysis: "Text analysis completed successfully."
                    });
                    saveTaskResult(taskId, userId, resultData, 'DONE');
                    console.log(`[Task ${taskId}] DONE. Result saved.`);
                    channel.ack(msg);
                } catch (err) {
                    console.error(`[Task ${taskId}] Error processing task:`, err);
                    updateTaskStatus(taskId, userId, 'ERROR');
                    channel.ack(msg);
                }
            }
        }, { noAck: false });
    } catch (error) {
        console.error('Failed to start worker', error);
    }
}
startWorker();
