// Inline minimal mock `api` to avoid dependency on a separate ./api module.
// This provides `post` and `get` methods that return a Promise<{ data: any }>.
const api = {
  post: async (url: string, payload: any) => {
    // Basic mock responses based on endpoint
    if (url.endsWith('/interview/start/')) {
      const questions = Array.from({ length: payload.question_count || 3 }, (_, i) => ({
        id: i + 1,
        question: `Sample question ${i + 1}`,
        category: payload.interview_type || 'general',
      }));
      return { data: { interview_id: Date.now(), questions } };
    }

    if (url.endsWith('/interview/answer/')) {
      const nextId = Math.random() > 0.5 ? Math.floor(Math.random() * 100) : null;
      const next_question = nextId ? { id: nextId, question: 'Next sample question' } : null;
      return {
        data: {
          feedback: {
            score: 7,
            strengths: ['Clear structure'],
            improvements: ['Be more concise'],
            feedback: 'Good answer overall',
          },
          next_question,
          completed: next_question === null,
        },
      };
    }

    return { data: {} };
  },
  get: async (url: string) => {
    if (url.includes('/result/')) {
      return {
        data: {
          overall_score: 8,
          communication_score: 8,
          technical_score: 7,
          confidence_score: 9,
          strengths: ['Good examples'],
          improvements: ['More depth on technical topics'],
          recommendation: 'Recommended with reservations',
        },
      };
    }
    return { data: {} };
  },
};

export type InterviewConfig = {
  interview_type: string;
  target_role: string;
  difficulty: string;
  question_count: number;
};

export type InterviewQuestion = {
  id: number | string;
  question: string;
  category?: string;
};

export type AnswerFeedback = {
  score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
};

export type InterviewStartResponse = {
  interview_id: number | string;
  questions: InterviewQuestion[];
};

export type SubmitAnswerResponse = {
  feedback: AnswerFeedback;
  next_question?: InterviewQuestion | null;
  completed?: boolean;
};

export type InterviewResult = {
  overall_score: number;
  communication_score: number;
  technical_score: number;
  confidence_score: number;
  strengths: string[];
  improvements: string[];
  recommendation: string;
};

export async function startInterview(
  config: InterviewConfig
): Promise<InterviewStartResponse> {
  const response = await api.post(
    "/interview/start/",
    config
  );
  return response.data as InterviewStartResponse;
}

export async function submitInterviewAnswer(
  interviewId: number | string,
  questionId: number | string,
  answer: string
): Promise<SubmitAnswerResponse> {
  const response = await api.post(
    "/interview/answer/",
    {
      interview_id: interviewId,
      question_id: questionId,
      answer,
    }
  );
  return response.data as SubmitAnswerResponse;
}

export async function getInterviewResult(
  interviewId: number | string
): Promise<InterviewResult> {
  const response = await api.get(
    `/interview/${interviewId}/result/`
  );
  return response.data as InterviewResult;
}