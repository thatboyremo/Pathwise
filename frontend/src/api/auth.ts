import api from "./axios";

// =========================================================
// TYPES
// =========================================================

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Profile {
  full_name: string;
  phone: string;
  country: string;
  city: string;
  bio: string;
  career_goal: string;
  target_role: string;
  years_experience: number;
  work_preference: string;
  linkedin: string;
  github: string;
  portfolio: string;
  resume_filename: string;
  resume_score: number;
  ats_score: number;
  resume_word_count: number;
  resume_uploaded: boolean;
  resume_analyzed: boolean;
  career_score: number;
  profile_completion: number;
  completed: boolean;
  profile_picture: string | null;
}

// =========================================================
// LOGIN RESPONSE
// =========================================================

export interface LoginResponse {
  success: boolean;
  message: string;

  access?: string;
  refresh?: string;

  user: User;

  profile: Profile;

  skills: Array<{
    id: number;
    name: string;
    level: string;
    category: string;
  }>;

  experiences: Array<{
    id: number;
    role: string;
    company: string;
    period: string;
    description: string;
  }>;

  educations: Array<{
    id: number;
    degree: string;
    institution: string;
    field: string;
    period: string;
    grade: string;
  }>;

  projects: Array<{
    id: number;
    name: string;
    description: string;
    technologies: string;
    url: string;
  }>;
}

// =========================================================
// REGISTER RESPONSE
// =========================================================

export interface RegisterResponse {
  message: string;

  user: User;
}

// =========================================================
// GET STORED USER
// =========================================================

export function getStoredUser(): User | null {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser) as User;

  } catch (error) {

    console.error(
      "GET STORED USER ERROR:",
      error
    );

    localStorage.removeItem("user");

    return null;
  }
}

// =========================================================
// GET STORED PROFILE
// =========================================================

export function getStoredProfile(): Profile | null {

  try {

    const storedProfile =
      localStorage.getItem("profile");

    if (!storedProfile) {
      return null;
    }

    return JSON.parse(
      storedProfile
    ) as Profile;

  } catch (error) {

    console.error(
      "GET STORED PROFILE ERROR:",
      error
    );

    localStorage.removeItem(
      "profile"
    );

    return null;
  }
}

// =========================================================
// GET ACCESS TOKEN
// =========================================================

export function getAccessToken(): string | null {

  return localStorage.getItem(
    "access"
  );
}

// =========================================================
// GET REFRESH TOKEN
// =========================================================

export function getRefreshToken(): string | null {

  return localStorage.getItem(
    "refresh"
  );
}

// =========================================================
// CHECK AUTHENTICATION
// =========================================================

export function isAuthenticated(): boolean {

  return Boolean(
    getAccessToken()
  );
}

// =========================================================
// REGISTER
// =========================================================

export async function register(
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  confirm_password: string
): Promise<RegisterResponse> {

  const response =
    await api.post<RegisterResponse>(
      "register/",
      {
        username,
        first_name,
        last_name,
        email,
        password,
        confirm_password,
      }
    );

  const data =
    response.data;

  return data;
}

// =========================================================
// LOGIN
// =========================================================

export async function login(
  identifier: string,
  password: string
): Promise<LoginResponse> {

  // =======================================================
  // REMOVE OLD JWT TOKENS BEFORE NEW LOGIN
  // =======================================================

  localStorage.removeItem("access");
  localStorage.removeItem("refresh");

  const response =
    await api.post<LoginResponse>(
      "login/",
      {
        username: identifier,
        password,
      }
    );

  const data =
    response.data;

  // =======================================================
  // SAVE NEW JWT TOKENS
  // =======================================================

  if (data.access) {

    localStorage.setItem(
      "access",
      data.access
    );
  }

  if (data.refresh) {

    localStorage.setItem(
      "refresh",
      data.refresh
    );
  }

  // =======================================================
  // SAVE USER
  // =======================================================

  if (data.user) {

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    localStorage.setItem(
      "username",
      data.user.username
    );

    localStorage.setItem(
      "first_name",
      data.user.first_name || ""
    );

    localStorage.setItem(
      "last_name",
      data.user.last_name || ""
    );

    localStorage.setItem(
      "email",
      data.user.email || ""
    );
  }

  // =======================================================
  // SAVE PROFILE
  // =======================================================

  if (data.profile) {

    localStorage.setItem(
      "profile",
      JSON.stringify(data.profile)
    );
  }

  return data;
}

// =========================================================
// LOGOUT
// =========================================================

export function logout(): void {

  const refreshToken = localStorage.getItem("refresh");

  if (refreshToken) {
    void api.post("logout/", { refresh: refreshToken }).catch(() => undefined);
  }

  localStorage.removeItem(
    "access"
  );

  localStorage.removeItem(
    "refresh"
  );

  localStorage.removeItem(
    "user"
  );

  localStorage.removeItem(
    "username"
  );

  localStorage.removeItem(
    "first_name"
  );

  localStorage.removeItem(
    "last_name"
  );

  localStorage.removeItem(
    "email"
  );

  localStorage.removeItem(
    "profile"
  );
}

// =========================================================
// CLEAR AUTH DATA
// =========================================================

export function clearAuthData(): void {

  logout();
}
