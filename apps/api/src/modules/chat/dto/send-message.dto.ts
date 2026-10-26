import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  @IsString()
  message!: string;
}
