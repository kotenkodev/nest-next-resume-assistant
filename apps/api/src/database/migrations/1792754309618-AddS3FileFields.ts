import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddS3FileFields1792754309618 implements MigrationInterface {
  name = 'AddS3FileFields1792754309618';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" ADD "s3Key" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "resume" ADD CONSTRAINT "UQ_7b38008435456f6cf7394d48758" UNIQUE ("s3Key")`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume" ADD "contentType" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume" ADD "status" text NOT NULL DEFAULT 'PENDING_UPLOAD'`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" ADD "fileName" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" ADD "fileSize" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" ADD "s3Key" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" ADD CONSTRAINT "UQ_7758edc8a1bbad6456a6e4efbdb" UNIQUE ("s3Key")`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" ADD "contentType" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" ADD "status" text NOT NULL DEFAULT 'PENDING_UPLOAD'`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume" ALTER COLUMN "fileSize" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume" ALTER COLUMN "rawText" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" ALTER COLUMN "title" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" ALTER COLUMN "rawText" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job_posting" ALTER COLUMN "rawText" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" ALTER COLUMN "title" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume" ALTER COLUMN "rawText" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume" ALTER COLUMN "fileSize" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "job_posting" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "job_posting" DROP COLUMN "contentType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" DROP CONSTRAINT "UQ_7758edc8a1bbad6456a6e4efbdb"`,
    );
    await queryRunner.query(`ALTER TABLE "job_posting" DROP COLUMN "s3Key"`);
    await queryRunner.query(`ALTER TABLE "job_posting" DROP COLUMN "fileSize"`);
    await queryRunner.query(`ALTER TABLE "job_posting" DROP COLUMN "fileName"`);
    await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN "contentType"`);
    await queryRunner.query(
      `ALTER TABLE "resume" DROP CONSTRAINT "UQ_7b38008435456f6cf7394d48758"`,
    );
    await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN "s3Key"`);
  }
}
