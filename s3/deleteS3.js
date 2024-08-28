const { S3Client, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs'); // 파일 시스템 모듈을 가져옵니다.
const { s3TestConfig } = require('../config');

// AWS S3 클라이언트를 생성합니다.
const s3 = new S3Client(s3TestConfig);

// S3에서 객체를 삭제하는 함수입니다.
const deleteObject = async (bucketName, objectKey) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: objectKey
        };
        const command = new DeleteObjectCommand(params);
        const result = await s3.send(command);
        console.log(`객체 삭제 성공: ${objectKey}`, result);
    } catch (error) {
        console.error(`객체 삭제 실패: ${objectKey}`, error);
    }
};

// 폴더 내의 모든 객체를 삭제하는 함수입니다.
const deleteFolder = async (bucketName, folderKey, interval) => {
    try {
        let continuationToken;
        let folderDeleted = false; // 폴더 삭제 여부를 체크할 변수입니다.

        // log.txt 파일에 기록할 내용을 준비합니다.
        let logContent = `폴더 삭제 요청: ${folderKey}\n`;

        do {
            const listParams = {
                Bucket: bucketName,
                Prefix: folderKey,
                Delimiter: '/'
            };

            if (continuationToken) {
                listParams.ContinuationToken = continuationToken;
            }

            const listCommand = new ListObjectsV2Command(listParams);
            const { Contents, NextContinuationToken } = await s3.send(listCommand);
            continuationToken = NextContinuationToken;

            if (Contents) {
                for (const item of Contents) {
                    // 객체를 삭제합니다.
                    await deleteObject(bucketName, item.Key);

                    // 삭제할 객체의 경로를 logContent에 추가합니다.
                    logContent += `삭제할 객체: ${item.Key}\n`;
                }
                folderDeleted = true; // 폴더에 객체가 있었음을 표시합니다.
            }
        } while (continuationToken);

        // 폴더에 객체가 있었던 경우, log.txt에 폴더 이름과 객체 경로를 기록합니다.
        if (folderDeleted) {
            fs.appendFileSync(`log${interval}.txt`, logContent);
        }

        console.log(`폴더 ${folderKey} 삭제 완료.`);
    } catch (error) {
        console.error('폴더 삭제 실패:', error);
    }
};

// deleteFolder 함수를 export 합니다.
module.exports = { deleteFolder };
