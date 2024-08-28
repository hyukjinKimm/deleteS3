const { S3Client, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
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
const deleteFolder = async (bucketName, folderKey) => {
    try {
        let continuationToken;
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
                    console.log(`삭제할 객체 경로: ${item.Key}`);
                    await deleteObject(bucketName, item.Key);
                }
            }
        } while (continuationToken);

        console.log(`폴더 ${folderKey} 삭제 완료.`);
    } catch (error) {
        console.error('폴더 삭제 실패:', error);
    }
};

// 사용 예시
//const bucketName = 'your-bucket-name';
//const folderKey = 'your-folder-key/';
//deleteFolder(bucketName, folderKey);

// deleteFolder 함수를 export 합니다.
module.exports = { deleteFolder };