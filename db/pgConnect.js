const { Client } = require('pg');
const { pgConfig } = require('../config');

const client = new Client(pgConfig);

// 데이터베이스에 연결
client.connect()
    .then(() => console.log('PostgreSQL database 연결 성공'))
    .catch(err => console.error('연결 실패', err.stack));

// 예제 쿼리 실행
const runQuery = async () => {
    try {
        const result = await client.query('SELECT NOW()'); // 현재 시간 조회
        console.log('현재시각:', result.rows[0]);
    } catch (err) {
        console.error('쿼리 에러', err.stack);
    } finally {
        // 연결 종료
        await client.end();
    }
};

//runQuery();

module.exports = { client }