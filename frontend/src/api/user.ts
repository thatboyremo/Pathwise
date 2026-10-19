import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string | null;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const access = localStorage.getItem("access");

  const response = await axios.get<UserProfile>(
    `${API_URL}/api/auth/me/`,
    {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    }
  );

  return response.data;
}