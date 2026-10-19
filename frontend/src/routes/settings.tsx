import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Bot,
  Briefcase,
  Check,
  ChevronRight,
  Eye,
  KeyRound,
  LogOut,
  Moon,
  Palette,
  RefreshCw,
  Save,
  Shield,
  Target,
  Trash2,
  X,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      {
        title: "Settings — Pathwise",
      },
    ],
  }),
});

/* =========================================================
   TYPES
========================================================= */

type SettingsSection =
  | "career"
  | "notifications"
  | "ai"
  | "privacy";

type Theme = "Light" | "Dark" | "System";

type CareerPreferencesData = {
  jobPreference: string;
  experienceLevel: string;
  targetRole: string;
  industry: string;
  location: string;
  salaryExpectation: string;
  skills: string;
  openToRelocation: boolean;
};

type NotificationData = {
  jobMatches: boolean;
  careerRecommendations: boolean;
  cvUpdates: boolean;
  interviewReminders: boolean;
  scholarshipAlerts: boolean;
  productUpdates: boolean;
  emailNotifications: boolean;
};

type AISettingsData = {
  personalizedAdvice: boolean;
  profileAnalysis: boolean;
  jobMatching: boolean;
  learningRecommendations: boolean;
};

type PrivacySettingsData = {
  profileVisibility: string;
  showEmail: boolean;
  showPhone: boolean;
  recruiterDiscovery: boolean;
  analytics: boolean;
};

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_CAREER: CareerPreferencesData = {
  jobPreference: "Remote",
  experienceLevel: "Entry Level",
  targetRole: "Data Analyst",
  industry: "Technology",
  location: "Nigeria",
  salaryExpectation: "",
  skills: "",
  openToRelocation: false,
};

const DEFAULT_NOTIFICATIONS: NotificationData = {
  jobMatches: true,
  careerRecommendations: true,
  cvUpdates: true,
  interviewReminders: true,
  scholarshipAlerts: true,
  productUpdates: false,
  emailNotifications: true,
};

const DEFAULT_AI: AISettingsData = {
  personalizedAdvice: true,
  profileAnalysis: true,
  jobMatching: true,
  learningRecommendations: true,
};

const DEFAULT_PRIVACY: PrivacySettingsData = {
  profileVisibility: "Private",
  showEmail: false,
  showPhone: false,
  recruiterDiscovery: false,
  analytics: true,
};

/* =========================================================
   STORAGE
========================================================= */

function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const saved = localStorage.getItem(key);

    if (!saved) return fallback;

    const parsed = JSON.parse(saved);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return fallback;
    }

    return {
      ...fallback,
      ...parsed,
    };
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  localStorage.setItem(key, JSON.stringify(value));
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "Light";

  const value = localStorage.getItem("Pathwise_theme");

  if (
    value === "Light" ||
    value === "Dark" ||
    value === "System"
  ) {
    return value;
  }

  return "Light";
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;

  if (theme === "Dark") {
    root.classList.add("dark");
    return;
  }

  if (theme === "Light") {
    root.classList.remove("dark");
    return;
  }

  root.classList.toggle(
    "dark",
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
}

/* =========================================================
   SETTINGS PAGE
========================================================= */

