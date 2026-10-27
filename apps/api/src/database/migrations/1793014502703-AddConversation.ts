import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConversation1793014502703 implements MigrationInterface {
  name = 'AddConversation1793014502703';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "conversation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" text NOT NULL, "title" text, "resumeId" uuid NOT NULL, "jobPostingIds" uuid array NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_message" DROP COLUMN "resumeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_message" DROP COLUMN "jobPostingId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_message" ADD "conversationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_c308b1cd542522bb66430fa860a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_f9ef4944d0bdf8ae57ada6efe34" FOREIGN KEY ("resumeId") REFERENCES "resume"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_message" ADD CONSTRAINT "FK_71d77a16df3f16e830d645f31f6" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_message" DROP CONSTRAINT "FK_71d77a16df3f16e830d645f31f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_f9ef4944d0bdf8ae57ada6efe34"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_c308b1cd542522bb66430fa860a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_message" DROP COLUMN "conversationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_message" ADD "jobPostingId" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "chat_message" ADD "resumeId" uuid`);
    await queryRunner.query(`DROP TABLE "conversation"`);
  }
}
