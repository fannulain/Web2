const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});

const BUCKET_NAME = 'tasks-results';

async function initMinio() {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
            console.log(`[MinIO] Bucket '${BUCKET_NAME}' created successfully.`);
        } else {
            console.log(`[MinIO] Bucket '${BUCKET_NAME}' already exists.`);
        }
    } catch (error) {
        console.error('[MinIO] Initialization error:', error);
    }
}

async function getObjectData(objectName) {
    return new Promise((resolve, reject) => {
        let data = '';
        minioClient.getObject(BUCKET_NAME, objectName, (err, dataStream) => {
            if (err) {
                return reject(err);
            }
            dataStream.on('data', (chunk) => {
                data += chunk.toString('utf-8');
            });
            dataStream.on('end', () => {
                resolve(data);
            });
            dataStream.on('error', (err) => {
                reject(err);
            });
        });
    });
}

module.exports = {
    minioClient,
    initMinio,
    getObjectData,
    BUCKET_NAME
};
