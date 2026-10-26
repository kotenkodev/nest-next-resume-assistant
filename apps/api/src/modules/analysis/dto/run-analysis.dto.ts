import { IsUUID } from 'class-validator';

export class RunAnalysisDto {
  @IsUUID('4')
  resumeId!: string;

  @IsUUID('4')
  jobPostingId!: string;
}
