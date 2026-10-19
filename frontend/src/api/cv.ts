import api from "./axios";

export type CVAnalysis = {
  overall_score: number;
  ats_score: number;
  impact_score: number;
  keyword_score: number;
  format_score: number;

  word_count: number;

  contact: {
    email: boolean;
    phone: boolean;
    linkedin: boolean;
    github: boolean;
  };

  sections: {
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    certifications: boolean;
  };

  technologies: string[];

  action_verbs: string[];

  metrics_found: number;

  strengths: string[];

  weaknesses: string[];

  recommendations: {
    title: string;
    description: string;
  }[];
};

export type CVAnalysisResponse = {
  success: boolean;
  filename: string;
  analysis: CVAnalysis;
};

export async function analyzeCV(
  file: File
): Promise<CVAnalysisResponse> {

  const formData = new FormData();

  formData.append("cv", file);

  const response = await api.post(
    "analyze-cv/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}