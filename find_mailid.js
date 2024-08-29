const { client } = require("./db/pgConnect");
const intervals = [];

// 210부터 900까지 30씩 증가시키며 배열에 추가
for (let i = 930; i <= 1500; i += 30) {
    intervals.push(i);
}

// 페이지 크기 및 페이지 번호
const pageSize = 100;

const insertMailIds = async () => {
    try {
        await Promise.all(intervals.map(async (interval) => {
            let offset = 0;
            while (true) {
                try {
                    // 데이터베이스 쿼리 실행 (페이지네이션)
                    const result = await client.query(`
                        SELECT mailid
                        FROM public.attachments
                        WHERE state = 0
                        AND dateexpiration BETWEEN CURRENT_TIMESTAMP - INTERVAL '${interval} days' AND CURRENT_TIMESTAMP - INTERVAL '${interval - 30} days'
                        GROUP BY mailid
                        LIMIT $1 OFFSET $2;
                    `, [pageSize, offset]);

                    const mailIds = result.rows;

                    // 결과가 없으면 반복 종료
                    if (mailIds.length === 0) break;

                    console.log(`조회된 mailid (간격 ${interval}일, offset ${offset})`);

                    // 삭제 대상 테이블에 데이터 삽입
                    await Promise.all(mailIds.map(({ mailid }) =>
                        client.query(`
                            INSERT INTO public.delete_target_mailid (mailid, interval_days)
                            VALUES ($1, $2)
                            ON CONFLICT (mailid) DO NOTHING;
                        `, [mailid, interval])
                    ));

                    console.log(`간격 ${interval}일에 대한 데이터 삽입 완료 (offset ${offset}).`);

                    // 다음 페이지로 이동
                    offset += pageSize;
                } catch (err) {
                    console.error(`간격 ${interval}일 쿼리 실행 중 오류 발생 (offset ${offset}):`, err.stack);
                    break;
                }
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
//insertMailIds();
