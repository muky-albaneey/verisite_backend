import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export enum UploadFolder {
  AVATARS = 'avatars',
  PROJECTS_IMAGES = 'projects',
  PROJECTS_DOCS = 'projects',
  REPORTS = 'reports',
  MESSAGES = 'messages',
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucket: string;
  private publicBaseUrl: string;
  private maxFileSize: number;

  constructor(private configService: ConfigService) {
    const s3Config = this.configService.get('s3');
    this.bucket = s3Config.bucket;
    this.publicBaseUrl = s3Config.publicBaseUrl;
    this.maxFileSize = s3Config.maxFileSize;

    this.s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
      forcePathStyle: s3Config.forcePathStyle,
    });
  }

  private validateFile(file: Express.Multer.File, allowedTypes: string[]): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    const mimeType = file.mimetype.toLowerCase();
    const isValidType = allowedTypes.some((type) => mimeType.includes(type));

    if (!isValidType) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }

  private getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  private generateKey(
    folder: UploadFolder,
    identifier: string,
    filename: string,
  ): string {
    const ext = this.getFileExtension(filename);
    const uniqueId = uuidv4();
    return `${folder}/${identifier}/${uniqueId}${ext}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: UploadFolder,
    identifier: string,
    allowedTypes: string[],
  ): Promise<UploadResult> {
    this.validateFile(file, allowedTypes);

    const key = this.generateKey(folder, identifier, file.originalname);

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        },
      });

      await upload.done();

      const url = `${this.publicBaseUrl}/${key}`;

      return {
        url,
        key,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: UploadFolder,
    identifier: string,
  ): Promise<UploadResult> {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return this.uploadFile(file, folder, identifier, allowedTypes);
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder: UploadFolder,
    identifier: string,
  ): Promise<UploadResult> {
    const allowedTypes = ['video/mp4', 'video/webm'];
    return this.uploadFile(file, folder, identifier, allowedTypes);
  }

  async uploadDocument(
    file: Express.Multer.File,
    folder: UploadFolder,
    identifier: string,
  ): Promise<UploadResult> {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    return this.uploadFile(file, folder, identifier, allowedTypes);
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: UploadFolder,
    identifier: string,
    allowedTypes: string[],
  ): Promise<UploadResult[]> {
    const results = await Promise.all(
      files.map((file) => this.uploadFile(file, folder, identifier, allowedTypes)),
    );
    return results;
  }
}

