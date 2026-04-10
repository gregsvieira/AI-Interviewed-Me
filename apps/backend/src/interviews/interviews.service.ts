import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { config } from '../config';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { TOPICS_DATA } from '../topics/topics.data';
import { AIService } from './ai/ai.service';
import { EmbeddingService } from './ai/embedding.service';
import { generateInterviewer, generateRandomName, InterviewerInfo, Message } from './ai/prompts/interview.prompt';
import { InterviewsRepository } from './interviews.repository';

export interface InterviewMessageDTO {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface InterviewDTO {
  id: string;
  userId: string;
  topic: string;
  subtopic: string;
  level: string;
  candidateName: string;
  interviewer: InterviewerInfo;
  duration: number;
  messages: InterviewMessageDTO[];
  startedAt: Date;
  endedAt?: Date;
}

export interface TopicDistribution {
  id: string;
  name: string;
  count: number;
  percentage: number;
}

export interface LevelDistribution {
  level: string;
  count: number;
  percentage: number;
}

export interface SkillLevel {
  topicId: string;
  name: string;
  level: number;
}

export interface InterviewStats {
  totalInterviews: number;
  totalTimeMinutes: number;
  lastInterview: InterviewDTO | null;
  topicDistribution: TopicDistribution[];
  levelDistribution: LevelDistribution[];
  skillLevels: SkillLevel[];
  currentStreak: number;
  longestStreak: number;
  recommendation: {
    type: 'practice' | 'level' | 'motivation';
    message: string;
  };
}

interface InMemoryInterview {
  id: string;
  userId: string;
  topic: string;
  subtopic: string;
  level: string;
  candidateName: string;
  interviewer: InterviewerInfo;
  duration: number;
  messages: InterviewMessageDTO[];
  startedAt: Date;
  endedAt?: Date;
}

@Injectable()
export class InterviewsService {
  private currentInterviews: Map<string, InMemoryInterview> = new Map();

  constructor(
    private interviewsRepository: InterviewsRepository,
    private aiService: AIService,
    private jwtService: JwtService,
    private authService: AuthService,
    private embeddingService: EmbeddingService,
    private evaluationsService: EvaluationsService,
  ) {}

  async startInterview(
    id: string,
    userId: string,
    topic: string,
    subtopic: string,
    level: string,
    duration: number = 30,
    candidateName?: string,
  ): Promise<{ firstMessage: string; candidateName: string; interviewer: InterviewerInfo }> {
    const finalCandidateName = candidateName || generateRandomName();
    const interviewer = generateInterviewer();

    const dbInterview = await this.interviewsRepository.createInterview({
      userId,
      topicId: topic,
      subtopicId: subtopic,
      level,
      interviewerName: interviewer.name,
      candidateName: finalCandidateName,
      duration,
      startedAt: new Date(),
    });

    const inMemoryInterview: InMemoryInterview = {
      id: dbInterview.id,
      userId,
      topic,
      subtopic,
      level,
      candidateName: finalCandidateName,
      interviewer,
      duration,
      messages: [],
      startedAt: new Date(),
    };

    this.currentInterviews.set(id, inMemoryInterview);

    const firstMessage = await this.aiService.generateResponse(
      id,
      topic,
      subtopic,
      level,
      finalCandidateName,
      interviewer.name,
      [],
    );

    inMemoryInterview.messages.push({
      role: 'ai',
      text: firstMessage,
      timestamp: new Date(),
    });

    await this.interviewsRepository.addMessage(dbInterview.id, {
      role: 'ai',
      text: firstMessage,
    });

    return { firstMessage, candidateName: finalCandidateName, interviewer };
  }

