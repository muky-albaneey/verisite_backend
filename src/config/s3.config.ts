import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  bucket: process.env.S3_BUCKET,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 52428800, // 50MB
}));

