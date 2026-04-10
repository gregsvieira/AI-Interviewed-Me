import { Controller, Delete, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterviewsService } from './interviews.service';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private interviewService: InterviewsService) {}

  @Get('history')
  async getHistory(@Request() req) {
    return this.interviewService.getInterviewHistory(req.user.id);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.interviewService.getInterviewStats(req.user.id);
  }

  @Get(':id')
  async getInterview(@Param('id') id: string) {
    return this.interviewService.getInterview(id);
  }

  @Delete(':id')
  async deleteInterview(@Request() req, @Param('id') id: string) {
    return this.interviewService.deleteInterview(id, req.user.id);
  }
}
