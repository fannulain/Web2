const { GenericContainer, Wait } = require("testcontainers");
const Minio = require("minio");

describe("MinIO Contract Test", () => {
    let container;
    let minioClient;
    const bucketName = 'tasks-results';
    let getObjectData;

    beforeAll(async () => {
        container = await new GenericContainer("minio/minio")
            .withCommand(["server", "/data"])
            .withExposedPorts(9000)
            .withEnvironment({
                MINIO_ROOT_USER: "minioadmin",
                MINIO_ROOT_PASSWORD: "minioadmin"
            })
            .start();

        const port = container.getMappedPort(9000);
        const host = container.getHost();

        process.env.MINIO_ENDPOINT = host;
        process.env.MINIO_PORT = port.toString();
        process.env.MINIO_ACCESS_KEY = "minioadmin";
        process.env.MINIO_SECRET_KEY = "minioadmin";
        process.env.MINIO_USE_SSL = "false";

        const minioService = require('../../src/services/minioService');
        getObjectData = minioService.getObjectData;

        minioClient = new Minio.Client({
            endPoint: host,
            port: port,
            useSSL: false,
            accessKey: 'minioadmin',
            secretKey: 'minioadmin'
        });

        await minioClient.makeBucket(bucketName, 'us-east-1');
    }, 120000);

    afterAll(async () => {
        if (container) await container.stop();
    });

    it("should fetch object data matching the contract", async () => {
        const testKey = 'contract-test-data.json';
        const expectedResult = { status: "success", parsed_items: 42 };
        const buffer = Buffer.from(JSON.stringify(expectedResult));

        await minioClient.putObject(bucketName, testKey, buffer);

        const resultString = await getObjectData(testKey);
        const resultJSON = JSON.parse(resultString);

        expect(resultJSON).toEqual(expectedResult);
        expect(resultJSON.status).toBe("success");
    });
});
