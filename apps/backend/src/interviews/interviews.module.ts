import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { config } from '../config';
import { EvaluationsModule } from '../evaluations/evaluations.module';
import { AIService } from './ai/ai.service';
import { EmbeddingService } from './ai/embedding.service';
import { OllamaService } from './ai/ollama.service';
import { InterviewsController } from './interviews.controller';
import { InterviewsGateway } from './interviews.gateway';
import { InterviewsRepository } from './interviews.repository';
import { InterviewsService } from './interviews.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => EvaluationsModule),
    JwtModule.register({
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: config.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [InterviewsController],
  providers: [InterviewsService, InterviewsGateway, AIService, OllamaService, EmbeddingService, InterviewsRepository],
  exports: [InterviewsService, OllamaService, EmbeddingService],
})
export class InterviewsModule {}
