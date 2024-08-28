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
module.exports = {
    msConfig,
    pgConfig
};