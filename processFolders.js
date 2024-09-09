const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { s3Config, bucketConfig } = require('./config.js');
const { client } = require("./db/pgConnect.js");
const { deleteFolder } = require("./s3/deleteS3.js")
const s3Client = new S3Client(s3Config); // S3 클라이언트 생성

// 특정 mailId의 attachments 카운트 함수
async function countAttachmentsByMailId(mailId) {
    const query = `
        SELECT COUNT(*) AS total_count
        FROM public.attachments
        WHERE mailid = $1
          AND state = 1;
    `;

    const values = [mailId]; // mailId를 값으로 설정

    try {
        const res = await client.query(query, values);
        return res.rows[0].total_count; // 결과에서 총 숫자를 반환
    } catch (error) {
        console.error('Error counting attachments:', error);
        throw error; // 에러를 다시 던짐
    }
}

// delete_target_folder 테이블에서 startId와 endId 범위로 폴더를 가져오는 함수
async function fetchFolders(startId, endId) {
    const query = `
        SELECT folder
        FROM public.delete_target_folder
        WHERE id BETWEEN $1 AND $2;  -- startId와 endId 사이의 id 값 가져오기
    `;
    
    const values = [startId, endId]; // startId와 endId를 매개변수로 설정

    try {
        const res = await client.query(query, values);
        return res.rows; // 결과 반환
    } catch (error) {
        console.error('Error fetching folders from delete_target_folder:', error);
        throw error; // 에러를 다시 던짐
    }
}

// 메인 프로세스: 특정 조건에서 폴더를 삭제
async function processFolders() {
    let processedFolders = 0; // 처리된 폴더 수
    const batchSize = 100; // 한 번에 처리할 폴더 수
    // 초기 currentId 값을 가져오기 - 가장 작은 ID를 데이터베이스에서 조회
    let currentId = await getMinId(); // 처음 시작할 currentId 설정

    while (true) {
        const folders = await fetchFolders(currentId, currentId + batchSize - 1); // 현재 ID부터 현재 ID + 99까지 가져오기

        if (folders.length === 0) {
            break; // 더 이상 폴더가 없으면 종료
        }

        for (const { folder } of folders) {
            const mailId = extractMailId(folder);
            const cnt = await countAttachmentsByMailId(mailId); // 첨부 파일 수 세기
            processedFolders++;

            // 진행률 계산 및 출력
            const percentage = ((processedFolders / (currentId + batchSize)) * 100).toFixed(2);
            console.log(`Progress: ${percentage}%`);

            if (cnt == 0) {
                await deleteFolder(bucketConfig.bucketName, folder, 0); // 폴더 삭제
            }
        }

        currentId += batchSize; // 현재 ID를 업데이트하여 다음 배치로 이동
    }

    console.log('All folders processed.');
}

// 실행:
processFolders()
    .catch(error => {
        console.error('Error:', error);
    });

// 문자열에서 mailId 추출하는 함수
const extractMailId = (str) => {
    const match = str.match(/\/(.*?)(\/)/); // 중간 부분을 추출하기 위한 정규 표현식
    return match ? match[1] : null; // 매칭되는 부분이 있으면 반환
};
async function getMinId() {
    const query = `
        SELECT MIN(id) AS min_id
        FROM public.delete_target_folder;
    `;

    try {
        const res = await client.query(query);
        return res.rows[0].min_id || 0; // 최소 ID가 존재하지 않으면 0 반환
    } catch (error) {
        console.error('Error fetching minimum ID:', error);
        throw error; // 에러를 다시 던짐
    }
}
