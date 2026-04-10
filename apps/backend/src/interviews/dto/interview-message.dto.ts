import { IsString } from 'class-validator';

export class InterviewMessageDto {
  @IsString()
  interviewId: string;

  @IsString()
  text: string;
}
