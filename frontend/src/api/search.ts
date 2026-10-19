import api from "./axios";

export type SearchResult = {
  id: number;
  type: "job" | "skill";
  title: string;
  subtitle?: string;
  location?: string;
  url: string;
};

export type SearchResponse = {
  success: boolean;
  query: string;
  results: SearchResult[];
};

export async function globalSearch(
  query: string
): Promise<SearchResponse> {
  const response = await api.get("search/", {
    params: {
      q: query,
    },
  });

  return response.data;
}
