const { client } = require("./db/pgConnect");
const intervals = [30, 60, 90, 120, 150, 180];

const insertMailIds = async () => {
    try {
        // 모든 interval에 대해 동시에 작업을 처리합니다.
        await Promise.all(intervals.map(async (interval) => {
            try {
                // 데이터베이스 쿼리 실행
                const result = await client.query(`
                    SELECT mailid
                    FROM public.attachments
                    WHERE state = 0
                    AND dateexpiration BETWEEN CURRENT_TIMESTAMP - INTERVAL '${interval} days' AND CURRENT_TIMESTAMP - INTERVAL '${interval - 30} days'
                    GROUP BY mailid;
                `);
                
                const mailIds = result.rows;

                console.log(`조회된 mailid (간격 ${interval}일)`);

                // 삭제 대상 테이블에 데이터 삽입
                await Promise.all(mailIds.map(({ mailid }) => 
                    client.query(`
                        INSERT INTO public.delete_target_mailid (mailid, interval_days)
                        VALUES ($1, $2)
                        ON CONFLICT (mailid) DO NOTHING;
                    `, [mailid, interval])
                ));

                console.log(`간격 ${interval}일에 대한 데이터 삽입 완료.`);
            } catch (err) {
                console.error(`쿼리 실행 중 오류 발생 (간격 ${interval}일):`, err.stack);
            }
        }));
    } catch (err) {
        console.error('전체 작업 실행 중 오류 발생:', err.stack);
    } finally {
        // 연결 종료
        await client.end();
    }
};

// 함수 호출
insertMailIds();
