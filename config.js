require('dotenv').config(); // .env 파일을 로드합니다.
const msConfig = {
    user: process.env.MS_DB_USER,
    password: process.env.MS_DB_PASSWORD,
    server: process.env.MS_DB_SERVER,
    database: process.env.MS_DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const pgConfig = {
    host: process.env.PG_DB_HOST,
    port: process.env.PG_DB_PORT,
    user: process.env.PG_DB_USER,
    password: process.env.PG_DB_PASSWORD,
    database: process.env.PG_DB_DATABASE
}

const s3Config = {
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION
}
const s3TestConfig = {
    accessKey: process.env.S3_TEST_ACCESS_KEY,
    secretKey: process.env.S3_TEST_SECRET_KEY,
    region: process.env.S3_TEST_REGION
}

const bucketConfig = {
    bucketName: process.env.S3_ATTATCHMENT_BUCKET_NAME
}
const bucketTestConfig = {
    bucketName: process.env.S3_TEST_DELETE_BUCKEY_NAME
}

module.exports = {
    msConfig,
    pgConfig,
    s3Config,
    s3TestConfig,
    bucketConfig,
    bucketTestConfig,
};