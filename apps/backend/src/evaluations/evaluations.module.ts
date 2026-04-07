import { Module } from '@nestjs/common';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { QuestionsModule } from '../questions/questions.module';
import { InterviewModule } from '../interview/interview.module';

@Module({
  imports: [QuestionsModule, InterviewModule],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}