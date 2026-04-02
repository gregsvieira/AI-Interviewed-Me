export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  improvementTopics: string[];
  lastInterviewDate: string | null;
  avatar?: string;
}

export type UserWithoutPassword = Omit<User, 'passwordHash'>;
