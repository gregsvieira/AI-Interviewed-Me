export interface EvaluationQA {
  question: string;
  answer: string;
}

export const createEvaluationPrompt = (
  question: string,
  candidateAnswer: string,
  expectedAnswer: string,
  criteria: string[],
): string => {
  return `
You are an expert technical interviewer evaluating a candidate's answer.

QUESTION: ${question}

CANDIDATE'S ANSWER:
${candidateAnswer}

EXPECTED ANSWER:
${expectedAnswer}

EVALUATION CRITERIA:
${criteria.map(c => `- ${c}`).join('\n')}

Evaluate the candidate's answer and respond in JSON format:
{
  "score": 0-100,
  "strengths": ["point 1", "point 2"],
  "improvements": ["area to improve 1", "area to improve 2"],
  "feedback": "overall feedback text"
}
`.trim();
};