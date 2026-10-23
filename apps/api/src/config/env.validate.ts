import 'reflect-metadata';
import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export class EnvValidation {
  @IsOptional()
  @IsIn(['development', 'test', 'production'])
  NODE_ENV?: string = 'development';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number = 3001;

  @IsString()
  @IsNotEmpty()
  BETTER_AUTH_SECRET!: string;

  @IsOptional()
  @IsString()
  BETTER_AUTH_URL?: string;

  @IsOptional()
  @IsString()
  WEB_ORIGIN?: string = 'http://localhost:3000';

  @IsOptional()
  @IsString()
  CORS_ORIGINS?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^postgres(ql)?:\/\//, {
    message: 'DATABASE_URL must be a postgresql:// connection string',
  })
  DATABASE_URL!: string;

  @IsOptional()
  @IsString()
  DATABASE_URL_POOLED?: string;

  @IsOptional()
  @IsString()
  NEON_AUTH_BASE_URL?: string;

  @IsOptional()
  @IsString()
  AWS_ENDPOINT_URL_S3?: string;

  @IsOptional()
  @IsString()
  AWS_ACCESS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  AWS_SECRET_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  AWS_REGION?: string;

  @IsOptional()
  @IsString()
  S3_BUCKET?: string;

  @IsString()
  @IsNotEmpty()
  AI_API_KEY!: string;

  @IsString()
  @IsNotEmpty()
  AI_API_URL!: string;

  @IsString()
  @IsNotEmpty()
  AI_MODEL!: string;
}

export function validateEnv(env: Record<string, unknown>): EnvValidation {
  const validatedEnv = plainToInstance(EnvValidation, env, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedEnv, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((err) => {
        const constraints = err.constraints
          ? Object.values(err.constraints).join(', ')
          : 'Unknown validation error';
        return `- ${err.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return validatedEnv;
}