  async processUserMessage(interviewId: string, userText: string): Promise<string> {
    const interview = this.currentInterviews.get(interviewId);
    console.log('[InterviewService] processUserMessage:', { interviewId, userText, found: !!interview, messageCount: interview?.messages?.length });
    if (!interview) throw new Error('Interview not found');

    console.log('[InterviewService] Adding user message to interview');
    interview.messages.push({
      role: 'user',
      text: userText,
      timestamp: new Date(),
    });

    const userEmbedding = await this.embeddingService.createEmbedding(userText);
    const dbInterview = await this.interviewsRepository.findById(interview.id);
    if (dbInterview) {
      await this.interviewsRepository.addMessage(dbInterview.id, {
        role: 'user',
        text: userText,
        embedding: userEmbedding,
      });
    }

    const previousMessages: Message[] = interview.messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'ai',
      content: m.text,
    }));

    const response = await this.aiService.generateResponse(
      interviewId,
      interview.topic,
      interview.subtopic,
      interview.level,
      interview.candidateName,
      interview.interviewer.name,
      previousMessages,
    );

    interview.messages.push({
      role: 'ai',
      text: response,
      timestamp: new Date(),
    });

    const responseEmbedding = await this.embeddingService.createEmbedding(response);
    if (dbInterview) {
      await this.interviewsRepository.addMessage(dbInterview.id, {
        role: 'ai',
        text: response,
        embedding: responseEmbedding,
      });
    }

    return response;
  }

  async endInterview(interviewId: string): Promise<void> {
    const interview = this.currentInterviews.get(interviewId);
    console.log('[InterviewService] endInterview:', { interviewId, found: !!interview, messagesCount: interview?.messages?.length });
    if (!interview) return;

    console.log('[InterviewService] Messages before save:', interview.messages.map(m => ({ role: m.role, text: m.text.substring(0, 50) })));

    interview.endedAt = new Date();

    const startTime = new Date(interview.startedAt).getTime();
    const endTime = new Date(interview.endedAt).getTime();
    const actualDurationMinutes = Math.round((endTime - startTime) / 60000);
    interview.duration = actualDurationMinutes > 0 ? actualDurationMinutes : interview.duration;

    this.aiService.clearContext(interviewId);

    const messagesText = interview.messages.map(m => `${m.role}: ${m.text}`).join('\n');
    const allText = messagesText;
    const messagesEmbedding = await this.embeddingService.createEmbedding(allText);

    await this.interviewsRepository.updateInterview(interview.id, {
      candidateName: interview.candidateName,
      messagesJson: JSON.stringify(interview.messages),
      messagesText,
      messagesEmbedding,
      duration: interview.duration,
      endedAt: interview.endedAt,
    });

    console.log('[InterviewService] Interview saved successfully');

    const messagesForEvaluation = interview.messages.map(m => ({ role: m.role, text: m.text }));
    try {
      console.log('[InterviewService] Triggering evaluation for interview:', interview.id);
      this.evaluationsService.evaluateInterview(
        interview.id,
        interview.topic,
        interview.subtopic,
        interview.level,
        messagesForEvaluation,
      ).catch(err => {
        console.error('[InterviewService] Evaluation failed:', err);
      });
    } catch (err) {
      console.error('[InterviewService] Failed to trigger evaluation:', err);
    }

    this.currentInterviews.delete(interviewId);

    const today = new Date().toISOString().split('T')[0];
    await this.authService.updateUser(interview.userId, { lastInterviewDate: today });
  }

  async getInterviewHistory(userId: string): Promise<InterviewDTO[]> {
    const dbInterviews = await this.interviewsRepository.findByUserId(userId);

    const interviewsDTO: InterviewDTO[] = [];
    for (const dbInterview of dbInterviews) {
      const dbMessages = await this.interviewsRepository.getInterviewMessages(dbInterview.id);
      const messages: InterviewMessageDTO[] = dbMessages.map(m => ({
        role: m.role as 'user' | 'ai',
        text: m.text,
        timestamp: m.createdAt || new Date(),
      }));

      const topicData = TOPICS_DATA.find(t => t.id === dbInterview.topicId);

      interviewsDTO.push({
        id: dbInterview.id,
        userId: dbInterview.userId,
        topic: dbInterview.topicId,
        subtopic: dbInterview.subtopicId,
        level: dbInterview.level,
        candidateName: dbInterview.candidateName || '',
        interviewer: { name: dbInterview.interviewerName, gender: 'male', avatar: '' },
        duration: dbInterview.duration,
        messages,
        startedAt: dbInterview.startedAt,
        endedAt: dbInterview.endedAt || undefined,
      });
    }

    return interviewsDTO.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  async getInterview(interviewId: string): Promise<InterviewDTO | null> {
    const dbInterview = await this.interviewsRepository.findById(interviewId);
    if (!dbInterview) return null;

    const dbMessages = await this.interviewsRepository.getInterviewMessages(dbInterview.id);
    const messages: InterviewMessageDTO[] = dbMessages.map(m => ({
      role: m.role as 'user' | 'ai',
      text: m.text,
      timestamp: m.createdAt || new Date(),
    }));

    return {
      id: dbInterview.id,
      userId: dbInterview.userId,
      topic: dbInterview.topicId,
      subtopic: dbInterview.subtopicId,
      level: dbInterview.level,
      candidateName: dbInterview.candidateName || '',
      interviewer: { name: dbInterview.interviewerName, gender: 'male', avatar: '' },
      duration: dbInterview.duration,
      messages,
      startedAt: dbInterview.startedAt,
      endedAt: dbInterview.endedAt || undefined,
    };
  }

  async validateToken(token: string): Promise<{ id: string; email: string }> {
    const payload = this.jwtService.verify(token, {
      secret: config.JWT_SECRET,
    });
    return { id: payload.sub, email: payload.email };
  }

  getActiveInterview(interviewId: string): InterviewDTO | undefined {
    const interview = this.currentInterviews.get(interviewId);
    if (!interview) return undefined;

    return {
      id: interview.id,
      userId: interview.userId,
      topic: interview.topic,
      subtopic: interview.subtopic,
      level: interview.level,
      candidateName: interview.candidateName,
      interviewer: interview.interviewer,
      duration: interview.duration,
      messages: interview.messages,
      startedAt: interview.startedAt,
      endedAt: interview.endedAt,
    };
  }

  async deleteInterview(interviewId: string, userId: string): Promise<boolean> {
    const dbInterview = await this.interviewsRepository.findById(interviewId);

    if (!dbInterview) {
      return false;
    }

    if (dbInterview.userId !== userId) {
      return false;
    }

    return this.interviewsRepository.deleteInterview(interviewId);
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    console.log('[InterviewService] transcribeAudio called with', audioBuffer.length, 'bytes');

    if (audioBuffer.length === 0) {
      return '';
    }

    try {
      const transcription = await this.aiService.transcribeAudio(audioBuffer);
      return transcription;
    } catch (error) {
      console.error('[InterviewService] Transcription error:', error);
      return '';
    }
  }

  async getInterviewStats(userId: string): Promise<InterviewStats> {
    const interviews = await this.getInterviewHistory(userId);
    const user = await this.authService.getUserById(userId);

    if (interviews.length === 0) {
      return {
        totalInterviews: 0,
        totalTimeMinutes: 0,
        lastInterview: null,
        topicDistribution: [],
        levelDistribution: [],
        skillLevels: [],
        currentStreak: 0,
        longestStreak: 0,
        recommendation: {
          type: 'practice',
          message: 'Start your first interview to track your progress!',
        },
      };
    }

    const totalInterviews = interviews.length;
    const totalTimeMinutes = interviews.reduce((sum, i) => sum + i.duration, 0);
    const lastInterview = interviews[0];

    const topicCounts = new Map<string, number>();
    const levelCounts = new Map<string, number>();

    for (const interview of interviews) {
      topicCounts.set(interview.topic, (topicCounts.get(interview.topic) || 0) + 1);
      levelCounts.set(interview.level, (levelCounts.get(interview.level) || 0) + 1);
    }

    const topicDistribution: TopicDistribution[] = Array.from(topicCounts.entries())
      .map(([id, count]) => {
        const topicData = TOPICS_DATA.find(t => t.id === id);
        return {
          id,
          name: topicData?.name || id,
          count,
          percentage: Math.round((count / totalInterviews) * 100),
        };
      })
      .sort((a, b) => b.count - a.count);

    const levelDistribution: LevelDistribution[] = Array.from(levelCounts.entries())
      .map(([level, count]) => ({
        level,
        count,
        percentage: Math.round((count / totalInterviews) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const improvementTopics = user?.improvementTopics || TOPICS_DATA.map(t => t.id);
    const skillLevels: SkillLevel[] = improvementTopics.map(topicId => {
      const topicData = TOPICS_DATA.find(t => t.id === topicId);
      const count = topicCounts.get(topicId) || 0;
      const baseLevel = Math.min(100, count * 20);
      return {
        topicId,
        name: topicData?.name || topicId,
        level: baseLevel,
      };
    });

    const { currentStreak, longestStreak } = this.calculateStreaks(interviews);

    const recommendation = this.generateRecommendation(
      interviews,
      skillLevels,
      currentStreak,
      totalInterviews,
    );

    return {
      totalInterviews,
      totalTimeMinutes,
      lastInterview,
      topicDistribution,
      levelDistribution,
      skillLevels,
      currentStreak,
      longestStreak,
      recommendation,
    };
  }

  private calculateStreaks(interviews: InterviewDTO[]): { currentStreak: number; longestStreak: number } {
    if (interviews.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const interviewDates = new Set(
      interviews.map(i => new Date(i.startedAt).toISOString().split('T')[0])
    );
    const sortedDates = Array.from(interviewDates).sort().reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const hasInterviewToday = interviewDates.has(todayStr);
    const hadInterviewYesterday = interviewDates.has(yesterdayStr);

    if (hasInterviewToday || hadInterviewYesterday) {
      let checkDate = hasInterviewToday ? today : yesterday;

      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (interviewDates.has(dateStr)) {
          tempStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      currentStreak = tempStreak;
    }

    tempStreak = 1;
    longestStreak = 1;

    const sortedAsc = Array.from(interviewDates).sort();
    for (let i = 1; i < sortedAsc.length; i++) {
      const prevDate = new Date(sortedAsc[i - 1]);
      const currDate = new Date(sortedAsc[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return { currentStreak, longestStreak };
  }

  private generateRecommendation(
    interviews: InterviewDTO[],
    skillLevels: SkillLevel[],
    currentStreak: number,
    totalInterviews: number,
  ): { type: 'practice' | 'level' | 'motivation'; message: string } {
    const random = Math.random();

    if (random < 0.33 && skillLevels.length > 0) {
      const weakest = skillLevels.reduce((min, s) => (s.level < min.level ? s : min), skillLevels[0]);
      return {
        type: 'practice',
        message: `Practice more ${weakest.name} to improve your skills!`,
      };
    } else if (random < 0.66) {
      const lastInterview = interviews[0];
      if (lastInterview) {
        const nextLevel = this.getNextLevel(lastInterview.level);
        return {
          type: 'level',
          message: `Try a ${nextLevel} difficulty level for a new challenge!`,
        };
      }
    }

    const lastInterviewDate = interviews[0] ? new Date(interviews[0].startedAt) : null;
    let daysSinceLast = 0;

    if (lastInterviewDate) {
      daysSinceLast = Math.floor((Date.now() - lastInterviewDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    if (daysSinceLast > 3) {
      return {
        type: 'motivation',
        message: `You haven't practiced in ${daysSinceLast} days. Keep your streak going!`,
      };
    } else if (currentStreak > 0) {
      return {
        type: 'motivation',
        message: `Great job! You're on a ${currentStreak}-day streak. Keep it up!`,
      };
    } else {
      return {
        type: 'motivation',
        message: `${totalInterviews} interviews completed. Keep practicing to improve!`,
      };
    }
  }

  private getNextLevel(currentLevel: string): string {
    const levels = ['entry', 'mid', 'senior'];
    const currentIndex = levels.indexOf(currentLevel);
    if (currentIndex === -1 || currentIndex === levels.length - 1) {
      return 'senior';
    }
    return levels[currentIndex + 1];
  }
}
