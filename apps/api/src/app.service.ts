import { Injectable } from '@nestjs/common';
import { APP_NAME, type HealthResponse } from '@repo/shared';

@Injectable()
export class AppService {
  health(): HealthResponse {
    return { status: 'ok', app: APP_NAME };
  }
}
