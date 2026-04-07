import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';

@Controller('interviews')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get(':id/evaluation')
  async getEvaluation(@Param('id') interviewId: string) {
    const evaluation = await this.evaluationsService.getEvaluation(interviewId);

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found for this interview');
    }

    return evaluation;
  }
}