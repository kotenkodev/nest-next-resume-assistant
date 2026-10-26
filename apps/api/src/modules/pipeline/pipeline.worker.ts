import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { PipelineService } from './pipeline.service';

@Injectable()
export class PipelineWorker implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(PipelineWorker.name);
  private timer?: ReturnType<typeof setTimeout>;
  private activeRun?: Promise<void>;
  private stopping = false;

  constructor(private readonly pipelineService: PipelineService) {}

  onApplicationBootstrap(): void {
    this.tick();
  }

  private tick(): void {
    if (this.stopping) {
      return;
    }

    this.activeRun = this.runOnce();
  }

  private async runOnce(): Promise<void> {
    try {
      await this.pipelineService.runNextJob();
    } catch (error: unknown) {
      this.logger.error(
        'Pipeline worker failed',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      if (!this.stopping) {
        this.timer = setTimeout(() => this.tick(), 1000);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.stopping = true;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    await this.activeRun;
  }
}
