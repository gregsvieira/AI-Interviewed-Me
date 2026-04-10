import { Module } from '@nestjs/common';
import { BootstrapService } from './bootstrap.service';
import { EmbeddingService } from '../interviews/ai/embedding.service';

@Module({
  providers: [BootstrapService, EmbeddingService],
  exports: [BootstrapService],
})
export class BootstrapModule {}
