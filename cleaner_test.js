const { bucketTestConfig } = require("./config");
const { client } = require("./db/pgConnect")
const { deleteFolder } = require("./s3/deleteS3")
// 쿼리 실행
const selectQuery = async () => {
    try {
        const result = await client.query(`
            SELECT mailid
            FROM public.attachments
            WHERE state = 0
            AND dateexpiration < CURRENT_TIMESTAMP
            AND dateexpiration > CURRENT_TIMESTAMP - INTERVAL '7 days'
            GROUP BY mailid;
        `);
        
        console.log('조회 데이터:', result.rows);
    } catch (err) {
        console.error('쿼리 에러', err.stack);
    } finally {
        // 연결 종료
        await client.end();
    }
};

selectQuery()
// deleteFolder(bucketTestConfig.bucketName, "myFolder/")