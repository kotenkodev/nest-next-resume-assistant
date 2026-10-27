import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateConversationDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  jobPostingIds?: string[];

  @IsOptional()
  @IsString()
  title?: string;
}
