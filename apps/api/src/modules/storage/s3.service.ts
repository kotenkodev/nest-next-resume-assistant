import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  s3Client: S3Client;

  constructor(private configService: ConfigService) {
    const s3Client = new S3Client({
      region: configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      endpoint: configService.getOrThrow<string>('AWS_ENDPOINT_URL_S3'),
      forcePathStyle: true,
    });
    this.s3Client = s3Client;
  }

  async getSignedUrlForObject(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow<string>('S3_BUCKET'),
      Key: key,
    });
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
  }

  async createUploadUrl(key: string, contentType: string, fileSize: number) {
    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow<string>('S3_BUCKET'),
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: 900,
      signableHeaders: new Set(['content-type']),
    });
  }

  async deleteObjectCommand(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.getOrThrow<string>('S3_BUCKET'),
      Key: key,
    });
    await this.s3Client.send(command);
  }
}
