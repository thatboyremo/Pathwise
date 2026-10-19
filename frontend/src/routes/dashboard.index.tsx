import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import {
  FileText,
  MessageSquare,
  GraduationCap,
  Bot,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Target,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Pathwise" },
      {
        name: "description",
        content:
          "Your AI career command center: CV insights, mock interviews, job matches and coaching.",
      },
      { property: "og:title", content: "Dashboard — Pathwise" },
      {
        property: "og:description",
        content: "Your AI career command center.",
      },
    ],
  }),
  component: DashboardPage,
});

/*
|--------------------------------------------------------------------------
| STATIC TOOL CONTENT
|--------------------------------------------------------------------------
| These are product features, not user-specific data.
|--------------------------------------------------------------------------
*/

const tools = [
  {
    icon: FileText,
    tint: "bg-emerald-950 text-amber-300",
    title: "CV Analyzer",
    desc: "AI breakdown of your resume with ATS scoring and role-specific keyword gap analysis.",
    to: "/dashboard/resume",
  },
  {
    icon: MessageSquare,
    tint: "bg-amber-50 text-amber-600",
    title: "Mock Interview",
    desc: "Adaptive interview drills with real-time feedback on clarity, structure and confidence.",
    to: "/dashboard/interview",
  },
  {
    icon: GraduationCap,
    tint: "bg-emerald-50 text-emerald-800",
    title: "Scholarship Finder",
    desc: "Funding matched to your background, field of study and long-term career goals.",
    to: "/dashboard/scholarships",
  },
  {
    icon: Bot,
    tint: "bg-rose-50 text-rose-600",
    title: "AI Career Advisor",
    desc: "Chat with your personal advisor on career moves, salary negotiation and growth plays.",
    to: "/dashboard/coach",
  },
];

/*
|--------------------------------------------------------------------------
| DASHBOARD API TYPES
|--------------------------------------------------------------------------
*/

type DashboardActivity = {
  id: string | number;
  type: string;
  title: string;
  meta: string;
  time: string;
};

type DashboardData = {
  success: boolean;

  user: {
    username: string;
    email: string;
  };

  profile: {
    first_name?: string;
    last_name?: string;
    headline?: string;
    bio?: string;
    location?: string;
    avatar?: string;

    resume_uploaded?: boolean;
    resume_analyzed?: boolean;
    resume_filename?: string;
  };

  skills: string[];
  experiences: any[];

  stats: {
    resume_score: number;
    applications: number;
    interviews: number;
    career_progress: number;
    avg_interview_score: number;
    avg_application_score: number;
  };

  activities: DashboardActivity[];
};



/*
|--------------------------------------------------------------------------
| DASHBOARD PAGE
|--------------------------------------------------------------------------
*/

