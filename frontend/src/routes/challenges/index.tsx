import {
  Award,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  Flame,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import ChallengeCard, {
  type UserChallenge,
} from "../../components/challenges/ChallengeCard";

import { Navbar } from "../../components/dashboard/Navbar";
import { Sidebar } from "../../components/dashboard/Sidebar";

export const Route = createFileRoute("/challenges/")({
  component: ChallengesPage,
});

// =========================================================
// TYPES
// =========================================================

interface DailyChallengesResponse {
  date: string | null;
  count: number;
  challenges: UserChallenge[];
}

interface ChallengeStats {
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  challenges_completed: number;
  last_completed_date: string | null;
  daily_bonus_xp: number;
}

interface PreviousAnswerModalProps {
  assignment: UserChallenge;
  onClose: () => void;
}

// =========================================================
// AUTH TOKEN
// =========================================================

function getAccessToken() {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
}

// =========================================================
// API FETCH
// =========================================================

async function apiFetch(
  url: string,
  options: RequestInit = {},
) {
  const token = getAccessToken();

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `http://127.0.0.1:8000${url}`,
    {
      ...options,
      headers,
    },
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        "Something went wrong.",
    );
  }

  return data;
}

// =========================================================
// PAGE
// =========================================================

function ChallengesPage() {
  const [dailyChallenges, setDailyChallenges] =
    useState<UserChallenge[]>([]);

  const [stats, setStats] =
    useState<ChallengeStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [startingId, setStartingId] =
    useState<number | null>(null);

  const [
    previousAnswer,
    setPreviousAnswer,
  ] = useState<UserChallenge | null>(null);

  const navigate = useNavigate();

  // =======================================================
  // LOAD CHALLENGES
  // =======================================================

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        dailyData,
        statsData,
      ] = await Promise.all([
        apiFetch(
          "/api/challenges/today/",
        ),
        apiFetch(
          "/api/challenges/stats/",
        ),
      ]);

      const daily =
        dailyData as DailyChallengesResponse;

      setDailyChallenges(
        daily.challenges || [],
      );

      setStats(
        statsData as ChallengeStats,
      );
    } catch (err) {
      console.error(
        "LOAD CHALLENGES ERROR:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load challenges.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadChallenges();
  }, []);

  // =======================================================
  // PREVIOUS ANSWER EVENT
  // =======================================================

  useEffect(() => {
    const handleOpenPreviousAnswer = (
      event: Event,
    ) => {
      const customEvent =
        event as CustomEvent<UserChallenge>;

      if (customEvent.detail) {
        setPreviousAnswer(
          customEvent.detail,
        );
      }
    };

    window.addEventListener(
      "open-previous-answer",
      handleOpenPreviousAnswer,
    );

    return () => {
      window.removeEventListener(
        "open-previous-answer",
        handleOpenPreviousAnswer,
      );
    };
  }, []);

  // =======================================================
  // ESCAPE TO CLOSE MODAL
  // =======================================================

  useEffect(() => {
    if (!previousAnswer) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setPreviousAnswer(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [previousAnswer]);

  // =======================================================
  // START / CONTINUE
  // =======================================================

  const handleStart = async (
    assignment: UserChallenge,
  ) => {
    try {
      setStartingId(
        assignment.id,
      );

      setError("");

      if (
        String(assignment.status)
          .trim()
          .toLowerCase() ===
        "assigned"
      ) {
        await apiFetch(
          `/api/challenges/${assignment.id}/start/`,
          {
            method: "POST",
          },
        );
      }

      await navigate({
        to: "/challenges/$challengeId/workspace",
        params: {
          challengeId: String(
            assignment.id,
          ),
        },
      });
    } catch (err) {
      console.error(
        "START CHALLENGE ERROR:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start challenge.",
      );
    } finally {
      setStartingId(null);
    }
  };

  // =======================================================
  // PROGRESS
  // =======================================================

  const completedCount =
    dailyChallenges.filter(
      (item) =>
        String(item.status)
          .trim()
          .toLowerCase() ===
        "completed",
    ).length;

  const totalChallenges =
    dailyChallenges.length;

  const progress =
    totalChallenges > 0
      ? Math.round(
          (completedCount /
            totalChallenges) *
            100,
        )
      : 0;

  const remaining = Math.max(
    totalChallenges -
      completedCount,
    0,
  );

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen w-full bg-[#f6f8f6] text-[#0b2118]">

      {/* ===================================================
          NAVBAR
      =================================================== */}

      <Navbar title="Daily Challenges" />

      {/* ===================================================
          SIDEBAR + MAIN
      =================================================== */}

      <div className="flex w-full">

        <Sidebar />

        <main className="min-w-0 flex-1">

          <div className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden">

            {/* =================================================
                BACKGROUND
            ================================================== */}

            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#dcefe4] opacity-50 blur-3xl" />

            <div className="pointer-events-none absolute left-1/3 top-40 h-64 w-64 rounded-full bg-[#e8f5ee] opacity-40 blur-3xl" />

            <div className="pointer-events-none absolute bottom-20 left-10 h-72 w-72 rounded-full bg-[#eef7f1] opacity-30 blur-3xl" />

            {/* =================================================
                FULL-WIDTH CONTENT
            ================================================== */}

            <div className="relative w-full px-5 py-7 sm:px-7 lg:px-10 xl:px-12 2xl:px-14">

              {/* =================================================
                  HERO
              ================================================== */}

              <section className="relative mb-8 w-full overflow-hidden rounded-3xl border border-[#dce7df] bg-white shadow-[0_20px_60px_-35px_rgba(15,61,46,0.35)]">

                <div className="absolute inset-0 bg-linear-to-br from-[#f8fcf9] via-white to-[#edf7f1]" />

                <div className="relative p-7 sm:p-9 lg:p-10 xl:p-12">

                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                    <div className="max-w-3xl">

                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#cfe5d8] bg-[#eff8f3] px-3.5 py-2 text-xs font-bold text-[#0f6d50]">

                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0f6d50] text-white">
                          <Sparkles className="h-3 w-3" />
                        </span>

                        AI-Powered Career Growth

                      </div>

                      <h1 className="text-3xl font-black tracking-tight text-[#092117] sm:text-4xl lg:text-5xl xl:text-6xl">
                        Today's Challenges
                      </h1>

                      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#68786f] sm:text-base lg:text-[15px]">
                        Turn your career goals into
                        measurable progress. Complete
                        personalized challenges designed
                        around your skills, experience,
                        and target role.
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-3">

                        <div className="inline-flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#0f3d2e]/10">

                          <Target className="h-4 w-4 text-[#f4b740]" />

                          {completedCount} of{" "}
                          {totalChallenges} completed

                        </div>

                        {remaining > 0 && (
                          <span className="text-xs font-medium text-[#7a8981]">
                            {remaining}{" "}
                            {remaining === 1
                              ? "challenge"
                              : "challenges"}{" "}
                            remaining today
                          </span>
                        )}

                      </div>

                    </div>

                    {/* =================================================
                        PROGRESS
                    ================================================== */}

                    <div className="flex shrink-0 items-center justify-center">

                      <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[#edf6f0] lg:h-44 lg:w-44 xl:h-48 xl:w-48">

                        <svg
                          className="absolute inset-0 h-full w-full -rotate-90"
                          viewBox="0 0 120 120"
                        >

                          <circle
                            cx="60"
                            cy="60"
                            r="48"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-[#dbe9df]"
                          />

                          <circle
                            cx="60"
                            cy="60"
                            r="48"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={
                              2 *
                              Math.PI *
                              48
                            }
                            strokeDashoffset={
                              2 *
                              Math.PI *
                              48 *
                              (1 -
                                progress /
                                  100)
                            }
                            className="text-[#0f7a58] transition-all duration-700"
                          />

                        </svg>

                        <div className="relative text-center">

                          <p className="text-4xl font-black tracking-tight text-[#0b2c20] lg:text-5xl">
                            {progress}%
                          </p>

                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#819087]">
                            Daily Progress
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </section>

              {/* =================================================
                  STATS
              ================================================== */}

              <section className="mb-8 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">

                <PremiumStatCard
                  icon={
                    <Target className="h-5 w-5" />
                  }
                  label="Today's Progress"
                  value={`${completedCount}/${totalChallenges}`}
                  helper={`${progress}% complete`}
                />

                <PremiumStatCard
                  icon={
                    <Zap className="h-5 w-5" />
                  }
                  label="Total XP"
                  value={
                    stats
                      ? stats.total_xp.toLocaleString()
                      : "—"
                  }
                  helper="Career XP"
                />

                <PremiumStatCard
                  icon={
                    <Flame className="h-5 w-5" />
                  }
                  label="Current Streak"
                  value={
                    stats
                      ? `${stats.current_streak}`
                      : "—"
                  }
                  helper="days in a row"
                />

                <PremiumStatCard
                  icon={
                    <Trophy className="h-5 w-5" />
                  }
                  label="Challenges Completed"
                  value={
                    stats
                      ? stats.challenges_completed.toLocaleString()
                      : "—"
                  }
                  helper="All time"
                />

              </section>

              {/* =================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">

                    <Target className="h-4 w-4 text-red-600" />

                  </div>

                  <div>

                    <p className="text-sm font-bold text-red-700">
                      Something went wrong
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-600">
                      {error}
                    </p>

                  </div>

                </div>
              )}

              {/* =================================================
                  LOADING
              ================================================== */}

              {loading && (
                <div className="w-full rounded-3xl border border-[#dfe8e1] bg-white px-6 py-20 shadow-[0_15px_40px_-30px_rgba(15,61,46,0.3)]">

                  <div className="flex flex-col items-center">

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf7f1]">

                      <div className="absolute inset-0 animate-ping rounded-2xl bg-[#dff0e6] opacity-50" />

                      <Loader2 className="relative h-7 w-7 animate-spin text-[#0f7a58]" />

                    </div>

                    <h3 className="mt-5 text-sm font-bold text-[#17382c]">
                      Preparing your challenges
                    </h3>

                    <p className="mt-1 text-xs text-[#84918b]">
                      Personalizing today's career
                      development plan...
                    </p>

                  </div>

                </div>
              )}

              {/* =================================================
                  CONTENT
              ================================================== */}

              {!loading && (
                <>

                  {/* =================================================
                      SECTION HEADER
                  ================================================== */}

                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                      <div className="flex items-center gap-2">

                        <h2 className="text-xl font-black tracking-tight text-[#0b281d] sm:text-2xl">
                          Your challenges
                        </h2>

                        <span className="rounded-full bg-[#eaf4ed] px-2.5 py-1 text-[10px] font-extrabold text-[#0f6d50]">
                          {totalChallenges} TODAY
                        </span>

                      </div>

                      <p className="mt-1.5 text-sm text-[#7a8981]">
                        Practical tasks selected to move
                        you closer to your career goals.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={loadChallenges}
                      disabled={loading}
                      className="group inline-flex w-fit items-center gap-2 rounded-xl border border-[#d9e4dc] bg-white px-4 py-2.5 text-xs font-bold text-[#315347] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#bcd5c7] hover:bg-[#f8fbf9] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <RefreshCw
                        className={`h-3.5 w-3.5 transition-transform ${
                          loading
                            ? "animate-spin"
                            : "group-hover:rotate-180"
                        }`}
                      />

                      Refresh challenges

                    </button>

                  </div>

                  {/* =================================================
                      EMPTY
                  ================================================== */}

                  {dailyChallenges.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="grid w-full gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                      {dailyChallenges.map(
                        (
                          assignment,
                          index,
                        ) => (
                          <div
                            key={
                              assignment.id
                            }
                            className="relative min-w-0"
                          >

                            <div className="absolute -left-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-[#d7e7dc] bg-white text-[10px] font-black text-[#0f6d50] shadow-sm">
                              {String(
                                index + 1,
                              ).padStart(
                                2,
                                "0",
                              )}
                            </div>

                            <ChallengeCard
                              assignment={
                                assignment
                              }
                              onStart={
                                handleStart
                              }
                              starting={
                                startingId ===
                                assignment.id
                              }
                            />

                          </div>
                        ),
                      )}

                    </div>
                  )}

                  {/* =================================================
                      LEADERBOARD CTA
                  ================================================== */}

                  {dailyChallenges.length > 0 && (
                    <section className="mt-10 w-full">

                      <div className="relative overflow-hidden rounded-3xl border border-[#cfe1d6] bg-[#0f3d2e] shadow-[0_25px_60px_-35px_rgba(15,61,46,0.8)]">

                        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#2f8064] opacity-30 blur-3xl" />

                        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#1c6049] opacity-40 blur-3xl" />

                        <div className="relative p-7 sm:p-8 lg:p-9 xl:p-10">

                          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

                            <div className="flex items-start gap-4">

                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">

                                <Trophy className="h-6 w-6 text-[#f4b740]" />

                              </div>

                              <div>

                                <div className="flex flex-wrap items-center gap-2">

                                  <p className="text-lg font-black text-white">
                                    See where you rank
                                  </p>

                                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#c9ddd4]">
                                    Career Leaderboard
                                  </span>

                                </div>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#bdd2c8]">
                                  Track your XP, completed
                                  challenges, and position
                                  alongside other learners
                                  building their careers.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-4">

                                  <div className="flex items-center gap-2 text-xs font-semibold text-[#dcebe3]">

                                    <Zap className="h-3.5 w-3.5 text-[#f4b740]" />

                                    {stats?.total_xp ?? 0} XP

                                  </div>

                                  <div className="flex items-center gap-2 text-xs font-semibold text-[#dcebe3]">

                                    <CheckCircle2 className="h-3.5 w-3.5 text-[#8fd4b4]" />

                                    {stats?.challenges_completed ?? 0} completed

                                  </div>

                                  <div className="flex items-center gap-2 text-xs font-semibold text-[#dcebe3]">

                                    <Flame className="h-3.5 w-3.5 text-[#f4b740]" />

                                    {stats?.current_streak ?? 0} day streak

                                  </div>

                                </div>

                              </div>

                            </div>

                            <Link
                              to="/challenges/leaderboard"
                              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#0f3d2e] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#f3f8f5] hover:shadow-xl"
                            >

                              View Leaderboard

                              <ArrowRight
                                size={17}
                                className="transition-transform group-hover:translate-x-1"
                              />

                            </Link>

                          </div>

                        </div>

                      </div>

                    </section>
                  )}

                  {/* =================================================
                      MOTIVATION
                  ================================================== */}

                  {dailyChallenges.length > 0 && (
                    <div className="mt-5 w-full overflow-hidden rounded-2xl border border-[#d8e6dc] bg-white">

                      <div className="relative px-6 py-5 sm:px-8">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf7f1]">

                              <Sparkles className="h-5 w-5 text-[#0f7a58]" />

                            </div>

                            <div>

                              <p className="text-sm font-bold text-[#17382c]">
                                Small progress compounds.
                              </p>

                              <p className="mt-1 text-xs leading-5 text-[#84918b]">
                                Stay consistent with your
                                daily challenges and build
                                the skills your target role
                                demands.
                              </p>

                            </div>

                          </div>

                          <div className="flex shrink-0 items-center gap-2 text-xs font-bold text-[#547066]">

                            <Flame className="h-4 w-4 text-[#d59c25]" />

                            {stats?.current_streak ?? 0} day streak

                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                </>
              )}

            </div>

          </div>

        </main>

      </div>

      {/* =======================================================
          PREVIOUS ANSWER MODAL
      ======================================================= */}

      {previousAnswer && (
        <PreviousAnswerModal
          assignment={previousAnswer}
          onClose={() =>
            setPreviousAnswer(null)
          }
        />
      )}

    </div>
  );
}

