const { bucketTestConfig, bucketConfig } = require("./config");
const { client } = require("./db/pgConnect");
const { deleteFolder } = require("./s3/deleteS3");

const deleteQuery = async (interval) => {
    const pageSize = 100; // 한 번에 가져올 데이터 수
    let offset = 0; // 데이터의 시작 위치

    while (true) {
        try {
            // interval에 해당하는 데이터 조회 (페이징)
            const result = await client.query(`
                SELECT mailid
                FROM public.delete_target_mailid
                WHERE interval_days = ${interval}
                LIMIT ${pageSize} OFFSET ${offset};
            `);

            // 결과가 없으면 반복 종료
            if (result.rows.length === 0) break;

            // 조회된 mailid에서 '-' 문자를 제거하고 네임스페이스 생성
            const namespaces = result.rows.map(row => {
                const cleanedMailId = row.mailid.replace(/-/g, '');
                return `general/${cleanedMailId}/`;
            });

            // deleteFolder를 네임스페이스별로 호출
            await Promise.all(namespaces.map(namespace =>
                deleteFolder(bucketConfig.bucketName, namespace, interval)
            ));

            console.log(`간격 ${interval}일에 대한 삭제 요청 완료 (offset ${offset}).`);

            // 다음 페이지로 이동
            offset += pageSize;
        } catch (err) {
            console.error(`간격 ${interval}일 쿼리 에러`, err.stack);
            break;
        }
    }
};
const intervals = [];


// const runAll = async () => {
//     try {
//         await Promise.all(intervals.map(interval => deleteQuery(interval)));
//     } catch (err) {
//         console.error('전체 작업 실행 중 오류 발생:', err.stack);
//     } finally {
//         // 연결 종료
//         await client.end();
//     }
// };

const run = async () => {
    // 930부터 1500까지 30씩 증가시키며 배열에 추가-> 4년전 데이터까지 전부 삭제 
    for (let i = 930; i <= 1500; i += 30) {
        await deleteQuery(i)
    }
}
//run()

// 함수 호출
//runAll();
