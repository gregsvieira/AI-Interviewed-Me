import { IsString, IsNumber, IsOptional } from 'class-validator';

export class StartInterviewDto {
  @IsString()
  topic: string;

  @IsString()
  subtopic: string;

  @IsString()
  level: string;

  @IsNumber()
  @IsOptional()
  duration?: number;
}