// =========================================================
// PREVIOUS ANSWER MODAL
// =========================================================

function PreviousAnswerModal({
  assignment,
  onClose,
}: PreviousAnswerModalProps) {
  const challenge =
    assignment.challenge;

  const completionData =
    assignment.completion_data || {};

  const entries = Object.entries(
    completionData,
  ).filter(
    ([key]) =>
      key !== "daily_bonus_awarded" &&
      key !== "daily_bonus_xp",
  );

  const formatValue = (
    value: unknown,
  ): string => {
    if (
      typeof value === "string"
    ) {
      return value;
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    try {
      return JSON.stringify(
        value,
        null,
        2,
      );
    } catch {
      return String(value);
    }
  };

  const formatLabel = (
    key: string,
  ) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      );
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[#062117]/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-[#dce8df] bg-white shadow-[0_30px_100px_-30px_rgba(0,0,0,0.45)]">

        {/* HEADER */}

        <div className="relative overflow-hidden border-b border-[#e5ece7] bg-[#f8fbf9] px-6 py-6 sm:px-8">

          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#e0f2e7] blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">

            <div className="flex min-w-0 items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf5ee]">

                <Eye className="h-5 w-5 text-[#0f6d50]" />

              </div>

              <div className="min-w-0">

                <div className="mb-1 flex items-center gap-2">

                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0f7a58]">
                    Previous Submission
                  </span>

                  <CheckCircle2
                    size={13}
                    className="text-emerald-500"
                  />

                </div>

                <h2 className="line-clamp-2 text-xl font-black tracking-tight text-[#0b2b20]">
                  {challenge.title}
                </h2>

              </div>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dce6df] bg-white text-[#718078] transition hover:border-[#c7d8cd] hover:bg-[#f5f9f6] hover:text-[#0f3d2e]"
              aria-label="Close"
            >
              ×
            </button>

          </div>

          <div className="relative mt-5 flex flex-wrap gap-2">

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f3d2e] px-3 py-1.5 text-[10px] font-bold text-white">

              <Trophy
                size={12}
                className="text-[#f4b740]"
              />

              {assignment.earned_points} XP earned

            </span>

            <span className="rounded-full border border-[#dce7df] bg-white px-3 py-1.5 text-[10px] font-bold text-[#68786f]">

              {challenge.difficulty?.name}

            </span>

            {assignment.completed_at && (
              <span className="rounded-full border border-[#dce7df] bg-white px-3 py-1.5 text-[10px] font-bold text-[#68786f]">

                Completed{" "}
                {new Date(
                  assignment.completed_at,
                ).toLocaleDateString()}

              </span>
            )}

          </div>

        </div>

        {/* CONTENT */}

        <div className="max-h-[calc(90vh-190px)] overflow-y-auto px-6 py-6 sm:px-8">

          <div className="mb-6 rounded-2xl border border-[#e0e9e3] bg-[#f8fbf9] p-5">

            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#89968f]">
              Challenge
            </p>

            <p className="mt-2 text-sm leading-6 text-[#52675e]">
              {challenge.description}
            </p>

          </div>

          <div>

            <div className="mb-3 flex items-center justify-between">

              <div>

                <p className="text-sm font-black text-[#16372b]">
                  Your submission
                </p>

                <p className="mt-0.5 text-xs text-[#89968f]">
                  This is the answer you submitted
                  for this challenge.
                </p>

              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf7f1]">

                <CheckCircle2
                  size={16}
                  className="text-[#0f7a58]"
                />

              </div>

            </div>

            {entries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#cfded4] bg-[#f9fbfa] px-5 py-8 text-center">

                <p className="text-sm font-bold text-[#536960]">
                  No submission details available.
                </p>

                <p className="mt-1 text-xs text-[#8a9791]">
                  The challenge was marked as completed,
                  but no answer data was stored.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {entries.map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="overflow-hidden rounded-2xl border border-[#dce7df] bg-white"
                    >

                      <div className="border-b border-[#e8eee9] bg-[#f7faf8] px-4 py-3">

                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#6f8178]">
                          {formatLabel(key)}
                        </p>

                      </div>

                      <div className="px-4 py-4">

                        <pre className="whitespace-pre-wrap wrap-break-word font-sans text-sm leading-7 text-[#334e42]">
                          {formatValue(value)}
                        </pre>

                      </div>

                    </div>
                  ),
                )}

              </div>
            )}

          </div>

        </div>

        {/* FOOTER */}

        <div className="border-t border-[#e5ece7] bg-[#fbfcfb] px-6 py-4 sm:px-8">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs text-[#8a9791]">
              Your previous submission is kept as part
              of your challenge history.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl bg-[#0f3d2e] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#0c3024]"
            >
              Done
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

// =========================================================
// PREMIUM STAT CARD
// =========================================================

function PremiumStatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-[#dfe8e1] bg-white p-5 shadow-[0_12px_30px_-25px_rgba(15,61,46,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cddfd3] hover:shadow-[0_18px_35px_-25px_rgba(15,61,46,0.4)]">

      <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-[#edf7f1] transition-transform duration-300 group-hover:scale-125" />

      <div className="relative">

        <div className="flex items-start justify-between">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf6f0] text-[#0f6d50]">
            {icon}
          </div>

        </div>

        <p className="mt-4 truncate text-[11px] font-bold uppercase tracking-wider text-[#87948d]">
          {label}
        </p>

        <div className="mt-1 flex items-end gap-2">

          <p className="text-2xl font-black tracking-tight text-[#0b2b20]">
            {value}
          </p>

        </div>

        <p className="mt-1 text-[11px] font-medium text-[#9aa59f]">
          {helper}
        </p>

      </div>

    </div>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-dashed border-[#cfded4] bg-white px-6 py-20 text-center">

      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e6f4eb] blur-3xl" />

      <div className="relative">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf6f0] ring-8 ring-[#f7faf8]">

          <CalendarDays className="h-7 w-7 text-[#0f6d50]" />

        </div>

        <h3 className="mt-6 text-lg font-black text-[#0c2a1e]">
          Your challenge queue is empty
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7c8b83]">
          We couldn't find any challenges for today.
          Refresh the page or generate a new
          personalized challenge set.
        </p>

      </div>

    </div>
  );
}