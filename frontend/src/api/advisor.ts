import api from "./axios";

export type AdvisorResponse = {
  reply: string;
};

export async function sendAdvisorMessage(
  message: string,
): Promise<AdvisorResponse> {
  const response = await api.post<AdvisorResponse>(
    "advisor/chat/",
    {
      message,
    },
  );

  return response.data;
}

