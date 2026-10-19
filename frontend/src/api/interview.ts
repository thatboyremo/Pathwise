import axios from "axios";

const interviewApi = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});


// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

interviewApi.interceptors.request.use(
  (config) => {

    const accessToken =
      localStorage.getItem("access");

    console.log(
      "INTERVIEW REQUEST:",
      config.method?.toUpperCase(),
      `${config.baseURL}${config.url}`
    );

    console.log(
      "ACCESS TOKEN EXISTS:",
      !!accessToken
    );

    if (accessToken) {

      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;

      console.log(
        "AUTHORIZATION HEADER ATTACHED"
      );

    } else {

      console.warn(
        "NO ACCESS TOKEN FOUND"
      );
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

interviewApi.interceptors.response.use(

  (response) => {

    console.log(
      "INTERVIEW RESPONSE:",
      response.status,
      response.config.url
    );

    return response;
  },

  (error) => {

    console.error(
      "INTERVIEW API ERROR:",
      error.response?.status,
      error.config?.url,
      error.response?.data
    );

    return Promise.reject(error);
  }
);


// =========================================================
// TYPES
// =========================================================

export interface StartInterviewPayload {
  company: string;
  job_role: string;
  experience_level: string;
  interview_type: string;
  difficulty: string;
  question_count: number;
  job_description?: string;
}


export interface StartInterviewResponse {
  success: boolean;
  session_id: number;
  status: string;
  current_question: string;
  current_question_number: number;
  total_questions: number;
}


export interface SubmitAnswerResponse {
  success: boolean;

  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  problem_solving_score: number;

  feedback: string;

  strengths: string[];
  weaknesses: string[];

  improved_answer: string;
  professional_version: string;
  faang_version: string;
  concise_version: string;

  next_question: string | null;
  next_question_number: number | null;

  has_next: boolean;

  session_status: string;
  session_score: number;
}


// =========================================================
// START INTERVIEW
// =========================================================

export async function startInterview(
  payload: StartInterviewPayload
): Promise<StartInterviewResponse> {

  console.log(
    "START INTERVIEW ACCESS:",
    localStorage.getItem("access")
      ? "EXISTS"
      : "MISSING"
  );

  const response =
    await interviewApi.post<StartInterviewResponse>(
      "interview/api/start/",
      payload
    );

  return response.data;
}


// =========================================================
// SUBMIT ANSWER
// =========================================================

export async function submitInterviewAnswer(
  sessionId: number,
  answer: string
): Promise<SubmitAnswerResponse> {

  console.log(
    "SUBMIT ANSWER ACCESS:",
    localStorage.getItem("access")
      ? "EXISTS"
      : "MISSING"
  );

  const response =
    await interviewApi.post<SubmitAnswerResponse>(
      `interview/api/${sessionId}/submit/`,
      {
        answer,
      }
    );

  return response.data;
}


// =========================================================
// GET SESSION
// =========================================================

export async function getInterviewSession(
  sessionId: number
) {

  const response =
    await interviewApi.get(
      `interview/api/session/${sessionId}/`
    );

  return response.data;
}


// =========================================================
// GET RESULT
// =========================================================

export async function getInterviewResult(
  sessionId: number
) {

  const response =
    await interviewApi.get(
      `interview/api/result/${sessionId}/`
    );

  return response.data;
}


export default interviewApi;