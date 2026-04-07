import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { InterviewGateway } from './interview.gateway';
import { AIService } from './ai/ai.service';
import { OllamaService } from './ai/ollama.service';
import { config } from '../config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: config.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [InterviewController],
  providers: [InterviewService, InterviewGateway, AIService, OllamaService],
  exports: [InterviewService, OllamaService],
})
export class InterviewModule {}
