const { bucketTestConfig, bucketConfig } = require("./config");
const { client } = require("./db/pgConnect");
const { deleteFolder } = require("./s3/deleteS3");

// 쿼리 실행 및 폴더 삭제 처리
const deleteQuery = async (interval) => {
    try {
        // interval에 해당하는 데이터 조회
        const result = await client.query(`
            SELECT mailid
            FROM public.delete_target_mailid
            WHERE interval_days = ${interval};
        `);


        // 조회된 mailid에서 '-' 문자를 제거하고 네임스페이스 생성
        const namespaces = result.rows.map(row => {
            const cleanedMailId = row.mailid.replace(/-/g, '');
            return `general/${cleanedMailId}/`;
        });


        // deleteFolder를 네임스페이스별로 호출
        await Promise.all(namespaces.map(namespace =>
            deleteFolder(bucketConfig.bucketName, namespace, interval)
        ));

        console.log(`간격 ${interval}일에 대한 삭제 요청 완료.`);
    } catch (err) {
        console.error(`간격 ${interval}일 쿼리 에러`, err.stack);
    }
};

// 모든 interval에 대해 병렬로 deleteQuery 호출
const intervals = [30, 60, 90, 120, 150, 180];

const runAll = async () => {
    try {
        await Promise.all(intervals.map(interval => deleteQuery(interval)));
    } catch (err) {
        console.error('전체 작업 실행 중 오류 발생:', err.stack);
    } finally {
        // 연결 종료
        await client.end();
    }
};

// 함수 호출
runAll();
