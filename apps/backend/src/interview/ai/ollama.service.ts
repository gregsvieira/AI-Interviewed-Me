import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { config } from '../../config';
import { createReadStream, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export interface OllamaResponse {
  response: string;
  context: number[];
}

@Injectable()
export class OllamaService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = config.OLLAMA_BASE_URL;
    this.model = config.OLLAMA_MODEL;
  }

  async generate(prompt: string, context?: number[]): Promise<OllamaResponse> {
    const requestBody: Record<string, unknown> = {
      model: this.model,
      prompt,
      stream: false,
    };

    if (context && context.length > 0) {
      requestBody.context = context;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, requestBody, {
        timeout: 120000,
      });

      return {
        response: response.data.response,
        context: response.data.context || [],
      };
    } catch (error) {
      console.error('Ollama error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Ollama error: ${error.response.status} - ${error.response.statusText}`);
      }
      throw new Error('Failed to generate response from Ollama');
    }
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    try {
      const tempFilePath = join(tmpdir(), `audio_${Date.now()}.webm`);
      writeFileSync(tempFilePath, audioBuffer);

      const formData = new FormData();
      const fileStream = createReadStream(tempFilePath);
      const fileBuffer = require('fs').readFileSync(tempFilePath);
      const blob = new Blob([fileBuffer], { type: 'audio/webm' });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper');

      const response = await axios.post(`${this.baseUrl}/api/audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      require('fs').unlinkSync(tempFilePath);

      return response.data?.text || '';
    } catch (error) {
      console.error('Ollama transcription error:', error);
      return '';
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models?.map((m: { name: string }) => m.name) || [];
    } catch {
      return [];
    }
  }
}
