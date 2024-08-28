require('dotenv').config(); // .env 파일을 로드합니다.
const sql = require('mssql');

const { msConfig } = require('./config'); // config.js에서 dbConfig를 불러옵니다.
const queryDatabase = async () => {
    try {
        await sql.connect(msConfig);
        // const result = await sql.query('SELECT * FROM YourTable');
        console.log("mssql연결 성공!")
    } catch (err) {
        console.error('연결 실패!', err);
    } finally {
        await sql.close();
    }
};

queryDatabase();
