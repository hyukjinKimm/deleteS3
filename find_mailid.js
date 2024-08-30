const { client } = require("./db/pgConnect");

// 간격 배열 생성
const intervals = [];
for (let i = 1530; i <= 1800; i += 30) {
    intervals.push(i);
}

const insertMailIds = async () => {
    try {
        await Promise.all(intervals.map(async (interval) => {
            try {
                // INSERT INTO SELECT 쿼리 실행
                const result = await client.query(`
                    INSERT INTO public.delete_target_mailid (mailid, interval_days)
                    SELECT mailid, $1
                    FROM public.attachments
                    WHERE state = 0
                    AND dateexpiration BETWEEN CURRENT_TIMESTAMP - INTERVAL '${interval} days' AND CURRENT_TIMESTAMP - INTERVAL '${interval - 30} days'
                    GROUP BY mailid
                    ON CONFLICT (mailid) DO NOTHING;
                `, [interval]);

                // 삽입된 행 수 확인
                const insertedCount = result.rowCount;

                console.log(`간격 ${interval}일에 대한 데이터 삽입 완료 (${insertedCount} rows).`);

            } catch (err) {
                console.error(`간격 ${interval}일 쿼리 실행 중 오류 발생:`, err.stack);
            }
        }));
    } catch (err) {
        console.error('전체 작업 실행 중 오류 발생:', err.stack);
    } finally {
        // 데이터베이스 연결 종료
        await client.end();
    }
};

// 함수 호출
insertMailIds();
