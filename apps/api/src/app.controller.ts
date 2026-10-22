import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@repo/shared';
import { AppService } from './app.service';
import { AllowAnonymous, Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @AllowAnonymous()
  health(): HealthResponse {
    return this.appService.health();
  }

  @Get('me')
  me(@Session() session: UserSession) {
    return session;
  }
}
