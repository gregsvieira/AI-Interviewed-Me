import { Injectable } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { createInterviewPrompt, Message } from './prompts/interview.prompt';

@Injectable()
export class AIService {
  private conversationContext: Map<string, number[]> = new Map();

  constructor(private ollama: OllamaService) {}

  async generateResponse(
    interviewId: string,
    topic: string,
    subtopic: string,
    level: string,
    candidateName: string,
    interviewerName: string,
    previousMessages: Message[] = [],
  ): Promise<string> {
    const context = this.conversationContext.get(interviewId) || [];

    const prompt = createInterviewPrompt(topic, subtopic, level, candidateName, interviewerName, previousMessages);

    const { response, context: newContext } = await this.ollama.generate(prompt, context);

    if (newContext.length > 0) {
      this.conversationContext.set(interviewId, newContext);
    }

    return response;
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    return this.ollama.transcribe(audioBuffer);
  }

  clearContext(interviewId: string): void {
    this.conversationContext.delete(interviewId);
  }

  getContextSize(interviewId: string): number {
    return this.conversationContext.get(interviewId)?.length || 0;
  }
}