function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("career");

  const [career, setCareer] =
    useState<CareerPreferencesData>(DEFAULT_CAREER);

  const [notifications, setNotifications] =
    useState<NotificationData>(DEFAULT_NOTIFICATIONS);

  const [aiSettings, setAISettings] =
    useState<AISettingsData>(DEFAULT_AI);

  const [privacy, setPrivacy] =
    useState<PrivacySettingsData>(DEFAULT_PRIVACY);

  const [theme, setTheme] =
    useState<Theme>("Light");

  const [savedSnapshot, setSavedSnapshot] =
    useState("");

  const [saved, setSaved] = useState(false);

  const [hydrated, setHydrated] =
    useState(false);

  const [logoutModal, setLogoutModal] =
    useState(false);

  const [deleteModal, setDeleteModal] =
    useState(false);

  /* =======================================================
     LOAD SETTINGS
  ======================================================= */

  useEffect(() => {
    const storedCareer = loadStorage(
      "Pathwise_career_preferences",
      DEFAULT_CAREER,
    );

    const storedNotifications = loadStorage(
      "Pathwise_notifications",
      DEFAULT_NOTIFICATIONS,
    );

    const storedAI = loadStorage(
      "Pathwise_ai_settings",
      DEFAULT_AI,
    );

    const storedPrivacy = loadStorage(
      "Pathwise_privacy_settings",
      DEFAULT_PRIVACY,
    );

    const storedTheme = getStoredTheme();

    setCareer(storedCareer);
    setNotifications(storedNotifications);
    setAISettings(storedAI);
    setPrivacy(storedPrivacy);
    setTheme(storedTheme);

    applyTheme(storedTheme);

    setSavedSnapshot(
      JSON.stringify({
        career: storedCareer,
        notifications: storedNotifications,
        aiSettings: storedAI,
        privacy: storedPrivacy,
        theme: storedTheme,
      }),
    );

    setHydrated(true);
  }, []);

  /* =======================================================
     SNAPSHOT
  ======================================================= */

  const currentSnapshot = useMemo(() => {
    if (!hydrated) return "";

    return JSON.stringify({
      career,
      notifications,
      aiSettings,
      privacy,
      theme,
    });
  }, [
    hydrated,
    career,
    notifications,
    aiSettings,
    privacy,
    theme,
  ]);

  const hasUnsavedChanges =
    hydrated &&
    currentSnapshot !== savedSnapshot;

  /* =======================================================
     SAVE
  ======================================================= */

  function saveSettings() {
    saveStorage(
      "Pathwise_career_preferences",
      career,
    );

    saveStorage(
      "Pathwise_notifications",
      notifications,
    );

    saveStorage(
      "Pathwise_ai_settings",
      aiSettings,
    );

    saveStorage(
      "Pathwise_privacy_settings",
      privacy,
    );

    localStorage.setItem(
      "Pathwise_theme",
      theme,
    );

    applyTheme(theme);

    setSavedSnapshot(
      JSON.stringify({
        career,
        notifications,
        aiSettings,
        privacy,
        theme,
      }),
    );

    setSaved(true);

    window.dispatchEvent(
      new CustomEvent(
        "Pathwise-settings-updated",
        {
          detail: {
            career,
            notifications,
            aiSettings,
            privacy,
            theme,
          },
        },
      ),
    );

    window.setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  /* =======================================================
     RESET
  ======================================================= */

  function resetChanges() {
    const storedCareer = loadStorage(
      "Pathwise_career_preferences",
      DEFAULT_CAREER,
    );

    const storedNotifications = loadStorage(
      "Pathwise_notifications",
      DEFAULT_NOTIFICATIONS,
    );

    const storedAI = loadStorage(
      "Pathwise_ai_settings",
      DEFAULT_AI,
    );

    const storedPrivacy = loadStorage(
      "Pathwise_privacy_settings",
      DEFAULT_PRIVACY,
    );

    const storedTheme = getStoredTheme();

    setCareer(storedCareer);
    setNotifications(storedNotifications);
    setAISettings(storedAI);
    setPrivacy(storedPrivacy);
    setTheme(storedTheme);

    applyTheme(storedTheme);
    setSaved(false);
  }

  /* =======================================================
     UPDATES
  ======================================================= */

  function updateCareer(
    field: keyof CareerPreferencesData,
    value: string | boolean,
  ) {
    setCareer((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function toggleNotification(
    field: keyof NotificationData,
  ) {
    setNotifications((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  }

  function toggleAISetting(
    field: keyof AISettingsData,
  ) {
    setAISettings((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  }

  function togglePrivacy(
    field: keyof PrivacySettingsData,
  ) {
    setPrivacy((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  }

  function updatePrivacy(
    field: keyof PrivacySettingsData,
    value: string,
  ) {
    setPrivacy((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function changeTheme(value: Theme) {
    setTheme(value);
    applyTheme(value);
  }

  /* =======================================================
     BEFORE UNLOAD
  ======================================================= */

  useEffect(() => {
    function handleBeforeUnload(
      event: BeforeUnloadEvent,
    ) {
      if (!hasUnsavedChanges) return;

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
    };
  }, [hasUnsavedChanges]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <DashboardLayout title="Settings">
      <div className="min-h-full w-full bg-[#f6faf8] text-gray-900">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="relative overflow-hidden border-b border-[#dce9e3] bg-white">

          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" />

          <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-emerald-50 blur-3xl" />

          <div className="relative w-full px-4 py-7 sm:px-6 lg:px-8 xl:py-9">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0f6b4f]">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Preferences
                </div>

                <h1 className="text-3xl font-black tracking-tight text-[#10251d] sm:text-4xl">
                  Settings
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                  Personalize how Pathwise works for you,
                  from job discovery and AI recommendations
                  to notifications and privacy.
                </p>

              </div>

              <div className="hidden items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 sm:flex">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#103d2e] text-[#19d38f]">
                  <Sparkles className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-[#103d2e]">
                    Pathwise preferences
                  </p>

                  <p className="text-[11px] text-gray-500">
                    Your choices are saved locally
                  </p>
                </div>

              </div>

            </div>

          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="h-fit rounded-2xl border border-[#dce9e3] bg-white p-2 shadow-sm lg:sticky lg:top-6">

              <div className="px-3 pb-3 pt-3">

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                  Settings
                </p>

                <p className="mt-1 text-sm font-semibold text-[#103d2e]">
                  Manage preferences
                </p>

              </div>

              <SettingsNavItem
                icon={Briefcase}
                label="Career preferences"
                description="Jobs & career"
                active={activeSection === "career"}
                onClick={() =>
                  setActiveSection("career")
                }
              />

              <SettingsNavItem
                icon={Bell}
                label="Notifications"
                description="Alerts & updates"
                active={
                  activeSection === "notifications"
                }
                onClick={() =>
                  setActiveSection("notifications")
                }
              />

              <SettingsNavItem
                icon={Bot}
                label="AI preferences"
                description="Personalization"
                active={activeSection === "ai"}
                onClick={() =>
                  setActiveSection("ai")
                }
              />

              <SettingsNavItem
                icon={Shield}
                label="Privacy & security"
                description="Visibility & access"
                active={activeSection === "privacy"}
                onClick={() =>
                  setActiveSection("privacy")
                }
              />

              <div className="my-2 border-t border-[#edf1ed]" />

              <button
                type="button"
                onClick={() =>
                  setLogoutModal(true)
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="flex-1">
                  Log out
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              </button>

            </aside>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="min-w-0 space-y-6">

              {activeSection === "career" && (
                <CareerPreferences
                  career={career}
                  updateCareer={updateCareer}
                  theme={theme}
                  changeTheme={changeTheme}
                />
              )}

              {activeSection === "notifications" && (
                <NotificationSettings
                  notifications={notifications}
                  toggleNotification={
                    toggleNotification
                  }
                />
              )}

              {activeSection === "ai" && (
                <AISettings
                  settings={aiSettings}
                  toggleSetting={toggleAISetting}
                />
              )}

              {activeSection === "privacy" && (
                <PrivacySettings
                  privacy={privacy}
                  togglePrivacy={togglePrivacy}
                  updatePrivacy={updatePrivacy}
                  onDelete={() =>
                    setDeleteModal(true)
                  }
                />
              )}

              {/* =================================================
                  SAVE BAR
              ================================================= */}

              <div className="sticky bottom-4 z-20 rounded-2xl border border-[#dce9e3] bg-white/95 p-4 shadow-lg backdrop-blur">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        saved
                          ? "bg-emerald-100 text-emerald-700"
                          : hasUnsavedChanges
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-[#0f6b4f]"
                      }`}
                    >
                      {saved ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-[#103d2e]">
                        {saved
                          ? "Changes saved"
                          : hasUnsavedChanges
                            ? "Unsaved changes"
                            : "Everything is up to date"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {hasUnsavedChanges
                          ? "Save your preferences when you're ready."
                          : "Your current preferences are saved."}
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      disabled={!hasUnsavedChanges}
                      onClick={resetChanges}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfe7df] px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Undo
                    </button>

                    <button
                      type="button"
                      disabled={!hasUnsavedChanges}
                      onClick={saveSettings}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#103d2e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18533e] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                    >
                      <Save className="h-4 w-4" />
                      {saved
                        ? "Saved"
                        : "Save changes"}
                    </button>

                  </div>

                </div>

              </div>

            </main>

          </div>

        </div>

      </div>

      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}

      {logoutModal && (
        <Modal
          title="Log out"
          description="Are you sure you want to leave Pathwise?"
          icon={LogOut}
          danger
          onClose={() =>
            setLogoutModal(false)
          }
        >
          <div className="flex gap-3">

            <button
              type="button"
              onClick={() =>
                setLogoutModal(false)
              }
              className="flex-1 rounded-xl border border-[#dfe7df] px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                setLogoutModal(false);

                alert(
                  "Connect this to your authentication logout function.",
                );
              }}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Log out
            </button>

          </div>
        </Modal>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteModal && (
        <Modal
          title="Delete account"
          description="This action cannot be undone."
          icon={Trash2}
          danger
          onClose={() =>
            setDeleteModal(false)
          }
        >

          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">
            Your Pathwise account and associated data
            will eventually be permanently deleted.
          </div>

          <div className="mt-4 flex gap-3">

            <button
              type="button"
              onClick={() =>
                setDeleteModal(false)
              }
              className="flex-1 rounded-xl border border-[#dfe7df] px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                setDeleteModal(false);

                alert(
                  "Connect this to your account deletion API.",
                );
              }}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Delete account
            </button>

          </div>

        </Modal>
      )}

    </DashboardLayout>
  );
}

/* =========================================================
   CAREER PREFERENCES
========================================================= */

function CareerPreferences({
  career,
  updateCareer,
  theme,
  changeTheme,
}: {
  career: CareerPreferencesData;
  updateCareer: (
    field: keyof CareerPreferencesData,
    value: string | boolean,
  ) => void;
  theme: Theme;
  changeTheme: (value: Theme) => void;
}) {
  return (
    <div className="space-y-6">

      <SettingsCard
        icon={Briefcase}
        title="Career preferences"
        description="Tell Pathwise what kind of opportunities you're looking for."
      >

        <div className="grid gap-5 sm:grid-cols-2">

          <SelectField
            label="Work preference"
            value={career.jobPreference}
            options={[
              "Remote",
              "Hybrid",
              "On-site",
              "Any",
            ]}
            onChange={(value) =>
              updateCareer(
                "jobPreference",
                value,
              )
            }
          />

          <SelectField
            label="Experience level"
            value={career.experienceLevel}
            options={[
              "Entry Level",
              "Junior",
              "Mid Level",
              "Senior",
              "Any",
            ]}
            onChange={(value) =>
              updateCareer(
                "experienceLevel",
                value,
              )
            }
          />

          <SelectField
            label="Target role"
            value={career.targetRole}
            options={[
              "Data Analyst",
              "Data Scientist",
              "Machine Learning Engineer",
              "AI Engineer",
              "Software Developer",
              "Python Developer",
              "Frontend Developer",
              "Backend Developer",
              "Full Stack Developer",
              "Other",
            ]}
            onChange={(value) =>
              updateCareer(
                "targetRole",
                value,
              )
            }
          />

          <SelectField
            label="Industry"
            value={career.industry}
            options={[
              "Technology",
              "Finance",
              "Healthcare",
              "Education",
              "Consulting",
              "Government",
              "Any",
            ]}
            onChange={(value) =>
              updateCareer(
                "industry",
                value,
              )
            }
          />

          <SelectField
            label="Preferred country"
            value={career.location}
            options={[
              "Nigeria",
              "Canada",
              "United Kingdom",
              "United States",
              "South Africa",
              "Any",
            ]}
            onChange={(value) =>
              updateCareer(
                "location",
                value,
              )
            }
          />

          <FormField
            label="Salary expectation"
            value={career.salaryExpectation}
            placeholder="e.g. $40,000 - $60,000"
            onChange={(value) =>
              updateCareer(
                "salaryExpectation",
                value,
              )
            }
          />

        </div>

        <div className="mt-6">

          <label className="mb-2 block text-sm font-semibold text-[#103d2e]">
            Skills
          </label>

          <textarea
            value={career.skills}
            onChange={(event) =>
              updateCareer(
                "skills",
                event.target.value,
              )
            }
            rows={4}
            placeholder="Python, SQL, React, Machine Learning..."
            className="w-full resize-none rounded-xl border border-[#dfe7df] bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-300 focus:border-[#19d38f] focus:ring-4 focus:ring-emerald-50"
          />

          <p className="mt-2 text-xs text-gray-400">
            Separate skills with commas.
          </p>

        </div>

      </SettingsCard>

      <SettingsCard
        icon={Target}
        title="Job discovery"
        description="Control how Pathwise prioritizes opportunities."
      >

        <div className="divide-y divide-[#edf1ed]">

          <ToggleRow
            title="Open to relocation"
            description="Include jobs that require relocation."
            enabled={career.openToRelocation}
            onToggle={() =>
              updateCareer(
                "openToRelocation",
                !career.openToRelocation,
              )
            }
          />

          <ToggleRow
            title="Prioritize remote jobs"
            description="Give remote opportunities more priority."
            enabled={
              career.jobPreference === "Remote"
            }
            onToggle={() =>
              updateCareer(
                "jobPreference",
                career.jobPreference ===
                  "Remote"
                  ? "Any"
                  : "Remote",
              )
            }
          />

        </div>

      </SettingsCard>

      <SettingsCard
        icon={Palette}
        title="Appearance"
        description="Choose how Pathwise looks on your device."
      >

        <div className="grid gap-3 sm:grid-cols-3">

          <ThemeOption
            icon={SunIcon}
            title="Light"
            description="Clean and bright"
            active={theme === "Light"}
            onClick={() =>
              changeTheme("Light")
            }
          />

          <ThemeOption
            icon={Moon}
            title="Dark"
            description="Easy on the eyes"
            active={theme === "Dark"}
            onClick={() =>
              changeTheme("Dark")
            }
          />

          <ThemeOption
            icon={SlidersHorizontal}
            title="System"
            description="Follow your device"
            active={theme === "System"}
            onClick={() =>
              changeTheme("System")
            }
          />

        </div>

      </SettingsCard>

    </div>
  );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationSettings({
  notifications,
  toggleNotification,
}: {
  notifications: NotificationData;
  toggleNotification: (
    field: keyof NotificationData,
  ) => void;
}) {
  return (
    <SettingsCard
      icon={Bell}
      title="Notifications"
      description="Choose the Pathwise updates and alerts you want to receive."
    >

      <div className="divide-y divide-[#edf1ed]">

        <ToggleRow
          title="Job matches"
          description="Get notified about jobs matching your profile."
          enabled={notifications.jobMatches}
          onToggle={() =>
            toggleNotification("jobMatches")
          }
        />

        <ToggleRow
          title="Career recommendations"
          description="Receive personalized career suggestions."
          enabled={
            notifications.careerRecommendations
          }
          onToggle={() =>
            toggleNotification(
              "careerRecommendations",
            )
          }
        />

        <ToggleRow
          title="CV updates"
          description="Get updates related to your CV and applications."
          enabled={notifications.cvUpdates}
          onToggle={() =>
            toggleNotification("cvUpdates")
          }
        />

        <ToggleRow
          title="Interview reminders"
          description="Receive reminders about upcoming interviews."
          enabled={
            notifications.interviewReminders
          }
          onToggle={() =>
            toggleNotification(
              "interviewReminders",
            )
          }
        />

        <ToggleRow
          title="Scholarship alerts"
          description="Get notified about relevant scholarship opportunities."
          enabled={
            notifications.scholarshipAlerts
          }
          onToggle={() =>
            toggleNotification(
              "scholarshipAlerts",
            )
          }
        />

        <ToggleRow
          title="Product updates"
          description="Receive occasional updates about Pathwise."
          enabled={notifications.productUpdates}
          onToggle={() =>
            toggleNotification(
              "productUpdates",
            )
          }
        />

        <ToggleRow
          title="Email notifications"
          description="Allow Pathwise to send notifications by email."
          enabled={
            notifications.emailNotifications
          }
          onToggle={() =>
            toggleNotification(
              "emailNotifications",
            )
          }
        />

      </div>

    </SettingsCard>
  );
}

/* =========================================================
   AI SETTINGS
========================================================= */

function AISettings({
  settings,
  toggleSetting,
}: {
  settings: AISettingsData;
  toggleSetting: (
    field: keyof AISettingsData,
  ) => void;
}) {
  return (
    <div className="space-y-6">

      <SettingsCard
        icon={Bot}
        title="AI preferences"
        description="Control how Pathwise uses your information to personalize AI-powered features."
      >

        <div className="divide-y divide-[#edf1ed]">

          <ToggleRow
            title="Personalized career advice"
            description="Use your profile and career goals when generating advice."
            enabled={
              settings.personalizedAdvice
            }
            onToggle={() =>
              toggleSetting(
                "personalizedAdvice",
              )
            }
          />

          <ToggleRow
            title="Profile analysis"
            description="Analyze your skills, education and experience."
            enabled={
              settings.profileAnalysis
            }
            onToggle={() =>
              toggleSetting(
                "profileAnalysis",
              )
            }
          />

          <ToggleRow
            title="AI job matching"
            description="Use your profile and preferences to improve job recommendations."
            enabled={
              settings.jobMatching
            }
            onToggle={() =>
              toggleSetting(
                "jobMatching",
              )
            }
          />

          <ToggleRow
            title="Learning recommendations"
            description="Recommend learning resources based on your career goals."
            enabled={
              settings.learningRecommendations
            }
            onToggle={() =>
              toggleSetting(
                "learningRecommendations",
              )
            }
          />

        </div>

      </SettingsCard>

      <SettingsCard
        icon={Sparkles}
        title="AI data usage"
        description="Understand what Pathwise may use to personalize your experience."
      >

        <div className="grid gap-4 sm:grid-cols-3">

          <InfoCard
            title="Profile"
            text="Skills, education, experience and career goals."
          />

          <InfoCard
            title="CV"
            text="Your CV may be analyzed for skills and experience."
          />

          <InfoCard
            title="Career activity"
            text="Your activity may improve recommendations."
          />

        </div>

      </SettingsCard>

    </div>
  );
}

/* =========================================================
   PRIVACY
========================================================= */

function PrivacySettings({
  privacy,
  togglePrivacy,
  updatePrivacy,
  onDelete,
}: {
  privacy: PrivacySettingsData;
  togglePrivacy: (
    field: keyof PrivacySettingsData,
  ) => void;
  updatePrivacy: (
    field: keyof PrivacySettingsData,
    value: string,
  ) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-6">

      <SettingsCard
        icon={Shield}
        title="Privacy & security"
        description="Manage your profile visibility and privacy controls."
      >

        <div className="space-y-3">

          <SecurityRow
            icon={KeyRound}
            title="Password"
            description="Change your Pathwise account password."
            action="Change"
            onClick={() =>
              alert(
                "Connect this to your password endpoint.",
              )
            }
          />

          <SecurityRow
            icon={Shield}
            title="Two-factor authentication"
            description="Add another layer of security to your account."
            action="Manage"
            onClick={() =>
              alert(
                "Connect this to your MFA endpoint.",
              )
            }
          />

        </div>

      </SettingsCard>

      <SettingsCard
        icon={Eye}
        title="Profile visibility"
        description="Choose who can discover your professional profile."
      >

        <div className="space-y-3">

          <VisibilityOption
            title="Private"
            description="Only you can view your full profile."
            active={
              privacy.profileVisibility ===
              "Private"
            }
            onClick={() =>
              updatePrivacy(
                "profileVisibility",
                "Private",
              )
            }
          />

          <VisibilityOption
            title="Recruiter discoverable"
            description="Allow recruiters to discover your profile."
            active={
              privacy.profileVisibility ===
              "Recruiter discoverable"
            }
            onClick={() =>
              updatePrivacy(
                "profileVisibility",
                "Recruiter discoverable",
              )
            }
          />

          <VisibilityOption
            title="Public"
            description="Allow your profile to be publicly discoverable."
            active={
              privacy.profileVisibility ===
              "Public"
            }
            onClick={() =>
              updatePrivacy(
                "profileVisibility",
                "Public",
              )
            }
          />

        </div>

      </SettingsCard>

      <SettingsCard
        icon={Eye}
        title="Information visibility"
        description="Control what information can be displayed on your discoverable profile."
      >

        <div className="divide-y divide-[#edf1ed]">

          <ToggleRow
            title="Show email"
            description="Display your email on your discoverable profile."
            enabled={privacy.showEmail}
            onToggle={() =>
              togglePrivacy("showEmail")
            }
          />

          <ToggleRow
            title="Show phone number"
            description="Display your phone number on your profile."
            enabled={privacy.showPhone}
            onToggle={() =>
              togglePrivacy("showPhone")
            }
          />

          <ToggleRow
            title="Recruiter discovery"
            description="Allow recruiters to find your profile."
            enabled={
              privacy.recruiterDiscovery
            }
            onToggle={() =>
              togglePrivacy(
                "recruiterDiscovery",
              )
            }
          />

          <ToggleRow
            title="Usage analytics"
            description="Allow anonymous analytics to improve Pathwise."
            enabled={privacy.analytics}
            onToggle={() =>
              togglePrivacy("analytics")
            }
          />

        </div>

      </SettingsCard>

      {/* DANGER ZONE */}

      <section className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

          <div className="flex flex-1 items-start gap-3">

            <div className="rounded-xl bg-red-50 p-2.5">
              <Trash2 className="h-4 w-4 text-red-600" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-red-700">
                Delete account
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">
                Permanently delete your Pathwise
                account and associated data.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Delete account
          </button>

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#dce9e3] bg-white shadow-sm">

      <div className="border-b border-[#edf1ed] px-5 py-5 sm:px-6">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <Icon className="h-4.5 w-4.5 text-[#0f6b4f]" />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#103d2e]">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
              {description}
            </p>
          </div>

        </div>

      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>

    </section>
  );
}

function SettingsNavItem({
  icon: Icon,
  label,
  description,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
        active
          ? "bg-[#103d2e] text-white shadow-sm"
          : "text-gray-600 hover:bg-emerald-50 hover:text-[#103d2e]"
      }`}
    >

      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          active
            ? "bg-white/10"
            : "bg-emerald-50 group-hover:bg-emerald-100"
        }`}
      >
        <Icon
          className={`h-4 w-4 ${
            active
              ? "text-[#19d38f]"
              : "text-[#0f6b4f]"
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">

        <p
          className={`truncate text-sm font-semibold ${
            active
              ? "text-white"
              : "text-gray-700 group-hover:text-[#103d2e]"
          }`}
        >
          {label}
        </p>

        <p
          className={`mt-0.5 truncate text-[11px] ${
            active
              ? "text-emerald-100/70"
              : "text-gray-400"
          }`}
        >
          {description}
        </p>

      </div>

      <ChevronRight
        className={`h-3.5 w-3.5 shrink-0 ${
          active
            ? "text-[#19d38f]"
            : "text-gray-300"
        }`}
      />

    </button>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-[#103d2e]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-[#dfe7df] bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-300 focus:border-[#19d38f] focus:ring-4 focus:ring-emerald-50"
      />

    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-[#103d2e]">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-[#dfe7df] bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#19d38f] focus:ring-4 focus:ring-emerald-50"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4">

      <div className="flex-1">

        <p className="text-sm font-semibold text-[#103d2e]">
          {title}
        </p>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-500">
          {description}
        </p>

      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-[#19d38f]"
            : "bg-gray-300"
        }`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
}

function ThemeOption({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-[#19d38f] bg-emerald-50 shadow-sm"
          : "border-[#e2e8e2] bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
      }`}
    >

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          active
            ? "bg-[#103d2e]"
            : "bg-emerald-50"
        }`}
      >
        <Icon
          className={`h-4 w-4 ${
            active
              ? "text-[#19d38f]"
              : "text-[#0f6b4f]"
          }`}
        />
      </div>

      <p className="mt-3 text-sm font-bold text-[#103d2e]">
        {title}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>

      {active && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#0f6b4f]">
          <Check className="h-3.5 w-3.5" />
          Selected
        </div>
      )}

    </button>
  );
}

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#edf1ed] bg-[#fafcf9] p-4">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
        <Sparkles className="h-3.5 w-3.5 text-[#0f6b4f]" />
      </div>

      <p className="mt-3 text-sm font-semibold text-[#103d2e]">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {text}
      </p>

    </div>
  );
}

function SecurityRow({
  icon: Icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#edf1ed] p-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
        <Icon className="h-4 w-4 text-[#0f6b4f]" />
      </div>

      <div className="flex-1">

        <p className="text-sm font-semibold text-[#103d2e]">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>

      </div>

      <button
        type="button"
        onClick={onClick}
        className="rounded-xl border border-[#dfe7df] px-3 py-2 text-xs font-semibold text-[#103d2e] transition hover:border-emerald-200 hover:bg-emerald-50"
      >
        {action}
      </button>

    </div>
  );
}

function VisibilityOption({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-emerald-300 bg-emerald-50"
          : "border-[#e2e8e2] hover:border-emerald-200 hover:bg-emerald-50/40"
      }`}
    >

      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          active
            ? "border-[#19d38f] bg-[#19d38f]"
            : "border-gray-300 bg-white"
        }`}
      >
        {active && (
          <Check className="h-3 w-3 text-[#103d2e]" />
        )}
      </div>

      <div className="flex-1">

        <p className="text-sm font-semibold text-[#103d2e]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>

      </div>

    </button>
  );
}

function Modal({
  title,
  description,
  icon: Icon,
  danger = false,
  onClose,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  danger?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071c14]/50 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl border border-[#dce9e3] bg-white p-6 shadow-2xl">

        <div className="flex items-start gap-3">

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              danger
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-[#0f6b4f]"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="flex-1">

            <h2 className="text-base font-bold text-[#103d2e]">
              {title}
            </h2>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              {description}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        <div className="mt-6">
          {children}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   SMALL ICON
========================================================= */

function SunIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}
