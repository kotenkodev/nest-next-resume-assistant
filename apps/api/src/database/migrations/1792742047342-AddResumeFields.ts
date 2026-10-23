import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResumeFields1792742047342 implements MigrationInterface {
    name = 'AddResumeFields1792742047342'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "resume" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" text NOT NULL, "title" text, "fileName" text NOT NULL, "fileSize" integer, "rawText" text NOT NULL, "parsedProfile" jsonb, "embedding" vector(1536), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7ff05ea7599e13fac01ac812e48" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_posting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" text NOT NULL, "title" text NOT NULL, "company" text, "rawText" text NOT NULL, "parsedData" jsonb, "embedding" vector(1536), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d7f4b8ed39caa6897bbdec8ba56" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fit_analysis" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" text NOT NULL, "resumeId" uuid NOT NULL, "jobPostingId" uuid NOT NULL, "matchScore" integer NOT NULL, "skillGaps" jsonb NOT NULL, "experienceAlignment" jsonb NOT NULL, "interviewPrep" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6dc1a76b8ad100f487bc1eef4d7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1e3c217dade56385e8b5b1d114" ON "fit_analysis"  ("resumeId", "jobPostingId") `);
        await queryRunner.query(`CREATE TABLE "chat_message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" text NOT NULL, "role" text NOT NULL, "content" text NOT NULL, "resumeId" uuid, "jobPostingId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3cc0d85193aade457d3077dd06b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "processing_job" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" text NOT NULL, "type" text NOT NULL, "status" text NOT NULL DEFAULT 'PENDING', "currentStepIndex" integer NOT NULL DEFAULT '0', "targetId" text, "metadata" jsonb, "errorMessage" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8e79d23ae693a1776af8a9f0210" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_step" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "jobId" uuid NOT NULL, "stepKey" text NOT NULL, "name" text NOT NULL, "stepOrder" integer NOT NULL, "status" text NOT NULL DEFAULT 'PENDING', "inputPayload" jsonb, "outputPayload" jsonb, "errorMessage" text, "attempts" integer NOT NULL DEFAULT '0', "startedAt" TIMESTAMP WITH TIME ZONE, "completedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9f00e8d8cdd8d14593af19733d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "resume" ADD CONSTRAINT "FK_6543e24d4d8714017acd1a1b392" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_posting" ADD CONSTRAINT "FK_b624aee4201efe6547f5c98eb73" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fit_analysis" ADD CONSTRAINT "FK_a7e7f73bf2b5a13d061b48512d7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fit_analysis" ADD CONSTRAINT "FK_80c61087b7bc01d7885d49d348a" FOREIGN KEY ("resumeId") REFERENCES "resume"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fit_analysis" ADD CONSTRAINT "FK_8a1bbc1ad28f23e20aaf6b0e6bc" FOREIGN KEY ("jobPostingId") REFERENCES "job_posting"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_message" ADD CONSTRAINT "FK_a44ec486210e6f8b4591776d6f3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "processing_job" ADD CONSTRAINT "FK_ccca187eec86f065e98c9a0d2dc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_step" ADD CONSTRAINT "FK_e8f444f2f4b7ad663eeee9f9634" FOREIGN KEY ("jobId") REFERENCES "processing_job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_step" DROP CONSTRAINT "FK_e8f444f2f4b7ad663eeee9f9634"`);
        await queryRunner.query(`ALTER TABLE "processing_job" DROP CONSTRAINT "FK_ccca187eec86f065e98c9a0d2dc"`);
        await queryRunner.query(`ALTER TABLE "chat_message" DROP CONSTRAINT "FK_a44ec486210e6f8b4591776d6f3"`);
        await queryRunner.query(`ALTER TABLE "fit_analysis" DROP CONSTRAINT "FK_8a1bbc1ad28f23e20aaf6b0e6bc"`);
        await queryRunner.query(`ALTER TABLE "fit_analysis" DROP CONSTRAINT "FK_80c61087b7bc01d7885d49d348a"`);
        await queryRunner.query(`ALTER TABLE "fit_analysis" DROP CONSTRAINT "FK_a7e7f73bf2b5a13d061b48512d7"`);
        await queryRunner.query(`ALTER TABLE "job_posting" DROP CONSTRAINT "FK_b624aee4201efe6547f5c98eb73"`);
        await queryRunner.query(`ALTER TABLE "resume" DROP CONSTRAINT "FK_6543e24d4d8714017acd1a1b392"`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "verification" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`DROP TABLE "job_step"`);
        await queryRunner.query(`DROP TABLE "processing_job"`);
        await queryRunner.query(`DROP TABLE "chat_message"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e3c217dade56385e8b5b1d114"`);
        await queryRunner.query(`DROP TABLE "fit_analysis"`);
        await queryRunner.query(`DROP TABLE "job_posting"`);
        await queryRunner.query(`DROP TABLE "resume"`);
    }

}