function DashboardPage() {
  const [aiMode, setAiMode] = useState(true);

  const [animatedScore, setAnimatedScore] = useState(0);

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loadingStep, setLoadingStep] = useState(0);

  const [aiReady, setAiReady] = useState(false);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [showWelcomePopup, setShowWelcomePopup] =
    useState(false);
  
  useEffect(() => {
    if (!dashboard) return;

    const username = dashboard.user?.username;

    if (!username) return;

    const onboardingKey =
      `Pathwise_cv_onboarding_completed_${username}`;

    const onboardingCompleted =
      localStorage.getItem(onboardingKey) === "true";

    if (
      !onboardingCompleted &&
      dashboard.stats.resume_score <= 0
    ) {
      setShowWelcomePopup(true);
    } else {
      setShowWelcomePopup(false);
    }
  }, [dashboard]);

  const [selectedCV, setSelectedCV] =
    useState<File | null>(null);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  /*
   |--------------------------------------------------------------------------
   | AI LOADING STEPS
   |--------------------------------------------------------------------------
   */

  const aiSteps = [
    "Scanning your CV...",
    "Analyzing your career profile...",
    "Checking market opportunities...",
    "Preparing recommendations...",
  ];

  /*
   |--------------------------------------------------------------------------
   | FETCH DASHBOARD
   |--------------------------------------------------------------------------
   */

  const fetchDashboard = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      }

      const response = await api.get("dashboard/");

      console.log("================================");
      console.log("FULL RESPONSE DATA:", response.data);
      console.log("STATS:", response.data?.stats);
      console.log(
        "STATS KEYS:",
        Object.keys(response.data?.stats || {})
      );

      console.log(
        "INTERVIEWS DIRECT:",
        response.data?.stats?.interviews
      );

      console.log(
        "INTERVIEW COUNT:",
        response.data?.stats?.interview_count
      );
        console.log("INTERVIEWS:", response.data?.stats?.interviews);
        console.log("================================");

        setDashboard(response.data);

        return response.data;

      } catch (error) {
        console.error("Dashboard error:", error);
        return null;

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  /*
   |--------------------------------------------------------------------------
   | AI LOADING ANIMATION
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    let step = 0;

    const interval = setInterval(() => {
      setLoadingStep(step);

      step++;

      if (step >= aiSteps.length) {
        clearInterval(interval);

        setTimeout(() => {
          setAiReady(true);
        }, 800);
      }
    }, 1200);

    const modeTimer = setInterval(() => {
      setAiMode((prev) => !prev);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(modeTimer);
    };
  }, []);

  /*
   |--------------------------------------------------------------------------
   | INITIAL DASHBOARD LOAD
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    fetchDashboard();

    /*
     * Refresh whenever the user returns to the tab/window.
     */

    const refreshOnFocus = () => {
      fetchDashboard();
    };

    window.addEventListener(
      "focus",
      refreshOnFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        refreshOnFocus
      );
    };
  }, []);

  /*
   |--------------------------------------------------------------------------
   | REAL CAREER SCORE ANIMATION
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    if (!dashboard?.stats) {
      setAnimatedScore(0);
      return;
    }

    const targetScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          Number(
            dashboard.stats.career_progress ?? 0
          )
        )
      )
    );

    let current = 0;

    if (targetScore <= 0) {
      setAnimatedScore(0);
      return;
    }

    const timer = setInterval(() => {
      current += 1;

      setAnimatedScore(current);

      if (current >= targetScore) {
        clearInterval(timer);
      }
    }, 20);

    return () => {
      clearInterval(timer);
    };
  }, [
    dashboard?.stats?.career_progress,
  ]);



  /*
   |--------------------------------------------------------------------------
   | DASHBOARD STATS
   |--------------------------------------------------------------------------
   */

    const stats = dashboard?.stats;

    const resumeScore = Number(
      stats?.resume_score ?? 0
    );

    const interviewScore = Number(
      stats?.avg_interview_score ?? 0
    );

    const applicationScore = Number(
      stats?.avg_application_score ?? 0
    );

    const careerProgress = Number(
      stats?.career_progress ?? 0
    );

    const applications = Number(
      stats?.applications ?? 0
    );

    const interviews = Number(
      stats?.interviews ?? 0
    );

  /*
   |--------------------------------------------------------------------------
   | USER PROFILE
   |--------------------------------------------------------------------------
   */

  const profile = dashboard?.profile;

  const firstName =
    profile?.first_name ||
    dashboard?.user?.username ||
    "Career Seeker";

  /*
   |--------------------------------------------------------------------------
   | SCORE BARS
   |--------------------------------------------------------------------------
   */

  const scoreBars = [
    {
      label: "CV",
      pct: Math.min(
        100,
        Math.max(
          0,
          Math.round(resumeScore)
        )
      ),
    },
    {
      label: "Interview",
      pct: Math.min(
        100,
        Math.max(
          0,
          Math.round(interviewScore)
        )
      ),
    },
    {
      label: "Applications",
      pct: Math.min(
        100,
        Math.max(
          0,
          Math.round(applicationScore)
        )
      ),
    },
  ];

  /*
   |--------------------------------------------------------------------------
   | REAL ACTIVITIES
   |--------------------------------------------------------------------------
   */

  const activities =
    dashboard?.activities ?? [];

  /*
   |--------------------------------------------------------------------------
   | DYNAMIC RECOMMENDATIONS
   |--------------------------------------------------------------------------
   |
   | These recommendations are generated from the actual dashboard state.
   | They are not fake user statistics.
   |--------------------------------------------------------------------------
   */

  const recommendations = [];

  if (resumeScore <= 0) {
    recommendations.push({
      title: "Analyze your CV",
      meta:
        "Upload your CV to get an AI-powered resume score and personalized insights.",
      to: "/dashboard/resume",
    });
  } else if (resumeScore < 70) {
    recommendations.push({
      title: "Improve your CV score",
      meta:
        "Your latest CV analysis shows room for improvement. Review the AI suggestions.",
      to: "/dashboard/resume",
    });
  } else {
    recommendations.push({
      title: "Keep your CV optimized",
      meta:
        "Your latest CV score is looking strong. Keep tailoring it to the roles you target.",
      to: "/dashboard/resume",
    });
  }

  if (interviews === 0) {
    recommendations.push({
      title: "Complete your first mock interview",
      meta:
        "Practice your answers and receive AI feedback on your interview performance.",
      to: "/dashboard/interview",
    });
  } else if (interviewScore < 70) {
    recommendations.push({
      title: "Strengthen your interview skills",
      meta:
        "Your interview performance has room to grow. Try another practice session.",
      to: "/dashboard/interview",
    });
  } else {
    recommendations.push({
      title: "Keep practicing interviews",
      meta:
        "Your interview performance is progressing. Continue practicing to stay sharp.",
      to: "/dashboard/interview",
    });
  }

  if (applications === 0) {
    recommendations.push({
      title: "Start applying to jobs",
      meta:
        "Explore jobs matched to your skills and career profile.",
      to: "/jobs",
    });
  } else {
    recommendations.push({
      title: "Explore more opportunities",
      meta:
        `${applications} application${
          applications === 1 ? "" : "s"
        } recorded. Keep building your pipeline.`,
      to: "/jobs",
    });
  }

  /*
   |--------------------------------------------------------------------------
   | REFRESH DASHBOARD
   |--------------------------------------------------------------------------
   */

  const refreshDashboard = async () => {
    await fetchDashboard(true);
  };

  /*
   |--------------------------------------------------------------------------
   | CAREER SCORE LABEL
   |--------------------------------------------------------------------------
   */

  const careerScoreLabel =
    careerProgress >= 85
      ? "Excellent"
      : careerProgress >= 70
        ? "Strong"
        : careerProgress >= 50
          ? "Developing"
          : careerProgress > 0
            ? "Getting started"
            : "Not yet scored";

  /*
   |--------------------------------------------------------------------------
   | EMPTY STATE
   |--------------------------------------------------------------------------
   */

  const hasActivity =
    activities.length > 0;

  return (
    <>
      {/* =========================================================
          PREMIUM CV ONBOARDING POPUP
      ========================================================= */}

      <AnimatePresence>
        {showWelcomePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-xl sm:px-6"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 30,
              }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                relative
                w-full
                max-w-4xl
                overflow-hidden
                rounded-[2rem]
                border
                border-white/10
                bg-[#f8faf9]
                shadow-[0_40px_140px_-30px_rgba(0,0,0,0.65)]
              "
            >
              {/* HEADER */}

              <div className="relative overflow-hidden bg-[#052e22] px-6 py-7 sm:px-9 sm:py-8">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

                <div className="absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-amber-400/5 blur-3xl" />

                <button
                  type="button"
                  onClick={() =>
                    setShowWelcomePopup(false)
                  }
                  className="
                    absolute
                    right-5
                    top-5
                    z-20
                    grid
                    h-9
                    w-9
                    place-items-center
                    rounded-full
                    border
                    border-white/10
                    bg-white/5
                    text-white/70
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                  aria-label="Close"
                >
                  ✕
                </button>

                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="
                        grid
                        h-12
                        w-12
                        place-items-center
                        rounded-2xl
                        bg-emerald-400/10
                        ring-1
                        ring-emerald-300/20
                      "
                    >
                      <Sparkles className="h-6 w-6 text-amber-300" />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                        Pathwise
                      </p>

                      <p className="mt-0.5 text-xs text-white/50">
                        Intelligent CV onboarding
                      </p>
                    </div>
                  </div>

                  <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Turn your CV into your
                    <span className="ml-2 font-['Instrument_Serif',ui-serif,Georgia,serif] italic text-amber-300">
                      career profile.
                    </span>
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-[15px]">
                    Upload your CV once. Pathwise's AI
                    will extract your skills, experience,
                    education and career information and
                    use it to personalize your dashboard.
                  </p>

                  <div className="mt-7 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="
                          grid
                          h-8
                          w-8
                          place-items-center
                          rounded-full
                          bg-amber-300
                          text-xs
                          font-bold
                          text-[#052e22]
                        "
                      >
                        1
                      </div>

                      <span className="text-xs font-medium text-white">
                        Upload
                      </span>
                    </div>

                    <div className="h-px w-8 bg-white/10 sm:w-14" />

                    <div className="flex items-center gap-2">
                      <div
                        className="
                          grid
                          h-8
                          w-8
                          place-items-center
                          rounded-full
                          border
                          border-white/15
                          bg-white/5
                          text-xs
                          font-semibold
                          text-white/40
                        "
                      >
                        2
                      </div>

                      <span className="text-xs text-white/40">
                        Analyze
                      </span>
                    </div>

                    <div className="h-px w-8 bg-white/10 sm:w-14" />

                    <div className="flex items-center gap-2">
                      <div
                        className="
                          grid
                          h-8
                          w-8
                          place-items-center
                          rounded-full
                          border
                          border-white/15
                          bg-white/5
                          text-xs
                          font-semibold
                          text-white/40
                        "
                      >
                        3
                      </div>

                      <span className="text-xs text-white/40">
                        Profile
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT */}

              <div className="p-5 sm:p-8">
                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[1.5rem]
                    border
                    border-emerald-900/10
                    bg-white
                    shadow-sm
                  "
                >
                  <div className="h-1 w-full bg-linear-to-r from-emerald-950 via-emerald-600 to-amber-300" />

                  <div className="p-5 sm:p-7">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">
                          Upload your CV
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                          We'll use this document to build
                          your career profile.
                        </p>
                      </div>

                      <div
                        className="
                          hidden
                          rounded-full
                          bg-emerald-50
                          px-3
                          py-1.5
                          text-[11px]
                          font-semibold
                          text-emerald-700
                          sm:block
                        "
                      >
                        Secure upload
                      </div>
                    </div>

                    <label
                      htmlFor="Pathwise-cv-upload"
                      className={`
                        group
                        relative
                        flex
                        min-h-62.5
                        cursor-pointer
                        flex-col
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-2xl
                        border-2
                        border-dashed
                        px-6
                        py-10
                        text-center
                        transition-all
                        ${
                          selectedCV
                            ? "border-emerald-500 bg-emerald-50/50"
                            : "border-neutral-200 bg-neutral-50/70 hover:border-emerald-400 hover:bg-emerald-50/40"
                        }
                      `}
                    >
                      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-100/50 blur-3xl transition group-hover:bg-emerald-200/50" />

                      <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-amber-100/30 blur-3xl" />

                      <motion.div
                        animate={
                          selectedCV
                            ? { scale: 1 }
                            : {
                                y: [0, -5, 0],
                              }
                        }
                        transition={{
                          duration: 2,
                          repeat: selectedCV
                            ? 0
                            : Infinity,
                          ease: "easeInOut",
                        }}
                        className={`
                          relative
                          grid
                          h-16
                          w-16
                          place-items-center
                          rounded-2xl
                          shadow-lg
                          ${
                            selectedCV
                              ? "bg-emerald-600 text-white"
                              : "bg-[#052e22] text-amber-300"
                          }
                        `}
                      >
                        {selectedCV ? (
                          <CheckCircle2 className="h-7 w-7" />
                        ) : (
                          <FileText className="h-7 w-7" />
                        )}
                      </motion.div>

                      <h4 className="relative mt-5 text-base font-semibold text-neutral-900 sm:text-lg">
                        {selectedCV
                          ? "CV ready for analysis"
                          : "Drop your CV here"}
                      </h4>

                      <p className="relative mt-2 max-w-md text-sm leading-6 text-neutral-500">
                        {selectedCV
                          ? selectedCV.name
                          : "Drag and drop your document here, or choose a file from your device."}
                      </p>

                      <span
                        className={`
                          relative
                          mt-5
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          shadow-sm
                          transition-all
                          ${
                            selectedCV
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-[#052e22] text-white group-hover:-translate-y-0.5 group-hover:bg-emerald-800"
                          }
                        `}
                      >
                        <FileText className="h-4 w-4" />

                        {selectedCV
                          ? "Choose another CV"
                          : "Choose CV"}
                      </span>

                      <p className="relative mt-4 text-[11px] text-neutral-400">
                        PDF, DOC or DOCX · Maximum 10MB
                      </p>

                      <input
                        id="Pathwise-cv-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file =
                            e.target.files?.[0];

                          if (!file) return;

                          const allowedTypes = [
                            "application/pdf",
                            "application/msword",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                          ];

                          const isValidType =
                            allowedTypes.includes(
                              file.type
                            ) ||
                            /\.(pdf|doc|docx)$/i.test(
                              file.name
                            );

                          if (!isValidType) {
                            alert(
                              "Please upload a PDF, DOC, or DOCX file."
                            );

                            e.target.value = "";

                            return;
                          }

                          if (
                            file.size >
                            10 * 1024 * 1024
                          ) {
                            alert(
                              "Your CV is too large. Maximum file size is 10MB."
                            );

                            e.target.value = "";

                            return;
                          }

                          setSelectedCV(file);
                        }}
                      />
                    </label>

                    <AnimatePresence>
                      {selectedCV && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                            y: 10,
                          }}
                          className="
                            mt-4
                            overflow-hidden
                            rounded-2xl
                            border
                            border-emerald-100
                            bg-emerald-50/50
                          "
                        >
                          <div className="flex items-center justify-between gap-4 p-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className="
                                  grid
                                  h-11
                                  w-11
                                  shrink-0
                                  place-items-center
                                  rounded-xl
                                  bg-white
                                  text-emerald-700
                                  shadow-sm
                                "
                              >
                                <FileText className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-neutral-900">
                                  {selectedCV.name}
                                </p>

                                <p className="mt-0.5 text-xs text-neutral-500">
                                  {(
                                    selectedCV.size /
                                    1024 /
                                    1024
                                  ).toFixed(2)}{" "}
                                  MB
                                  <span className="mx-1.5">
                                    •
                                  </span>
                                  Ready to analyze
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCV(null)
                              }
                              className="
                                shrink-0
                                rounded-lg
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-red-500
                                transition
                                hover:bg-red-50
                                hover:text-red-700
                              "
                            >
                              Remove
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* AI FEATURES */}

                    <div className="mt-6">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        What Pathwise will do
                      </p>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div
                          className="
                            rounded-2xl
                            border
                            border-neutral-100
                            bg-neutral-50/70
                            p-4
                          "
                        >
                          <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                            <FileText className="h-4 w-4" />
                          </div>

                          <p className="text-sm font-semibold text-neutral-900">
                            Analyze your CV
                          </p>

                          <p className="mt-1 text-xs leading-5 text-neutral-500">
                            Extract your skills,
                            experience, education and
                            achievements.
                          </p>
                        </div>

                        <div
                          className="
                            rounded-2xl
                            border
                            border-neutral-100
                            bg-neutral-50/70
                            p-4
                          "
                        >
                          <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700">
                            <Target className="h-4 w-4" />
                          </div>

                          <p className="text-sm font-semibold text-neutral-900">
                            Identify strengths
                          </p>

                          <p className="mt-1 text-xs leading-5 text-neutral-500">
                            Find your strongest career
                            signals and areas to improve.
                          </p>
                        </div>

                        <div
                          className="
                            rounded-2xl
                            border
                            border-neutral-100
                            bg-neutral-50/70
                            p-4
                          "
                        >
                          <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                            <Sparkles className="h-4 w-4" />
                          </div>

                          <p className="text-sm font-semibold text-neutral-900">
                            Build your profile
                          </p>

                          <p className="mt-1 text-xs leading-5 text-neutral-500">
                            Automatically personalize
                            your career dashboard and
                            recommendations.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ANALYZE BUTTON */}

                    <AnimatePresence>
                      {selectedCV && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: 10,
                          }}
                          className="mt-6"
                        >
                          <button
                            type="button"
                            disabled={isAnalyzing}
                            onClick={async () => {
                              if (!selectedCV) return;

                              try {
                                setIsAnalyzing(true);

                                const formData =
                                  new FormData();

                                formData.append(
                                  "cv",
                                  selectedCV
                                );

                                const response =
                                  await api.post(
                                    "analyze-cv/",
                                    formData,
                                    {
                                      headers: {
                                        "Content-Type":
                                          "multipart/form-data",
                                      },
                                    }
                                  );

                                console.log(
                                  "CV ANALYSIS SUCCESS:",
                                  response.data
                                );

                                localStorage.setItem(
                                  `Pathwise_cv_onboarding_completed_${dashboard?.user?.username}`,
                                  "true"
                                );
                                setShowWelcomePopup(
                                  false
                                );

                                setSelectedCV(null);

                                /*
                                 * Immediately reload the
                                 * dashboard so the new
                                 * resume score appears.
                                 */

                                await fetchDashboard();
                              } catch (error: any) {
                                console.error(
                                  "CV ANALYSIS ERROR:",
                                  error
                                );

                                const backendMessage =
                                  error?.response?.data
                                    ?.error ||
                                  error?.response?.data
                                    ?.detail ||
                                  error?.message ||
                                  "We could not analyze your CV. Please try again.";

                                alert(
                                  backendMessage
                                );
                              } finally {
                                setIsAnalyzing(false);
                              }
                            }}
                            className="
                              group
                              flex
                              w-full
                              items-center
                              justify-center
                              gap-3
                              rounded-2xl
                              bg-[#052e22]
                              px-6
                              py-4
                              text-sm
                              font-semibold
                              text-white
                              shadow-[0_12px_30px_-10px_rgba(5,46,34,0.55)]
                              transition-all
                              hover:-translate-y-0.5
                              hover:bg-emerald-800
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                            "
                          >
                            {isAnalyzing ? (
                              <>
                                <div
                                  className="
                                    grid
                                    h-8
                                    w-8
                                    place-items-center
                                    rounded-xl
                                    bg-white/10
                                  "
                                >
                                  <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                                </div>

                                <span>
                                  AI is analyzing your CV...
                                </span>
                              </>
                            ) : (
                              <>
                                <div
                                  className="
                                    grid
                                    h-8
                                    w-8
                                    place-items-center
                                    rounded-xl
                                    bg-white/10
                                  "
                                >
                                  <Sparkles className="h-4 w-4 text-amber-300" />
                                </div>

                                <span>
                                  Analyze My CV & Build My
                                  Profile
                                </span>

                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </button>

                          <p className="mt-3 text-center text-[11px] text-neutral-400">
                            Pathwise's AI will extract
                            your skills, experience and
                            achievements to personalize
                            your career profile.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>

                    <span>
                      Your CV is processed securely.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowWelcomePopup(false)
                    }
                    className="
                      rounded-xl
                      px-4
                      py-2
                      text-xs
                      font-medium
                      text-neutral-500
                      transition
                      hover:bg-neutral-100
                      hover:text-neutral-800
                    "
                  >
                    I'll do this later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          DASHBOARD
      ========================================================= */}

      <div className="w-full space-y-8">
        {/* =========================================================
            HERO
        ========================================================= */}

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* HERO CARD */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
              background: aiMode
                ? `
                  linear-gradient(
                    135deg,
                    #022c22 0%,
                    #065f46 45%,
                    #047857 100%
                  )
                `
                : `
                  linear-gradient(
                    135deg,
                    #ffffff 0%,
                    #ecfdf5 50%,
                    #d1fae5 100%
                  )
                `,
            }}
            transition={{
              duration: 3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden rounded-3xl border border-emerald-900/10 p-10 shadow-[0_30px_80px_-30px_rgba(6,60,40,0.6)]"
          >
            <motion.div
              animate={{
                x: aiMode ? 20 : -20,
                y: aiMode ? -20 : 20,
                scale: aiMode ? 1.15 : 0.9,
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="
                absolute
                -right-24
                -top-24
                h-72
                w-72
                rounded-full
                bg-emerald-400/20
                blur-3xl
              "
            />

            <motion.div
              animate={{
                x: aiMode ? -20 : 20,
                scale: aiMode ? 1 : 1.2,
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="
                absolute
                -bottom-32
                -left-10
                h-80
                w-80
                rounded-full
                bg-amber-300/10
                blur-3xl
              "
            />

            <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

            {/* BADGES */}

            <div className="relative flex flex-wrap gap-3 text-xs">
              {aiMode ? (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-medium text-emerald-100">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
                    AI Career Intelligence Active
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-medium text-emerald-100">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    {aiReady
                      ? "Your AI coach is ready"
                      : aiSteps[
                          loadingStep
                        ] || "Preparing your dashboard..."}
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 font-medium text-emerald-800">
                    <Target className="h-3.5 w-3.5" />
                    Career Dashboard
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 font-medium text-amber-700">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Tracking your progress
                  </span>
                </>
              )}
            </div>

            {/* TITLE */}

            <motion.h1
              animate={{
                color: aiMode
                  ? "#ffffff"
                  : "#064e3b",
              }}
              transition={{
                duration: 2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
            >
              <AnimatePresence mode="wait">
                {aiMode ? (
                  <motion.div
                    key="ai"
                    initial={{
                      opacity: 0,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                    }}
                    transition={{
                      duration: 0.6,
                    }}
                  >
                    Welcome back,{" "}
                    {firstName}.

                    <span className="mt-2 block font-['Instrument_Serif',ui-serif,Georgia,serif] text-5xl italic text-white sm:text-6xl">
                      Let's land your dream role.
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="career-mode"
                    initial={{
                      opacity: 0,
                      y: 25,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      filter: "blur(8px)",
                    }}
                    transition={{
                      duration: 1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    Your career journey is moving

                    <span className="mt-2 block font-['Instrument_Serif',ui-serif,Georgia,serif] text-5xl italic text-emerald-900 sm:text-6xl">
                      Smarter decisions. Better
                      opportunities.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.h1>

            {/* DESCRIPTION */}

            <motion.p
              animate={{
                color: aiMode
                  ? "#d1fae5"
                  : "#525252",
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="relative mt-5 max-w-xl text-[15px] leading-relaxed"
            >
              {aiMode
                ? "Your AI career coach is analyzing your CV, matching your skills with market opportunities, and preparing personalized recommendations to accelerate your career growth."
                : "Pathwise helps you understand your strengths, improve your professional profile, and discover smarter pathways toward your next career opportunity."}
            </motion.p>

            {/* BUTTONS */}

            <div className="relative mt-8 flex flex-wrap gap-4">
              <Link
                to="/dashboard/coach"
                className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-500 ${
                  aiMode
                    ? "bg-amber-300 text-emerald-950 shadow-amber-300/20 hover:-translate-y-1 hover:bg-amber-200"
                    : "bg-emerald-950 text-white shadow-emerald-900/20 hover:-translate-y-1 hover:bg-emerald-900"
                }`}
              >
                <Bot className="h-4 w-4" />

                {aiMode
                  ? "Talk to AI Career Coach"
                  : "Get Personalized Guidance"}

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/jobs"
                className={`group inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-all duration-500 ${
                  aiMode
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                    : "border-emerald-900/20 bg-white text-emerald-900 hover:bg-emerald-50"
                }`}
              >
                <Briefcase className="h-4 w-4" />

                Explore Matching Jobs

                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>

          {/* SCORE CARD */}

          <motion.div
            animate={{
              background: aiMode
                ? "linear-gradient(145deg, #022c22, #065f46)"
                : "linear-gradient(145deg, #ffffff, #ecfdf5)",
              borderColor: aiMode
                ? "rgba(255,255,255,0.15)"
                : "rgba(6,78,59,0.1)",
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
            }}
            className="rounded-3xl border p-7 shadow-[0_20px_60px_-30px_rgba(6,60,40,0.25)]"
          >
            <div className="flex items-center justify-between">
              <motion.h3
                animate={{
                  color: aiMode
                    ? "#d1fae5"
                    : "#737373",
                }}
                className="text-sm font-semibold tracking-tight"
              >
                Career Readiness Score
              </motion.h3>

              <motion.div
                animate={{
                  color: aiMode
                    ? "#fcd34d"
                    : "#047857",
                }}
              >
                <Target className="h-4 w-4" />
              </motion.div>
            </div>

            <div className="mt-6 flex items-center gap-6">
              {/* CIRCULAR SCORE */}

              <motion.div
                animate={{
                  background: aiMode
                    ? `conic-gradient(#fbbf24 ${
                        animatedScore * 3.6
                      }deg, #064e3b 0deg)`
                    : `conic-gradient(#047857 ${
                        animatedScore * 3.6
                      }deg, #eef2ea 0deg)`,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="relative grid h-32 w-32 place-items-center rounded-full"
              >
                <motion.div
                  animate={{
                    backgroundColor:
                      aiMode
                        ? "#022c22"
                        : "#ffffff",
                  }}
                  className="grid h-24 w-24 place-items-center rounded-full"
                >
                  <motion.span
                    animate={{
                      color: aiMode
                        ? "#ffffff"
                        : "#064e3b",
                    }}
                    className="text-3xl font-bold tracking-tight"
                  >
                    {loading
                      ? "—"
                      : animatedScore}
                  </motion.span>
                </motion.div>
              </motion.div>

              <div>
                <motion.p
                  animate={{
                    color: aiMode
                      ? "#ffffff"
                      : "#171717",
                  }}
                  className="text-sm font-semibold"
                >
                  {loading
                    ? "Loading your score..."
                    : careerScoreLabel}
                </motion.p>

                <motion.p
                  animate={{
                    color: aiMode
                      ? "#fcd34d"
                      : "#047857",
                  }}
                  className="mt-1 text-xs"
                >
                  {loading
                    ? "Calculating..."
                    : `${Math.round(
                        careerProgress
                      )}% career readiness`}
                </motion.p>

                <motion.p
                  animate={{
                    color: aiMode
                      ? "#d1fae5"
                      : "#737373",
                  }}
                  className="mt-3 max-w-40 text-xs leading-relaxed"
                >
                  {loading
                    ? "We're loading your latest career data."
                    : careerProgress > 0
                      ? "Your score is calculated from your latest CV, interview and application performance."
                      : "Complete career activities to start building your readiness score."}
                </motion.p>
              </div>
            </div>

            {/* SCORE BARS */}

            <div className="mt-6 space-y-3">
              {scoreBars.map((bar, i) => (
                <div key={bar.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <motion.span
                      animate={{
                        color: aiMode
                          ? "#d1fae5"
                          : "#525252",
                      }}
                      className="font-medium"
                    >
                      {bar.label}
                    </motion.span>

                    <motion.span
                      animate={{
                        color: aiMode
                          ? "#ffffff"
                          : "#171717",
                      }}
                      className="font-semibold"
                    >
                      {loading
                        ? "—"
                        : `${bar.pct}%`}
                    </motion.span>
                  </div>

                  <div
                    className={`h-1.5 overflow-hidden rounded-full ${
                      aiMode
                        ? "bg-white/10"
                        : "bg-emerald-900/5"
                    }`}
                  >
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: loading
                          ? "0%"
                          : `${bar.pct}%`,
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.2,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full ${
                        aiMode
                          ? "bg-amber-300"
                          : "bg-emerald-700"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* =========================================================
            STATS
        ========================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Resume Score",
              value: loading
                ? "..."
                : `${Math.round(
                    resumeScore
                  )}%`,
              delta: loading
                ? "Loading..."
                : resumeScore > 0
                  ? "Latest analysis"
                  : "No analysis yet",
              icon: FileText,
            },
            {
              label: "Interviews",
              value: loading
                ? "..."
                : interviews,
              delta: loading
                ? "Loading..."
                : "Completed",
              icon: MessageSquare,
            },
            {
              label: "Applications",
              value: loading
                ? "..."
                : applications,
              delta: loading
                ? "Loading..."
                : "Submitted",
              icon: Briefcase,
            },
            {
              label: "Career Progress",
              value: loading
                ? "..."
                : `${Math.round(
                    careerProgress
                  )}%`,
              delta: loading
                ? "Loading..."
                : "Overall growth",
              icon: TrendingUp,
            },
          ].map((stat, i) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: i * 0.1,
                }}
                className="
                  rounded-2xl
                  border
                  border-emerald-900/10
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      grid
                      h-10
                      w-10
                      place-items-center
                      rounded-xl
                      bg-emerald-50
                      text-emerald-800
                    "
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 text-3xl font-bold text-emerald-950">
                  {stat.value}
                </div>

                <div className="mt-1 text-sm text-neutral-500">
                  {stat.label}
                </div>

                <div className="mt-3 text-xs font-medium text-emerald-700">
                  {stat.delta}
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* =========================================================
            TOOLS
        ========================================================= */}

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Your workspace
              </h2>

              <p className="text-sm text-neutral-500">
                Four AI tools tuned to your goals.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="text-sm font-medium text-emerald-800 hover:text-emerald-900"
            >
              Explore all →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool, i) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.title}
                  to={tool.to}
                  className="group"
                >
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.05 * i,
                    }}
                    className="
                      relative
                      h-full
                      overflow-hidden
                      rounded-2xl
                      border
                      border-emerald-900/10
                      bg-white
                      p-6
                      text-left
                      transition
                      hover:-translate-y-1
                      hover:border-emerald-900/20
                      hover:shadow-[0_25px_60px_-30px_rgba(6,60,40,0.35)]
                    "
                  >
                    <div
                      className={`
                        grid
                        h-11
                        w-11
                        place-items-center
                        rounded-xl
                        ${tool.tint}
                      `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 text-base font-semibold tracking-tight">
                      {tool.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                      {tool.desc}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-800">
                      Open
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            CAREER VISUAL SECTION
        ========================================================= */}

        <section className="relative overflow-hidden rounded-[2rem] bg-[#0b3527] shadow-[0_30px_80px_-35px_rgba(6,60,40,0.55)]">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />

          <div className="relative grid min-h-130 items-center gap-10 p-7 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
            {/* LEFT */}

            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
              }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-100">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Career Intelligence
              </div>

              <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Build a career
                <span className="mt-2 block font-['Instrument_Serif',ui-serif,Georgia,serif] italic text-amber-300">
                  worth talking about.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-7 text-emerald-100/75 sm:text-base">
                Pathwise combines your CV, skills,
                interview performance and career goals
                to help you make smarter decisions and
                move closer to your next opportunity.
              </p>

              <div className="mt-8 grid max-w-md gap-3 sm:grid-cols-2">
                {[
                  "AI-powered career guidance",
                  "Personalized job matching",
                  "Interview preparation",
                  "Resume optimization",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-emerald-50"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    </span>

                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/jobs"
                  className="group inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-amber-200"
                >
                  Find Your Next Big Opportunity

                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/dashboard/coach"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Talk to AI Coach
                </Link>
              </div>
            </motion.div>

            {/* RIGHT IMAGE */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                x: 20,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.7,
                delay: 0.1,
              }}
              className="relative min-h-95 lg:min-h-112.5"
            >
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/10 bg-emerald-950">
                <img
                  src="/images/dashboard-career.jpg"
                  alt="AI Career Dashboard"
                  className="h-full w-full rounded-3xl object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-tr from-[#06271d]/80 via-[#0b3527]/20 to-transparent" />
              </div>

              {/* REAL SCORE CARD */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.5,
                }}
                className="absolute -left-4 top-8 w-52 rounded-2xl border border-white/10 bg-white/95 p-4 shadow-2xl backdrop-blur sm:-left-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-950">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-neutral-500">
                        AI Career Score
                      </p>

                      <p className="text-sm font-bold text-neutral-900">
                        {loading
                          ? "Calculating"
                          : careerScoreLabel}
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-bold text-emerald-700">
                    {loading
                      ? "—"
                      : `${Math.round(
                          careerProgress
                        )}%`}
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    whileInView={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          careerProgress
                        )
                      )}%`,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 1,
                    }}
                    className="h-full rounded-full bg-linear-to-r from-emerald-700 to-emerald-400"
                  />
                </div>

                <p className="mt-2 text-[10px] leading-relaxed text-neutral-500">
                  {careerProgress > 0
                    ? "Based on your latest Pathwise activity and performance."
                    : "Complete your profile and career activities to generate your score."}
                </p>
              </motion.div>

              {/* DYNAMIC APPLICATION CARD */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.7,
                }}
                className="absolute -bottom-4 right-4 w-60 rounded-2xl border border-white/10 bg-white p-4 shadow-2xl sm:right-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                      Applications
                    </p>

                    <p className="mt-1 text-sm font-semibold text-neutral-900">
                      Your job pipeline
                    </p>
                  </div>

                  <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                    {loading
                      ? "—"
                      : applications}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-xs text-neutral-500">
                    {applications > 0
                      ? "Applications tracked in Pathwise"
                      : "No applications recorded yet"}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
            CAREER INTELLIGENCE
        ========================================================= */}

        <section className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-white p-10 shadow-[0_20px_60px_-30px_rgba(6,60,40,0.15)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-100 blur-3xl opacity-60" />

          <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-amber-100 blur-3xl opacity-70" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_520px]">
            <div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                AI Career Intelligence
              </span>

              <h2 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-[#0f3d2e]">
                Your next opportunity
                <span className="block text-[#0f3d2e]">
                  starts with smarter decisions.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                Pathwise continuously analyzes your
                resume, interview performance and career
                activity to help you make better decisions
                about your next opportunity.
              </p>

              {/* REAL METRICS */}

              <div className="mt-8 flex flex-wrap gap-6">
                <div>
                  <p className="text-3xl font-bold text-[#0f3d2e]">
                    {loading
                      ? "—"
                      : `${Math.round(
                          resumeScore
                        )}%`}
                  </p>

                  <p className="text-sm text-gray-500">
                    Resume score
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold text-[#0f3d2e]">
                    {loading
                      ? "—"
                      : `${Math.round(
                          interviewScore
                        )}%`}
                  </p>

                  <p className="text-sm text-gray-500">
                    Interview score
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold text-[#0f3d2e]">
                    {loading
                      ? "—"
                      : `${Math.round(
                          careerProgress
                        )}%`}
                  </p>

                  <p className="text-sm text-gray-500">
                    Career readiness
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/jobs"
                  className="rounded-xl bg-[#0f3d2e] px-7 py-3 font-semibold text-white transition hover:bg-[#184f3b]"
                >
                  Explore Opportunities
                </Link>
              </div>
            </div>

            {/* REAL SCORE SUMMARY */}

            <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Career overview
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-emerald-950">
                    Your current progress
                  </h3>
                </div>

                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-950 text-amber-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {[
                  {
                    label: "CV",
                    value: resumeScore,
                  },
                  {
                    label: "Interview",
                    value: interviewScore,
                  },
                  {
                    label: "Applications",
                    value: applicationScore,
                  },
                  {
                    label: "Career readiness",
                    value: careerProgress,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">
                        {item.label}
                      </span>

                      <span className="text-sm font-bold text-emerald-800">
                        {loading
                          ? "—"
                          : `${Math.round(
                              item.value
                            )}%`}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-emerald-900/5">
                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: loading
                            ? "0%"
                            : `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  item.value
                                )
                              )}%`,
                        }}
                        transition={{
                          duration: 1,
                        }}
                        className="h-full rounded-full bg-emerald-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            ACTIVITY + RECOMMENDATIONS
        ========================================================= */}

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* RECENT ACTIVITY */}

          <div className="rounded-3xl border border-emerald-900/10 bg-white p-7">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Recent activity
                </h3>

                <p className="text-sm text-neutral-500">
                  Your latest Pathwise activity.
                </p>
              </div>

              <button
                type="button"
                onClick={refreshDashboard}
                disabled={refreshing}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-emerald-900/10
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-neutral-600
                  transition
                  hover:bg-emerald-50
                  hover:text-emerald-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-6 rounded-2xl border border-emerald-900/5 bg-emerald-50/40 p-6 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-700" />

                <p className="mt-3 text-sm text-neutral-500">
                  Loading your activity...
                </p>
              </div>
            ) : hasActivity ? (
              <ul className="mt-5 divide-y divide-emerald-900/5">
                {activities.map(
                  (activity) => (
                    <li
                      key={activity.id}
                      className="flex items-center gap-4 py-4"
                    >
                      <div
                        className="
                          grid
                          h-11
                          w-11
                          shrink-0
                          place-items-center
                          rounded-xl
                          bg-emerald-50
                          text-emerald-700
                        "
                      >
                        {activity.type ===
                        "resume" ? (
                          <FileText className="h-5 w-5" />
                        ) : activity.type ===
                          "interview" ? (
                          <MessageSquare className="h-5 w-5" />
                        ) : (
                          <Briefcase className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-neutral-900">
                          {activity.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          {activity.meta}
                        </p>
                      </div>

                      <span className="shrink-0 text-[11px] text-neutral-400">
                        {activity.time}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-emerald-900/10 bg-emerald-50/30 p-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <h4 className="mt-4 text-sm font-semibold text-neutral-900">
                  No activity yet
                </h4>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-neutral-500">
                  Analyze your CV, complete a mock
                  interview or apply to a job to start
                  building your Pathwise activity history.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-6">
            {/* RECOMMENDATIONS */}

            <div className="rounded-3xl border border-emerald-900/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold tracking-tight">
                    AI Recommendations
                  </h4>

                  <p className="mt-1 text-xs text-neutral-500">
                    Based on your current progress.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={refreshDashboard}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-emerald-800 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${
                      refreshing
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Refresh
                </button>
              </div>

              <ul className="mt-4 space-y-3">
                {recommendations.map(
                  (recommendation) => (
                    <li
                      key={
                        recommendation.title
                      }
                    >
                      <Link
                        to={
                          recommendation.to
                        }
                        className="group flex gap-3 rounded-xl border border-emerald-900/5 bg-emerald-50/40 p-3 transition hover:border-emerald-900/10 hover:bg-emerald-50"
                      >
                        <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-950 text-amber-300">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-neutral-900">
                            {
                              recommendation.title
                            }
                          </p>

                          <p className="mt-1 text-xs leading-5 text-neutral-500">
                            {
                              recommendation.meta
                            }
                          </p>
                        </div>

                        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-emerald-700" />
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* DYNAMIC CAREER TIP */}

            <div className="rounded-3xl border border-emerald-900/10 bg-linear-to-br from-emerald-950 to-emerald-800 p-6 text-white">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                <Bot className="h-4 w-4" />
                AI Coach
              </div>

              <p className="mt-3 text-sm leading-relaxed text-emerald-50/90">
                {resumeScore <= 0
                  ? "Start by analyzing your CV. Pathwise can use your resume to build a more personalized career profile."
                  : interviewScore <= 0
                    ? "Your next strong move is to complete a mock interview so Pathwise can understand and improve your interview readiness."
                    : applications <= 0
                      ? "Your profile is ready for action. Explore matching jobs and start building your application pipeline."
                      : "Keep building momentum. Continue improving your profile, practicing interviews and applying to relevant opportunities."}
              </p>

              <Link
                to="/dashboard/coach"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                Talk to AI Coach
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* CAREER STATUS */}

            <div className="rounded-3xl border border-emerald-900/10 bg-white p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-700" />

                <h4 className="text-sm font-semibold tracking-tight">
                  Career status
                </h4>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">
                    Overall readiness
                  </span>

                  <span className="text-sm font-bold text-emerald-800">
                    {loading
                      ? "..."
                      : `${Math.round(
                          careerProgress
                        )}%`}
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-900/5">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: loading
                        ? "0%"
                        : `${Math.min(
                            100,
                            Math.max(
                              0,
                              careerProgress
                            )
                          )}%`,
                    }}
                    transition={{
                      duration: 1,
                    }}
                    className="h-full rounded-full bg-emerald-700"
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-neutral-500">
                  {loading
                    ? "Loading your career data..."
                    : careerProgress >= 85
                      ? "Excellent progress. Keep maintaining your momentum."
                      : careerProgress >= 70
                        ? "You're building a strong career profile. Keep improving."
                        : careerProgress >= 50
                          ? "You're making progress. Focus on the recommendations above."
                          : careerProgress > 0
                            ? "You're getting started. Complete more Pathwise activities to strengthen your profile."
                            : "Complete your first Pathwise activity to start tracking your progress."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}