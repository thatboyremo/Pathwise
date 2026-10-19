import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  Award,
  BriefcaseBusiness,
  Camera,
  Check,
  ChevronRight,
  Edit3,
  ExternalLink,
  FolderGit2,
  Github,
  Globe,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  X,
  Zap,
  Linkedin,
} from "lucide-react";

import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { getAccessToken } from "../api/auth";

/* =========================================================
   TYPES
========================================================= */

interface Skill {
  id: number;
  name: string;
  level: string;
  category: string;
}

interface Experience {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
}

interface Education {
  id: number;
  degree: string;
  institution: string;
  field: string;
  period: string;
  grade: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  technologies: string[] | string;
  url: string;
}

interface UserData {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ProfileData {
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
  resume_filename: string | null;
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

interface ProfileResponse {
  success: boolean;
  user: UserData;
  profile: ProfileData;
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
}

/* =========================================================
   API
========================================================= */

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const PROFILE_URL = `${API_BASE}/profile/`;
const SKILLS_URL = `${API_BASE}/skills/`;
const EXPERIENCE_URL = `${API_BASE}/experiences/`;
const EDUCATION_URL = `${API_BASE}/education/`;
const PROJECTS_URL = `${API_BASE}/projects/`;

/* =========================================================
   EMPTY PROFILE
========================================================= */

const emptyProfile: ProfileData = {
  full_name: "",
  phone: "",
  country: "",
  city: "",
  bio: "",
  career_goal: "",
  target_role: "",
  years_experience: 0,
  work_preference: "",
  linkedin: "",
  github: "",
  portfolio: "",
  resume_filename: null,
  resume_score: 0,
  ats_score: 0,
  resume_word_count: 0,
  resume_uploaded: false,
  resume_analyzed: false,
  career_score: 0,
  profile_completion: 0,
  completed: false,
  profile_picture: null,
};

/* =========================================================
   API HELPER
========================================================= */

async function apiRequest(
  url: string,
  options: RequestInit = {}
) {
  const token = getAccessToken();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType =
    response.headers.get("content-type") || "";

  let data: any = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    if (text) {
      console.error("Non-JSON API response:", text);
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    throw new Error(
      data?.error ||
        data?.detail ||
        data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

/* =========================================================
   HELPERS
========================================================= */

function getSkillWidth(level: string) {
  switch (level?.toLowerCase()) {
    case "beginner":
      return "25%";

    case "intermediate":
      return "55%";

    case "advanced":
      return "80%";

    case "expert":
      return "100%";

    default:
      return "50%";
  }
}

function getSkillColor(level: string) {
  switch (level?.toLowerCase()) {
    case "beginner":
      return "bg-emerald-300";

    case "intermediate":
      return "bg-emerald-400";

    case "advanced":
      return "bg-[#19d38f]";

    case "expert":
      return "bg-emerald-600";

    default:
      return "bg-[#19d38f]";
  }
}

function getSkillLabel(level: string) {
  switch (level?.toLowerCase()) {
    case "beginner":
      return "Beginner";

    case "intermediate":
      return "Intermediate";

    case "advanced":
      return "Advanced";

    case "expert":
      return "Expert";

    default:
      return level || "Not specified";
  }
}

function normalizeTechnologies(
  technologies: string[] | string | undefined
): string[] {
  if (!technologies) {
    return [];
  }

  if (Array.isArray(technologies)) {
    return technologies;
  }

  return technologies
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getInitials(
  profile: ProfileData,
  user: UserData | null
) {
  const name =
    profile.full_name ||
    `${user?.first_name || ""} ${
      user?.last_name || ""
    }`.trim() ||
    user?.username ||
    "User";

  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((item) =>
        item.charAt(0).toUpperCase()
      )
      .slice(0, 2)
      .join("") || "U"
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  name,
  value,
  onChange,
  disabled = false,
  placeholder,
  type = "text",
  min,
  icon,
}: {
  label: string;
  name?: string;
  value: string | number;
  onChange?: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  min?: number;
  icon?: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}

        <input
          name={name}
          type={type}
          min={min}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#19d38f] focus:bg-white focus:ring-4 focus:ring-[#19d38f]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${
            icon ? "pl-11" : ""
          }`}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-gray-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f]">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            {description}
          </p>
        </div>
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#dce9e3] bg-white shadow-sm">
      <SectionHeader
        icon={icon}
        title={title}
        description={description}
        action={
          buttonText && onButtonClick ? (
            <button
              type="button"
              onClick={onButtonClick}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#103d2e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c3025] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19d38f]/40 focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              {buttonText}
            </button>
          ) : undefined
        }
      />

      <div className="p-6 lg:p-8">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
  buttonText,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#0f6b4f] shadow-sm ring-1 ring-emerald-100">
        {icon}
      </div>

      <h3 className="mt-5 text-base font-bold text-gray-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>

      {buttonText && onClick && (
        <button
          type="button"
          onClick={onClick}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#103d2e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c3025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19d38f]/40 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          {buttonText}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
  description,
  accent = "emerald",
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  description: string;
  accent?: "emerald" | "orange";
}) {
  const accentClasses =
    accent === "orange"
      ? "bg-emerald-50 text-[#0f6b4f]"
      : "bg-emerald-50 text-[#0f6b4f]";

  return (
    <div className="rounded-2xl border border-[#dce9e3] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-[#10251d]">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClasses}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export function Profile() {
  const [user, setUser] =
    useState<UserData | null>(null);

  const [profile, setProfile] =
    useState<ProfileData>(emptyProfile);

  const [skills, setSkills] =
    useState<Skill[]>([]);

  const [experiences, setExperiences] =
    useState<Experience[]>([]);

  const [educations, setEducations] =
    useState<Education[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [activeSection, setActiveSection] =
    useState("personal");

  const [showSkillForm, setShowSkillForm] =
    useState(false);

  const [showExperienceForm, setShowExperienceForm] =
    useState(false);

  const [showEducationForm, setShowEducationForm] =
    useState(false);

  const [showProjectForm, setShowProjectForm] =
    useState(false);

  const [skillForm, setSkillForm] =
    useState({
      name: "",
      level: "Intermediate",
      category: "",
    });

  const [experienceForm, setExperienceForm] =
    useState({
      role: "",
      company: "",
      period: "",
      description: "",
    });

  const [educationForm, setEducationForm] =
    useState({
      degree: "",
      institution: "",
      field: "",
      period: "",
      grade: "",
    });

  const [projectForm, setProjectForm] =
    useState({
      name: "",
      description: "",
      technologies: "",
      url: "",
    });

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const picturePreviewRef =
    useRef<string | null>(null);

  /* =======================================================
     CLEANUP PROFILE PREVIEW
  ======================================================= */

  useEffect(() => {
    return () => {
      if (picturePreviewRef.current) {
        URL.revokeObjectURL(
          picturePreviewRef.current
        );
      }
    };
  }, []);

  /* =======================================================
     SHOW MESSAGE
  ======================================================= */

  const showSuccessMessage = (
    message: string
  ) => {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 4000);
  };

  /* =======================================================
     SYNC LOCAL STORAGE
  ======================================================= */

  const syncLocalStorage = (
    currentUser: UserData | null,
    currentProfile: ProfileData
  ) => {
    try {
      if (currentUser) {
        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );

        localStorage.setItem(
          "username",
          currentUser.username || ""
        );

        localStorage.setItem(
          "first_name",
          currentUser.first_name || ""
        );

        localStorage.setItem(
          "last_name",
          currentUser.last_name || ""
        );

        localStorage.setItem(
          "email",
          currentUser.email || ""
        );
      }

      localStorage.setItem(
        "profile",
        JSON.stringify(currentProfile)
      );
    } catch (storageError) {
      console.error(
        "LOCAL STORAGE SYNC ERROR:",
        storageError
      );
    }
  };

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const data: ProfileResponse =
        await apiRequest(PROFILE_URL);

      if (!data?.success) {
        throw new Error(
          "The server did not return a valid profile."
        );
      }

      const nextUser =
        data.user || null;

      const nextProfile =
        data.profile || emptyProfile;

      setUser(nextUser);
      setProfile(nextProfile);
      setSkills(data.skills || []);
      setExperiences(
        data.experiences || []
      );
      setEducations(
        data.educations || []
      );
      setProjects(
        data.projects || []
      );

      syncLocalStorage(
        nextUser,
        nextProfile
      );
    } catch (err: any) {
      console.error(
        "PROFILE LOADING ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your profile from the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* =======================================================
     PROFILE INPUT
  ======================================================= */

  const handleProfileChange = (
    e: ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setProfile((current) => ({
      ...current,
      [name]:
        name === "years_experience"
          ? Number(value)
          : value,
    }));
  };

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const saveProfile = async (
    e?: FormEvent
  ) => {
    e?.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiRequest(
        PROFILE_URL,
        {
          method: "PATCH",
          body: JSON.stringify({
            first_name:
              user?.first_name || "",

            last_name:
              user?.last_name || "",

            email:
              user?.email || "",

            full_name:
              profile.full_name,

            phone:
              profile.phone,

            country:
              profile.country,

            city:
              profile.city,

            bio:
              profile.bio,

            career_goal:
              profile.career_goal,

            target_role:
              profile.target_role,

            years_experience:
              profile.years_experience,

            work_preference:
              profile.work_preference,

            linkedin:
              profile.linkedin,

            github:
              profile.github,

            portfolio:
              profile.portfolio,
          }),
        }
      );

      if (data?.user) {
        setUser(data.user);
      }

      if (data?.profile) {
        setProfile(data.profile);

        syncLocalStorage(
          data.user || user,
          data.profile
        );
      }

      setEditing(false);

      showSuccessMessage(
        "Your profile has been saved successfully."
      );
    } catch (err: any) {
      console.error(
        "PROFILE SAVE ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     ADD SKILL
  ======================================================= */

  const addSkill = async () => {
    setError("");

    if (!skillForm.name.trim()) {
      setError(
        "Please enter a skill name."
      );
      return;
    }

    try {
      await apiRequest(
        SKILLS_URL,
        {
          method: "POST",
          body: JSON.stringify({
            name:
              skillForm.name.trim(),

            level:
              skillForm.level,

            category:
              skillForm.category.trim(),
          }),
        }
      );

      setSkillForm({
        name: "",
        level: "Intermediate",
        category: "",
      });

      setShowSkillForm(false);

      showSuccessMessage(
        "Skill added successfully."
      );

      await loadProfile();
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to add skill."
      );
    }
  };

  /* =======================================================
     DELETE SKILL
  ======================================================= */

  const deleteSkill = async (
    id: number
  ) => {
    setError("");

    try {
      await apiRequest(
        `${SKILLS_URL}${id}/`,
        {
          method: "DELETE",
        }
      );

      setSkills((current) =>
        current.filter(
          (skill) =>
            skill.id !== id
        )
      );

      showSuccessMessage(
        "Skill removed successfully."
      );

      await loadProfile();
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to delete skill."
      );
    }
  };

  /* =======================================================
     ADD EXPERIENCE
  ======================================================= */

  const addExperience = async () => {
    setError("");

    if (
      !experienceForm.role.trim() ||
      !experienceForm.company.trim()
    ) {
      setError(
        "Role and company are required."
      );
      return;
    }

    try {
      await apiRequest(
        EXPERIENCE_URL,
        {
          method: "POST",
          body: JSON.stringify({
            role:
              experienceForm.role.trim(),

            company:
              experienceForm.company.trim(),

            period:
              experienceForm.period.trim(),

            description:
              experienceForm.description.trim(),
          }),
        }
      );

      setExperienceForm({
        role: "",
        company: "",
        period: "",
        description: "",
      });

      setShowExperienceForm(false);

      showSuccessMessage(
        "Experience added successfully."
      );

      await loadProfile();
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to add experience."
      );
    }
  };

  /* =======================================================
     DELETE EXPERIENCE
  ======================================================= */

  const deleteExperience = async (
    id: number
  ) => {
    setError("");

    try {
      await apiRequest(
        `${EXPERIENCE_URL}${id}/`,
        {
          method: "DELETE",
        }
      );

      setExperiences((current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
      );

      showSuccessMessage(
        "Experience removed successfully."
      );

      await loadProfile();
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to delete experience."
      );
    }
  };

  /* =======================================================
     ADD EDUCATION
  ======================================================= */

  const addEducation = async () => {
    setError("");

    if (
      !educationForm.degree.trim() ||
      !educationForm.institution.trim()
    ) {
      setError(
        "Degree and institution are required."
      );
      return;
    }

    try {
      await apiRequest(
        EDUCATION_URL,
        {
          method: "POST",
          body: JSON.stringify({
            degree:
              educationForm.degree.trim(),

            institution:
              educationForm.institution.trim(),

            field:
              educationForm.field.trim(),

            period:
              educationForm.period.trim(),

            grade:
              educationForm.grade.trim(),
          }),
        }
      );

      setEducationForm({
        degree: "",
        institution: "",
        field: "",
        period: "",
        grade: "",
      });

      setShowEducationForm(false);

      showSuccessMessage(
        "Education added successfully."
      );

      await loadProfile();
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to add education."
      );
    }
  };

  /* =======================================================
     DELETE EDUCATION
  ======================================================= */

  const deleteEducation = async (
    id: number
  ) => {
    setError("");

    try {
      await apiRequest(
        `${EDUCATION_URL}${id}/`,
        {
          method: "DELETE",
        }
      );

      setEducations((current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
      );

      showSuccessMessage(
        "Education removed successfully."
      );

      await loadProfile();
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to delete education."
      );
    }
  };

  /* =======================================================
     ADD PROJECT
  ======================================================= */

  const addProject = async () => {
    setError("");

    if (!projectForm.name.trim()) {
      setError(
        "Project name is required."
      );
      return;
    }

    try {
      const technologies =
        projectForm.technologies
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);

      await apiRequest(
        PROJECTS_URL,
        {
          method: "POST",
          body: JSON.stringify({
            name:
              projectForm.name.trim(),

            description:
              projectForm.description.trim(),

            technologies,

            url:
              projectForm.url.trim(),
          }),
        }
      );

      setProjectForm({
        name: "",
        description: "",
        technologies: "",
        url: "",
      });

      setShowProjectForm(false);

      showSuccessMessage(
        "Project added successfully."
      );

      await loadProfile();
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to add project."
      );
    }
  };

  /* =======================================================
     DELETE PROJECT
  ======================================================= */

  const deleteProject = async (
    id: number
  ) => {
    setError("");

    try {
      await apiRequest(
        `${PROJECTS_URL}${id}/`,
        {
          method: "DELETE",
        }
      );

      setProjects((current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
      );

      showSuccessMessage(
        "Project removed successfully."
      );

      await loadProfile();
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to delete project."
      );
    }
  };

  /* =======================================================
     PROFILE PICTURE
  ======================================================= */

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handlePictureChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith("image/")
    ) {
      setError(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Your image is too large. Maximum file size is 5MB."
      );
      return;
    }

    if (picturePreviewRef.current) {
      URL.revokeObjectURL(
        picturePreviewRef.current
      );
    }

    const preview =
      URL.createObjectURL(file);

    picturePreviewRef.current = preview;

    setProfile((current) => ({
      ...current,
      profile_picture: preview,
    }));

    showSuccessMessage(
      "Profile picture preview updated. Backend upload is not enabled yet."
    );
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigation = [
    {
      id: "personal",
      label: "Personal",
      icon: UserRound,
    },
    {
      id: "career",
      label: "Career",
      icon: Target,
    },
    {
      id: "skills",
      label: "Skills",
      icon: Zap,
    },
    {
      id: "experience",
      label: "Experience",
      icon: BriefcaseBusiness,
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderGit2,
    },
  ];

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-[#f6faf8]">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <Loader2 className="h-8 w-8 animate-spin text-[#19d38f]" />
            </div>

            <h2 className="mt-5 text-base font-bold text-gray-900">
              Loading your profile
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Fetching your career information…
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const initials =
    getInitials(
      profile,
      user
    );

  const completion =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          profile.profile_completion || 0
        )
      )
    );

  const careerScore =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          profile.career_score || 0
        )
      )
    );

  const totalItems =
    skills.length +
    experiences.length +
    educations.length +
    projects.length;

  const displayName =
    profile.full_name ||
    `${user?.first_name || ""} ${
      user?.last_name || ""
    }`.trim() ||
    user?.username ||
    "Your Name";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <DashboardLayout>
      <div className="min-h-full w-full bg-[#f6faf8] text-gray-900">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header className="relative overflow-hidden border-b border-[#dce9e3] bg-white">

          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-emerald-50 blur-3xl" />

          <div className="relative w-full px-4 py-7 sm:px-6 lg:px-8 xl:py-9">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0f6b4f]">
                  <UserRound className="h-3.5 w-3.5" />
                  Career Profile
                </div>

                <h1 className="text-3xl font-black tracking-tight text-[#10251d] sm:text-4xl">
                  Your professional profile
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                  Keep your career information, skills,
                  experience and projects organized in one
                  place.
                </p>

              </div>

              <div className="flex items-center gap-3">

                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      loadProfile();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19d38f]/30 focus-visible:ring-offset-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    editing
                      ? saveProfile()
                      : setEditing(true)
                  }
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#103d2e] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0c3025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19d38f]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editing ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Edit3 className="h-4 w-4" />
                  )}

                  {saving
                    ? "Saving..."
                    : editing
                    ? "Save Changes"
                    : "Edit Profile"}
                </button>

              </div>

            </div>

          </div>
        </header>

        {/* =================================================
            ALERTS
        ================================================= */}

        <div className="w-full px-4 pt-5 sm:px-6 lg:px-8">

          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

              <X className="mt-0.5 h-4 w-4 shrink-0" />

              <p className="flex-1 leading-6">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="rounded-lg p-1 text-red-500 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                aria-label="Dismiss error message"
              >
                <X className="h-4 w-4" />
              </button>

            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-[#0f6b4f]">

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-4 w-4" />
              </div>

              {success}

            </div>
          )}

        </div>

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="w-full px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

          {/* =================================================
              PROFILE HERO
          ================================================= */}

          <section className="relative overflow-hidden rounded-3xl border border-[#0f4a38] bg-[#103d2e] shadow-sm">

            <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#19d38f]/15 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative p-6 sm:p-8 lg:p-10">

              <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

                {/* IDENTITY */}

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                  <div className="relative shrink-0">

                    {profile.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt={displayName}
                        className="h-28 w-28 rounded-3xl border-4 border-white/10 object-cover shadow-xl ring-1 ring-white/20 sm:h-32 sm:w-32"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[#19d38f] text-4xl font-black text-[#103d2e] shadow-xl sm:h-32 sm:w-32">
                        {initials}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={
                        handlePictureClick
                      }
                      className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-4 border-[#103d2e] bg-white text-[#103d2e] shadow-lg transition hover:bg-emerald-50 hover:text-[#0f6b4f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19d38f]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#103d2e]"
                      title="Change profile picture"
                      aria-label="Change profile picture"
                    >
                      <Camera className="h-4 w-4" />
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={
                        handlePictureChange
                      }
                    />

                  </div>

                  <div className="min-w-0">

                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#19d38f]" />
                      Professional Profile
                    </div>

                    <h2 className="wrap-break-word text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                      {displayName}
                    </h2>

                    <p className="mt-2 text-base font-semibold text-[#19d38f]">
                      {profile.target_role ||
                        "Add your target career role"}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-emerald-50/70">

                      {profile.city && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-[#19d38f]" />

                          {profile.city}

                          {profile.country
                            ? `, ${profile.country}`
                            : ""}
                        </span>
                      )}

                      {user?.email && (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-4 w-4 text-[#19d38f]" />
                          {user.email}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

                {/* SCORE CARDS */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-135">

                  {/* CAREER SCORE */}

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/60">
                      Career Score
                    </p>

                    <p className="mt-2 text-3xl font-black text-white">
                      {careerScore}
                    </p>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#19d38f]"
                        style={{
                          width: `${careerScore}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* COMPLETION */}

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/60">
                      Completion
                    </p>

                    <p className="mt-2 text-3xl font-black text-white">
                      {completion}%
                    </p>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-300"
                        style={{
                          width: `${completion}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* SKILLS */}

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/60">
                      Skills
                    </p>

                    <p className="mt-2 text-3xl font-black text-white">
                      {skills.length}
                    </p>

                    <p className="mt-1 text-xs text-emerald-100/50">
                      Added skills
                    </p>
                  </div>

                  {/* PORTFOLIO */}

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/60">
                      Portfolio
                    </p>

                    <p className="mt-2 text-3xl font-black text-white">
                      {totalItems}
                    </p>

                    <p className="mt-1 text-xs text-emerald-100/50">
                      Career items
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              NAVIGATION
          ================================================= */}

          <div className="sticky top-0 z-20 mt-5 rounded-2xl border border-[#dce9e3] bg-white/95 p-2 shadow-sm backdrop-blur">

            <nav
              aria-label="Profile sections"
              className="flex gap-1 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
            >

              {navigation.map((item) => {
                const Icon = item.icon;

                const active =
                  activeSection ===
                  item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={
                      active
                        ? "true"
                        : undefined
                    }
                    onClick={() =>
                      setActiveSection(
                        item.id
                      )
                    }
                    className={`flex min-w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19d38f]/40 focus-visible:ring-offset-2 ${
                      active
                        ? "bg-[#103d2e] text-white shadow-sm"
                        : "text-gray-500 hover:bg-emerald-50 hover:text-[#103d2e]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}

            </nav>

          </div>

          {/* =================================================
              QUICK STATS
          ================================================= */}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              label="Resume Score"
              value={
                profile.resume_score || 0
              }
              description="Current CV quality"
              icon={
                <Award className="h-5 w-5" />
              }
            />

            <StatCard
              label="ATS Score"
              value={
                profile.ats_score || 0
              }
              description="Recruiter compatibility"
              icon={
                <Target className="h-5 w-5" />
              }
            />

            <StatCard
              label="Experience"
              value={
                profile.years_experience || 0
              }
              description={
                profile.years_experience ===
                1
                  ? "Year of experience"
                  : "Years of experience"
              }
              icon={
                <BriefcaseBusiness className="h-5 w-5" />
              }
            />

            <StatCard
              label="Projects"
              value={projects.length}
              description="Portfolio projects"
              icon={
                <FolderGit2 className="h-5 w-5" />
              }
            />

          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="mt-5">

            {/* =================================================
                PERSONAL
            ================================================= */}

            {activeSection ===
              "personal" && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

                {/* PERSONAL INFORMATION */}

                <section className="overflow-hidden rounded-2xl border border-[#dce9e3] bg-white shadow-sm xl:col-span-2">

                  <SectionHeader
                    icon={
                      <UserRound className="h-5 w-5" />
                    }
                    title="Personal Information"
                    description="Manage your basic contact and personal information."
                  />

                  <form
                    onSubmit={saveProfile}
                    className="p-6 lg:p-8"
                  >

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                      <InputField
                        label="Full Name"
                        name="full_name"
                        value={
                          profile.full_name
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={!editing}
                        icon={
                          <UserRound className="h-4 w-4" />
                        }
                        placeholder="Your full name"
                      />

                      <InputField
                        label="Email Address"
                        value={
                          user?.email || ""
                        }
                        disabled
                        icon={
                          <Mail className="h-4 w-4" />
                        }
                      />

                      <InputField
                        label="Phone Number"
                        name="phone"
                        value={
                          profile.phone
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={!editing}
                        icon={
                          <Phone className="h-4 w-4" />
                        }
                        placeholder="+234..."
                      />

                      <InputField
                        label="Country"
                        name="country"
                        value={
                          profile.country
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={!editing}
                        icon={
                          <Globe className="h-4 w-4" />
                        }
                        placeholder="Nigeria"
                      />

                      <InputField
                        label="City"
                        name="city"
                        value={
                          profile.city
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={!editing}
                        icon={
                          <MapPin className="h-4 w-4" />
                        }
                        placeholder="Abuja"
                      />

                    </div>

                    <div className="mt-6">

                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Professional Bio
                      </label>

                      <textarea
                        name="bio"
                        value={
                          profile.bio
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={!editing}
                        rows={7}
                        placeholder="Tell employers and recruiters about your background, strengths and interests..."
                        className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm leading-6 text-gray-900 outline-none transition focus:border-[#19d38f] focus:bg-white focus:ring-4 focus:ring-[#19d38f]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                      />

                      <div className="mt-2 flex justify-between text-xs text-gray-400">
                        <span>
                          A strong bio improves your
                          professional profile.
                        </span>

                        <span>
                          {profile.bio?.length ||
                            0}{" "}
                          characters
                        </span>
                      </div>

                    </div>

                    {editing && (
                      <div className="mt-7 flex justify-end">

                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#103d2e] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0c3025] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}

                          Save Personal Information
                        </button>

                      </div>
                    )}

                  </form>

                </section>

                {/* PROFILE STRENGTH */}

                <section className="rounded-2xl border border-[#dce9e3] bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f]">
                      <Sparkles className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        Profile Strength
                      </h3>

                      <p className="text-xs text-gray-500">
                        Your current progress
                      </p>
                    </div>

                  </div>

                  <div className="mt-7 flex items-center justify-center">

                    <div className="relative flex h-44 w-44 items-center justify-center">

                      <svg
                        className="h-44 w-44 -rotate-90"
                        viewBox="0 0 120 120"
                      >

                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          className="text-gray-100"
                        />

                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={
                            2 *
                            Math.PI *
                            52
                          }
                          strokeDashoffset={
                            2 *
                            Math.PI *
                            52 *
                            (1 -
                              completion /
                                100)
                          }
                          className="text-[#19d38f] transition-all duration-700"
                        />

                      </svg>

                      <div className="absolute text-center">

                        <p className="text-4xl font-black text-[#10251d]">
                          {completion}%
                        </p>

                        <p className="mt-1 text-xs font-medium text-gray-400">
                          Complete
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="mt-6 space-y-3">

                    {[
                      {
                        label:
                          "Personal details",
                        done:
                          !!profile.full_name &&
                          !!profile.phone &&
                          !!profile.city,
                      },
                      {
                        label:
                          "Career direction",
                        done:
                          !!profile.target_role &&
                          !!profile.career_goal,
                      },
                      {
                        label:
                          "Professional skills",
                        done:
                          skills.length >
                          0,
                      },
                      {
                        label:
                          "Portfolio",
                        done:
                          projects.length >
                          0,
                      },
                    ].map((item) => (
                      <div
                        key={
                          item.label
                        }
                        className="flex items-center gap-3 rounded-xl bg-emerald-50/50 px-3 py-3"
                      >

                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            item.done
                              ? "bg-emerald-100 text-[#0f6b4f]"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </div>

                        <span className="flex-1 text-sm font-medium text-gray-700">
                          {item.label}
                        </span>

                        <span
                          className={`text-xs font-semibold ${
                            item.done
                              ? "text-[#0f6b4f]"
                              : "text-gray-400"
                          }`}
                        >
                          {item.done
                            ? "Complete"
                            : "Add"}
                        </span>

                      </div>
                    ))}

                  </div>

                </section>

              </div>
            )}

            {/* =================================================
                CAREER
            ================================================= */}

            {activeSection ===
              "career" && (
              <section className="overflow-hidden rounded-2xl border border-[#dce9e3] bg-white shadow-sm">

                <SectionHeader
                  icon={
                    <Target className="h-5 w-5" />
                  }
                  title="Career Information"
                  description="Define the direction, goals and work preferences that guide your career journey."
                />

                <div className="p-6 lg:p-8">

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    <InputField
                      label="Target Role"
                      name="target_role"
                      value={
                        profile.target_role
                      }
                      onChange={
                        handleProfileChange
                      }
                      disabled={!editing}
                      placeholder="e.g. Machine Learning Engineer"
                    />

                    <InputField
                      label="Years of Experience"
                      name="years_experience"
                      type="number"
                      min={0}
                      value={
                        profile.years_experience
                      }
                      onChange={
                        handleProfileChange
                      }
                      disabled={!editing}
                      placeholder="0"
                    />

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Work Preference
                      </label>

                      <select
                        name="work_preference"
                        value={
                          profile.work_preference
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={!editing}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 outline-none transition focus:border-[#19d38f] focus:bg-white focus:ring-4 focus:ring-[#19d38f]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                      >

                        <option value="">
                          Select preference
                        </option>

                        <option value="Remote">
                          Remote
                        </option>

                        <option value="Hybrid">
                          Hybrid
                        </option>

                        <option value="On-site">
                          On-site
                        </option>

                        <option value="Flexible">
                          Flexible
                        </option>

                      </select>

                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">

                      <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#0f6b4f]">
                          <Sparkles className="h-4 w-4" />
                        </div>

                        <div>

                          <p className="text-sm font-bold text-[#103d2e]">
                            Career direction
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#0f6b4f]">
                            Keep your target role aligned
                            with your skills, projects and
                            career goals.
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  <div className="mt-7">

                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Career Goal
                    </label>

                    <textarea
                      name="career_goal"
                      value={
                        profile.career_goal
                      }
                      onChange={
                        handleProfileChange
                      }
                      disabled={!editing}
                      rows={7}
                      placeholder="Describe the type of career you want to build..."
                      className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm leading-6 text-gray-900 outline-none transition focus:border-[#19d38f] focus:bg-white focus:ring-4 focus:ring-[#19d38f]/10 disabled:bg-gray-100 disabled:text-gray-500"
                    />

                  </div>

                  <div className="mt-8 border-t border-gray-100 pt-7">

                    <div className="mb-5">

                      <h3 className="text-base font-bold text-gray-950">
                        Professional Links
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Add links that help recruiters learn
                        more about your work.
                      </p>

                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                      <InputField
                        label="LinkedIn"
                        name="linkedin"
                        value={
                          profile.linkedin
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={!editing}
                        placeholder="https://linkedin.com/in/..."
                        icon={
                          <Linkedin className="h-4 w-4" />
                        }
                      />

                      <InputField
                        label="GitHub"
                        name="github"
                        value={
                          profile.github
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={!editing}
                        placeholder="https://github.com/..."
                        icon={
                          <Github className="h-4 w-4" />
                        }
                      />

                      <InputField
                        label="Portfolio"
                        name="portfolio"
                        value={
                          profile.portfolio
                        }
                        onChange={
                          handleProfileChange
                        }
                        disabled={!editing}
                        placeholder="https://..."
                        icon={
                          <Globe className="h-4 w-4" />
                        }
                      />

                    </div>

                  </div>

                  {editing && (
                    <div className="mt-8 flex justify-end">

                      <button
                        type="button"
                        onClick={() =>
                          saveProfile()
                        }
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#103d2e] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0c3025] disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}

                        Save Career Information

                      </button>

                    </div>
                  )}

                </div>

              </section>
            )}

            {/* =================================================
                SKILLS
            ================================================= */}

            {activeSection ===
              "skills" && (
              <SectionCard
                icon={
                  <Zap className="h-5 w-5" />
                }
                title="Skills"
                description="Showcase the technical and professional skills you have developed."
                buttonText="Add Skill"
                onButtonClick={() =>
                  setShowSkillForm(
                    (current) => !current
                  )
                }
              >

                {showSkillForm && (
                  <div className="mb-7 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 lg:p-6">

                    <div className="mb-5">

                      <h3 className="text-sm font-bold text-gray-900">
                        Add a new skill
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Add skills that are relevant to your
                        target role.
                      </p>

                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                      <InputField
                        label="Skill"
                        value={
                          skillForm.name
                        }
                        onChange={(e) =>
                          setSkillForm(
                            (current) => ({
                              ...current,
                              name: e.target.value,
                            })
                          )
                        }
                        placeholder="Python"
                      />

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Level
                        </label>

                        <select
                          value={
                            skillForm.level
                          }
                          onChange={(e) =>
                            setSkillForm(
                              (current) => ({
                                ...current,
                                level:
                                  e.target.value,
                              })
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#19d38f] focus:ring-4 focus:ring-[#19d38f]/10"
                        >

                          <option>
                            Beginner
                          </option>

                          <option>
                            Intermediate
                          </option>

                          <option>
                            Advanced
                          </option>

                          <option>
                            Expert
                          </option>

                        </select>

                      </div>

                      <InputField
                        label="Category"
                        value={
                          skillForm.category
                        }
                        onChange={(e) =>
                          setSkillForm(
                            (current) => ({
                              ...current,
                              category:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Programming"
                      />

                    </div>

                    <div className="mt-5 flex justify-end gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setShowSkillForm(
                            false
                          )
                        }
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={addSkill}
                        className="rounded-xl bg-[#103d2e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0c3025]"
                      >
                        Add Skill
                      </button>

                    </div>

                  </div>
                )}

                {skills.length === 0 ? (
                  <EmptyState
                    icon={
                      <Zap className="h-7 w-7" />
                    }
                    title="No skills added yet"
                    description="Add your technical and professional skills to strengthen your profile."
                    buttonText="Add Your First Skill"
                    onClick={() =>
                      setShowSkillForm(
                        true
                      )
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <h3 className="truncate font-bold text-gray-950">
                              {skill.name}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {skill.category ||
                                "General"}
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              deleteSkill(
                                skill.id
                              )
                            }
                            className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                            title="Delete skill"
                            aria-label={`Delete ${skill.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>

                        <div className="mt-5 flex items-center justify-between">

                          <span className="text-xs font-bold text-gray-500">
                            Proficiency
                          </span>

                          <span className="text-xs font-bold text-[#0f6b4f]">
                            {getSkillLabel(
                              skill.level
                            )}
                          </span>

                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

                          <div
                            className={`h-full rounded-full transition-all ${getSkillColor(
                              skill.level
                            )}`}
                            style={{
                              width:
                                getSkillWidth(
                                  skill.level
                                ),
                            }}
                          />

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </SectionCard>
            )}

            {/* =================================================
                EXPERIENCE
            ================================================= */}

            {activeSection ===
              "experience" && (
              <SectionCard
                icon={
                  <BriefcaseBusiness className="h-5 w-5" />
                }
                title="Work Experience"
                description="Show recruiters the professional experience behind your skills."
                buttonText="Add Experience"
                onButtonClick={() =>
                  setShowExperienceForm(
                    (current) => !current
                  )
                }
              >

                {showExperienceForm && (
                  <div className="mb-7 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 lg:p-6">

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                      <InputField
                        label="Role"
                        value={
                          experienceForm.role
                        }
                        onChange={(e) =>
                          setExperienceForm(
                            (current) => ({
                              ...current,
                              role:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Software Developer"
                      />

                      <InputField
                        label="Company"
                        value={
                          experienceForm.company
                        }
                        onChange={(e) =>
                          setExperienceForm(
                            (current) => ({
                              ...current,
                              company:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Company name"
                      />

                      <InputField
                        label="Period"
                        value={
                          experienceForm.period
                        }
                        onChange={(e) =>
                          setExperienceForm(
                            (current) => ({
                              ...current,
                              period:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="2024 - Present"
                      />

                    </div>

                    <div className="mt-5">

                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Description
                      </label>

                      <textarea
                        value={
                          experienceForm.description
                        }
                        onChange={(e) =>
                          setExperienceForm(
                            (current) => ({
                              ...current,
                              description:
                                e.target.value,
                            })
                          )
                        }
                        rows={5}
                        placeholder="Describe your responsibilities, achievements and impact..."
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm leading-6 outline-none focus:border-[#19d38f] focus:ring-4 focus:ring-[#19d38f]/10"
                      />

                    </div>

                    <div className="mt-5 flex justify-end gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setShowExperienceForm(
                            false
                          )
                        }
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          addExperience
                        }
                        className="rounded-xl bg-[#103d2e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0c3025]"
                      >
                        Add Experience
                      </button>

                    </div>

                  </div>
                )}

                {experiences.length === 0 ? (
                  <EmptyState
                    icon={
                      <BriefcaseBusiness className="h-7 w-7" />
                    }
                    title="No experience added"
                    description="Add your work experience to give recruiters a better understanding of your professional background."
                    buttonText="Add Experience"
                    onClick={() =>
                      setShowExperienceForm(
                        true
                      )
                    }
                  />
                ) : (
                  <div className="relative">

                    <div className="absolute bottom-5 left-4.5 top-5 hidden w-px bg-emerald-100 md:block" />

                    <div className="space-y-5">

                      {experiences.map(
                        (
                          experience,
                          index
                        ) => (
                          <div
                            key={
                              experience.id
                            }
                            className="relative rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-emerald-200 hover:shadow-sm md:pl-14"
                          >

                            <div className="absolute left-3 top-7 hidden h-3 w-3 rounded-full border-2 border-[#19d38f] bg-white md:block" />

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                              <div>

                                <div className="flex items-center gap-2">

                                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0f6b4f]">
                                    Experience{" "}
                                    {index + 1}
                                  </span>

                                </div>

                                <h3 className="mt-3 text-lg font-bold text-gray-950">
                                  {
                                    experience.role
                                  }
                                </h3>

                                <p className="mt-1 font-semibold text-[#0f6b4f]">
                                  {
                                    experience.company
                                  }
                                </p>

                                {experience.period && (
                                  <p className="mt-2 text-xs font-medium text-gray-400">
                                    {
                                      experience.period
                                    }
                                  </p>
                                )}

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteExperience(
                                    experience.id
                                  )
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                                title="Delete experience"
                                aria-label={`Delete ${experience.role} at ${experience.company}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>

                            {experience.description && (
                              <p className="mt-5 max-w-4xl whitespace-pre-line text-sm leading-7 text-gray-600">
                                {
                                  experience.description
                                }
                              </p>
                            )}

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

              </SectionCard>
            )}

            {/* =================================================
                EDUCATION
            ================================================= */}

            {activeSection ===
              "education" && (
              <SectionCard
                icon={
                  <GraduationCap className="h-5 w-5" />
                }
                title="Education"
                description="Keep your academic qualifications and achievements organized."
                buttonText="Add Education"
                onButtonClick={() =>
                  setShowEducationForm(
                    (current) => !current
                  )
                }
              >

                {showEducationForm && (
                  <div className="mb-7 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 lg:p-6">

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                      <InputField
                        label="Degree"
                        value={
                          educationForm.degree
                        }
                        onChange={(e) =>
                          setEducationForm(
                            (current) => ({
                              ...current,
                              degree:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="B.Sc. Computer Science"
                      />

                      <InputField
                        label="Institution"
                        value={
                          educationForm.institution
                        }
                        onChange={(e) =>
                          setEducationForm(
                            (current) => ({
                              ...current,
                              institution:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="University"
                      />

                      <InputField
                        label="Field of Study"
                        value={
                          educationForm.field
                        }
                        onChange={(e) =>
                          setEducationForm(
                            (current) => ({
                              ...current,
                              field:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Computer Science"
                      />

                      <InputField
                        label="Period"
                        value={
                          educationForm.period
                        }
                        onChange={(e) =>
                          setEducationForm(
                            (current) => ({
                              ...current,
                              period:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="2021 - 2025"
                      />

                      <InputField
                        label="Grade"
                        value={
                          educationForm.grade
                        }
                        onChange={(e) =>
                          setEducationForm(
                            (current) => ({
                              ...current,
                              grade:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="3.92 / 5.00"
                      />

                    </div>

                    <div className="mt-5 flex justify-end gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setShowEducationForm(
                            false
                          )
                        }
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          addEducation
                        }
                        className="rounded-xl bg-[#103d2e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0c3025]"
                      >
                        Add Education
                      </button>

                    </div>

                  </div>
                )}

                {educations.length === 0 ? (
                  <EmptyState
                    icon={
                      <GraduationCap className="h-7 w-7" />
                    }
                    title="No education added"
                    description="Add your academic qualifications so your profile tells a complete story."
                    buttonText="Add Education"
                    onClick={() =>
                      setShowEducationForm(
                        true
                      )
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    {educations.map(
                      (education) => (
                        <div
                          key={
                            education.id
                          }
                          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-emerald-200 hover:shadow-md"
                        >

                          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-emerald-50" />

                          <div className="relative">

                            <div className="flex items-start justify-between gap-4">

                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f]">
                                <GraduationCap className="h-5 w-5" />
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteEducation(
                                    education.id
                                  )
                                }
                                className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                                title="Delete education"
                                aria-label={`Delete ${education.degree}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>

                            <h3 className="mt-5 text-lg font-bold text-gray-950">
                              {
                                education.degree
                              }
                            </h3>

                            <p className="mt-1 font-semibold text-[#0f6b4f]">
                              {
                                education.institution
                              }
                            </p>

                            {education.field && (
                              <p className="mt-2 text-sm text-gray-600">
                                {
                                  education.field
                                }
                              </p>
                            )}

                            <div className="mt-5 flex flex-wrap items-center gap-2">

                              {education.period && (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                  {
                                    education.period
                                  }
                                </span>
                              )}

                              {education.grade && (
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#0f6b4f]">
                                  {
                                    education.grade
                                  }
                                </span>
                              )}

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </SectionCard>
            )}

            {/* =================================================
                PROJECTS
            ================================================= */}

            {activeSection ===
              "projects" && (
              <SectionCard
                icon={
                  <FolderGit2 className="h-5 w-5" />
                }
                title="Projects"
                description="Showcase practical work that demonstrates what you can build."
                buttonText="Add Project"
                onButtonClick={() =>
                  setShowProjectForm(
                    (current) => !current
                  )
                }
              >

                {showProjectForm && (
                  <div className="mb-7 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 lg:p-6">

                    <div className="mb-5">

                      <h3 className="text-sm font-bold text-gray-900">
                        Add a project
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Add projects that demonstrate your
                        technical abilities.
                      </p>

                    </div>

                    <div className="space-y-5">

                      <InputField
                        label="Project Name"
                        value={
                          projectForm.name
                        }
                        onChange={(e) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              name:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="AI Career Assistant"
                      />

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Description
                        </label>

                        <textarea
                          value={
                            projectForm.description
                          }
                          onChange={(e) =>
                            setProjectForm(
                              (current) => ({
                                ...current,
                                description:
                                  e.target.value,
                              })
                            )
                          }
                          rows={5}
                          placeholder="Describe what you built, the problem it solves and your contribution..."
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm leading-6 outline-none focus:border-[#19d38f] focus:ring-4 focus:ring-[#19d38f]/10"
                        />

                      </div>

                      <InputField
                        label="Technologies"
                        value={
                          projectForm.technologies
                        }
                        onChange={(e) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              technologies:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Python, Django, React, PostgreSQL"
                      />

                      <InputField
                        label="Project URL"
                        value={
                          projectForm.url
                        }
                        onChange={(e) =>
                          setProjectForm(
                            (current) => ({
                              ...current,
                              url:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="https://github.com/..."
                      />

                    </div>

                    <div className="mt-5 flex justify-end gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setShowProjectForm(
                            false
                          )
                        }
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={addProject}
                        className="rounded-xl bg-[#103d2e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0c3025]"
                      >
                        Add Project
                      </button>

                    </div>

                  </div>
                )}

                {projects.length === 0 ? (
                  <EmptyState
                    icon={
                      <FolderGit2 className="h-7 w-7" />
                    }
                    title="No projects added"
                    description="Add projects that showcase your technical skills and practical experience."
                    buttonText="Add Project"
                    onClick={() =>
                      setShowProjectForm(
                        true
                      )
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    {projects.map(
                      (project) => {
                        const technologies =
                          normalizeTechnologies(
                            project.technologies
                          );

                        return (
                          <article
                            key={
                              project.id
                            }
                            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                          >

                            <div className="h-1.5 bg-linear-to-r from-[#103d2e] via-[#19d38f] to-emerald-300" />

                            <div className="p-6">

                              <div className="flex items-start justify-between gap-4">

                                <div className="flex min-w-0 items-start gap-3">

                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f]">
                                    <FolderGit2 className="h-5 w-5" />
                                  </div>

                                  <div className="min-w-0">

                                    <h3 className="text-lg font-bold text-gray-950">
                                      {
                                        project.name
                                      }
                                    </h3>

                                    <p className="mt-1 text-xs font-medium text-gray-400">
                                      Portfolio Project
                                    </p>

                                  </div>

                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteProject(
                                      project.id
                                    )
                                  }
                                  className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                                  title="Delete project"
                                  aria-label={`Delete ${project.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>

                              </div>

                              {project.description && (
                                <p className="mt-5 line-clamp-4 text-sm leading-7 text-gray-600">
                                  {
                                    project.description
                                  }
                                </p>
                              )}

                              {technologies.length >
                                0 && (
                                <div className="mt-5 flex flex-wrap gap-2">

                                  {technologies.map(
                                    (
                                      technology,
                                      index
                                    ) => (
                                      <span
                                        key={`${technology}-${index}`}
                                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600"
                                      >
                                        {
                                          technology
                                        }
                                      </span>
                                    )
                                  )}

                                </div>
                              )}

                              {project.url && (
                                <a
                                  href={
                                    project.url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#103d2e] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0c3025]"
                                >
                                  View Project

                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}

                            </div>

                          </article>
                        );
                      }
                    )}

                  </div>
                )}

              </SectionCard>
            )}

          </div>

          {/* =================================================
              FOOTER NOTE
          ================================================= */}

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 sm:flex-row sm:items-center">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#0f6b4f]">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="flex-1">

              <p className="text-sm font-bold text-[#103d2e]">
                Keep your profile up to date
              </p>

              <p className="mt-1 text-xs leading-5 text-[#0f6b4f]">
                Your profile information can help power
                personalized career recommendations,
                job matching and AI career guidance.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setActiveSection(
                  "career"
                )
              }
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0f6b4f] hover:text-[#103d2e]"
            >
              Review career goals

              <ChevronRight className="h-4 w-4" />
            </button>

          </div>

        </main>

      </div>
    </DashboardLayout>
  );
}

export default Profile;