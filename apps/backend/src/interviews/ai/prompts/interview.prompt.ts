export interface Message {
  role: 'user' | 'ai';
  content: string;
}

export type Gender = 'male' | 'female';

const MALE_NAMES = [
  'James', 'Michael', 'Robert', 'David', 'William', 'Richard', 'Joseph', 'Thomas',
  'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Steven', 'Paul', 'Andrew',
  'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward',
  'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan',
  'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond',
  'Gregory', 'Frank', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler'
];

const FEMALE_NAMES = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica',
  'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley',
  'Kimberly', 'Emily', 'Donna', 'Michelle', 'Dorothy', 'Carol', 'Amanda', 'Melissa',
  'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen', 'Amy',
  'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
  'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine'
];

export function generateRandomName(): string {
  const allNames = [...MALE_NAMES, ...FEMALE_NAMES];
  const firstName = allNames[Math.floor(Math.random() * allNames.length)];
  return firstName;
}

export interface InterviewerInfo {
  name: string;
  gender: Gender;
  avatar: string;
}

export function generateInterviewer(): InterviewerInfo {
  const isMale = Math.random() > 0.5;
  const gender: Gender = isMale ? 'male' : 'female';
  const names = isMale ? MALE_NAMES : FEMALE_NAMES;
  const name = names[Math.floor(Math.random() * names.length)];
  
  const avatarCount = isMale ? 11 : 12;
  const avatarNum = Math.floor(Math.random() * avatarCount) + 1;
  const avatarPrefix = isMale ? 'man' : 'woman';
  const avatar = `/avatars/${gender}/ai-${avatarPrefix}-${avatarNum}.jpg`;
  
  return { name, gender, avatar };
}

export const createInterviewPrompt = (
  topic: string,
  subtopic: string,
  level: string,
  candidateName: string,
  interviewerName: string,
  previousMessages: Message[] = [],
): string => {
  const levelInstructions: Record<string, string> = {
    entry: 'Ask basic and direct questions about fundamental concepts.',
    junior: 'Ask basic and direct questions about fundamental concepts.',
    mid: 'Ask intermediate level questions, including practices and scenarios.',
    pleno: 'Ask intermediate level questions, including practices and scenarios.',
    senior: 'Ask advanced questions about architecture, system design, trade-offs, and real experience.',
  };

  const levelKey = level.toLowerCase();
  const levelInstruction = levelInstructions[levelKey] || levelInstructions.mid;

  const displayLevel = levelKey.charAt(0).toUpperCase() + levelKey.slice(1);

  const systemPrompt = `
    You are an experienced technical interviewer conducting a job interview.
    Your name is ${interviewerName}.
    Topic: ${topic}
    Subtopic: ${subtopic}
    Level: ${displayLevel}
    ${levelInstruction}

    Rules:
    1. Ask one question at a time
    2. Wait for the candidate's response
    3. Give brief feedback after each response
    4. Ask at least 3-5 relevant questions
    5. Keep a professional but friendly tone
    6. If the answer is incomplete, ask for more details
    7. Always respond in English

    Start by greeting the candidate by name: ${candidateName}. Introduce yourself as ${interviewerName} and ask the first question about ${subtopic}.
  `.trim();

  const conversation = previousMessages
    .map(m => `${m.role === 'user' ? candidateName : interviewerName}: ${m.content}`)
    .join('\n');

  return `${systemPrompt}\n\n${conversation ? `Previous conversation:\n${conversation}\n\nYour next question or feedback:` : 'First question:'}`;
};
