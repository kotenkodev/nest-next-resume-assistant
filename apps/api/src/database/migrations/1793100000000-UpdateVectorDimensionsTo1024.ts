import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVectorDimensionsTo10241793100000000 implements MigrationInterface {
  name = 'UpdateVectorDimensionsTo10241793100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "resume" SET "embedding" = NULL`);
    await queryRunner.query(`UPDATE "job_posting" SET "embedding" = NULL`);
    await queryRunner.query(
      `ALTER TABLE "resume" ALTER COLUMN "embedding" TYPE vector(1024)`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" ALTER COLUMN "embedding" TYPE vector(1024)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "resume" SET "embedding" = NULL`);
    await queryRunner.query(`UPDATE "job_posting" SET "embedding" = NULL`);
    await queryRunner.query(
      `ALTER TABLE "resume" ALTER COLUMN "embedding" TYPE vector(1536)`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posting" ALTER COLUMN "embedding" TYPE vector(1536)`,
    );
  }
}
