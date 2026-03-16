const { updateTaskStatus, saveTaskResult } = require('../models/db');

function simulateHeavyProcessing(taskId, text, userId) {
    //оновлення статусу на PROCESSING
    updateTaskStatus(taskId, userId, 'PROCESSING');
    console.log(`[Task ${taskId}] Status changed to PROCESSING. Starting work...`);

    //симуляція обробки завдання
    const processingTime = Math.floor(Math.random() * 5000) + 5000;

    setTimeout(() => {
        try {
            console.log(`[Task ${taskId}] Work finished. Parsing dataset...`);
            //симуляція аналізу, рахуємо кількість символів та слів
            const charCount = text.length;
            const wordCount = text.trim().split(/\s+/).length;

            const resultData = JSON.stringify({
                wordCount,
                charCount,
                analysis: "Text analysis completed successfully."
            });

            //оновлення статусу на DONE
            saveTaskResult(taskId, userId, resultData, 'DONE');
            console.log(`[Task ${taskId}] Status changed to DONE. Result saved.`);
        } catch (e) {
            console.error(`[Task ${taskId}] Error processing task:`, e);
            updateTaskStatus(taskId, userId, 'ERROR');
        }
    }, processingTime);
}

module.exports = { simulateHeavyProcessing };
