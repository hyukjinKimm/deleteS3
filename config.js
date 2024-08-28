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


module.exports = {
    msConfig,
};