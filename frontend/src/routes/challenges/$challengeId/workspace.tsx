import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Code2,
  Crown,
  Loader2,
  Medal,
  Send,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import { Navbar } from "../../../components/dashboard/Navbar";
import { Sidebar } from "../../../components/dashboard/Sidebar";

export const Route = createFileRoute(
  "/challenges/$challengeId/workspace",
)({
  component: ChallengeWorkspacePage,
});

/* =========================================================
   TYPES
========================================================= */

interface Challenge {
  id: number;
  title: string;
  description: string;

  category: {
    id: number;
    name: string;
    description: string;
  };

  difficulty: {
    id: number;
    name: string;
    description: string;
    points: number;
    order: number;
  };

  challenge_type: string;

  evaluation_config: {
    evaluation_method?: string;
    criteria?: string[];
    [key: string]: unknown;
  };

  skills: string[];
  target_roles: string[];

  estimated_minutes: number;
  instructions: string[];
  resources: string[];

  is_ai_generated: boolean;
  created_at: string;
}

interface UserChallenge {
  id: number;
  challenge: Challenge;
  assigned_date: string;
  status: string;

  started_at: string | null;
  completed_at: string | null;

  earned_points: number;

  completion_data: Record<string, unknown>;

  evaluation?: EvaluationResult;
  evaluation_result?: EvaluationResult;
  result?: EvaluationResult;
}

interface EvaluationResult {
  validation?: {
    feedback?: string;
    score?: number;
    is_valid?: boolean;
  };

  xp_earned?: number;
  score?: number;

  challenge?: UserChallenge;

  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
}

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  username?: string;
  score: number;
  status?: string;
  is_current_user?: boolean;
}

/* =========================================================
   API
========================================================= */

function getAccessToken() {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
}

async function apiFetch(
  url: string,
  options: RequestInit = {},
) {
  const token = getAccessToken();

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
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
        data?.message ||
        data?.error ||
        "Something went wrong.",
    );
  }

  return data;
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name: string) {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getScore(result: EvaluationResult | null) {
  if (!result) return null;

  return (
    result.score ??
    result.validation?.score ??
    null
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "Completed";

    case "in_progress":
    case "started":
      return "In Progress";

    case "assigned":
      return "Ready to Start";

    default:
      return status
        ? status.replaceAll("_", " ")
        : "Assigned";
  }
}

function getDifficultyClass(name: string) {
  const difficulty = name.toLowerCase();

  if (difficulty.includes("easy") || difficulty.includes("beginner")) {
    return "bg-[#eaf7ef] text-[#0f7252]";
  }

  if (
    difficulty.includes("hard") ||
    difficulty.includes("advanced")
  ) {
    return "bg-[#fff1ee] text-[#b65342]";
  }

  return "bg-[#f3f6f4] text-[#617067]";
}

/* =========================================================
   PAGE
========================================================= */

function ChallengeWorkspacePage() {
  const { challengeId } = Route.useParams();

  const [assignment, setAssignment] =
    useState<UserChallenge | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [starting, setStarting] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [result, setResult] =
    useState<EvaluationResult | null>(null);

  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>([]);

  const [leaderboardLoading, setLeaderboardLoading] =
    useState(false);

  const [leaderboardError, setLeaderboardError] =
    useState("");

  /* =========================================================
     DERIVED STATE
  ========================================================= */

  const challenge =
    assignment?.challenge;

  const isCompleted =
    assignment?.status === "completed";

  const isStarted =
    assignment?.status === "in_progress" ||
    assignment?.status === "started";

  const canWork =
    Boolean(assignment) &&
    !isCompleted &&
    (isStarted || starting);

  const score =
    getScore(result);

  const xpEarned =
    result?.xp_earned ??
    assignment?.earned_points ??
    0;

  const wordCount = useMemo(() => {
    return answer.trim()
      ? answer.trim().split(/\s+/).length
      : 0;
  }, [answer]);

  const hasEvaluation =
    Boolean(result);

  /* =========================================================
     LOAD CHALLENGE
  ========================================================= */

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  async function loadChallenge() {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(
        "/api/challenges/today/",
      );

      const challenges =
        data?.challenges || [];

      const found = challenges.find(
        (item: UserChallenge) =>
          String(item.id) ===
          String(challengeId),
      );

      if (!found) {
        throw new Error(
          "Challenge assignment not found.",
        );
      }

      setAssignment(found);

      /*
       * Restore previous evaluation when available.
       */
      const previousEvaluation =
        found.evaluation ||
        found.evaluation_result ||
        found.result ||
        null;

      if (previousEvaluation) {
        setResult(previousEvaluation);
      }

      /*
       * Completed challenges should show
       * the leaderboard automatically.
       */
      if (found.status === "completed") {
        await loadLeaderboard(
          found.challenge.id,
        );
      }
    } catch (err) {
      console.error(
        "LOAD WORKSPACE ERROR:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load challenge.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     LOAD LEADERBOARD
  ========================================================= */

  async function loadLeaderboard(
    currentChallengeId?: number,
  ) {
    const id =
      currentChallengeId ??
      assignment?.challenge?.id;

    if (!id) return;

    try {
      setLeaderboardLoading(true);
      setLeaderboardError("");

      const data = await apiFetch(
        `/api/challenges/${id}/leaderboard/`,
      );

      const entries =
        data?.leaderboard ||
        data?.results ||
        data ||
        [];

      setLeaderboard(
        Array.isArray(entries)
          ? entries
          : [],
      );
    } catch (err) {
      console.error(
        "LEADERBOARD ERROR:",
        err,
      );

      setLeaderboardError(
        err instanceof Error
          ? err.message
          : "Unable to load leaderboard.",
      );
    } finally {
      setLeaderboardLoading(false);
    }
  }

  /* =========================================================
     START CHALLENGE
  ========================================================= */

  async function handleStartChallenge() {
    if (!assignment || starting || isCompleted) {
      return;
    }

    try {
      setStarting(true);
      setError("");

      const data = await apiFetch(
        `/api/challenges/${assignment.id}/start/`,
        {
          method: "POST",
        },
      );

      const updatedAssignment =
        data?.challenge ||
        data?.assignment ||
        data;

      if (updatedAssignment) {
        setAssignment((current) => ({
          ...current!,
          ...updatedAssignment,
          status:
            updatedAssignment.status ||
            "in_progress",
        }));
      } else {
        setAssignment((current) => ({
          ...current!,
          status: "in_progress",
        }));
      }
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
      setStarting(false);
    }
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit() {
    if (!assignment || submitting) {
      return;
    }

    const trimmedAnswer =
      answer.trim();

    if (!trimmedAnswer) {
      setError(
        "Please enter your answer before submitting.",
      );
      return;
    }

    if (trimmedAnswer.length < 10) {
      setError(
        "Please provide a little more detail in your answer.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      /*
       * Make sure the assignment is started
       * before completion.
       */
      if (!isStarted) {
        await handleStartChallenge();
      }

      const data =
        await apiFetch(
          `/api/challenges/${assignment.id}/complete/`,
          {
            method: "POST",
            body: JSON.stringify({
              answer: trimmedAnswer,
            }),
          },
        );

      /*
       * The backend may return the evaluation
       * directly or nested inside result/evaluation.
       */
      const evaluation =
        data?.evaluation ||
        data?.result ||
        data;

      setResult(evaluation);

      /*
       * Update assignment from backend.
       */
      if (data?.challenge) {
        setAssignment(
          data.challenge,
        );
      } else if (data?.assignment) {
        setAssignment(
          data.assignment,
        );
      } else {
        setAssignment((current) => ({
          ...current!,
          status: "completed",
          completed_at:
            new Date().toISOString(),
          earned_points:
            data?.xp_earned ??
            data?.earned_points ??
            current?.earned_points ??
            0,
        }));
      }

      await loadLeaderboard(
        assignment.challenge.id,
      );

      /*
       * Move the user to the evaluation.
       */
      setTimeout(() => {
        document
          .getElementById("evaluation")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 150);
    } catch (err) {
      console.error(
        "SUBMIT CHALLENGE ERROR:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit challenge.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] text-[#0b2118]">
        <Navbar title="Challenge Workspace" />

        <div className="flex">
          <Sidebar />

          <main className="flex min-h-[calc(100vh-64px)] min-w-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f3ec]">
                <div className="absolute inset-0 rounded-2xl bg-[#19d38f]/10 blur-xl" />

                <Loader2
                  className="relative animate-spin text-[#0f7a58]"
                  size={28}
                />
              </div>

              <div className="text-center">
                <p className="font-black text-[#17382c]">
                  Preparing your workspace
                </p>

                <p className="mt-1 text-sm text-[#728078]">
                  Loading your challenge...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] text-[#0b2118]">
        <Navbar title="Challenge Workspace" />

        <div className="flex">
          <Sidebar />

          <main className="flex min-h-[calc(100vh-64px)] min-w-0 flex-1 items-center justify-center px-6">
            <div className="w-full max-w-md rounded-[28px] border border-red-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,61,46,0.08)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <Target size={28} />
              </div>

              <h2 className="mt-5 text-xl font-black text-[#17382c]">
                Unable to open challenge
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#728078]">
                {error}
              </p>

              <div className="mt-6 flex justify-center">
                <Link
                  to="/challenges"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0c3024]"
                >
                  <ArrowLeft size={16} />
                  Back to Challenges
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!assignment || !challenge) {
    return null;
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f5f8f6] text-[#0b2118]">
      <Navbar title="Challenge Workspace" />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1">
          {/* =================================================
              TOP NAVIGATION
          ================================================= */}

          <div className="border-b border-[#dfe8e1] bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-10">
              <Link
                to="/challenges"
                className="group inline-flex items-center gap-2 text-sm font-bold text-[#64736b] transition hover:text-[#0f7a58]"
              >
                <ArrowLeft
                  size={17}
                  className="transition group-hover:-translate-x-1"
                />
                Back to Challenges
              </Link>

              <div className="hidden items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#8a9790] sm:flex">
                <Code2 size={14} />
                Challenge Workspace
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-10 lg:py-8">
            {/* =================================================
                HERO
            ================================================= */}

            <section className="relative overflow-hidden rounded-[30px] border border-[#d8e6dc] bg-[#0c3024] shadow-[0_20px_60px_rgba(15,61,46,0.12)]">
              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#19d38f]/15 blur-3xl" />

              <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#19d38f]/10 blur-3xl" />

              <div className="relative p-6 sm:p-8 lg:p-10">
                {/* Top badges */}

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#19d38f]/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#8fe7bd]">
                    {challenge.category.name}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] ${getDifficultyClass(
                      challenge.difficulty.name,
                    )}`}
                  >
                    {challenge.difficulty.name}
                  </span>

                  {challenge.is_ai_generated && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black text-[#d8f5e7]">
                      <Sparkles size={13} />
                      AI Generated
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black text-[#d8f5e7]">
                    <Zap size={13} />
                    {challenge.difficulty.points} XP
                  </span>
                </div>

                {/* Title */}

                <div className="mt-6 max-w-4xl">
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[44px] lg:leading-[1.08]">
                    {challenge.title}
                  </h1>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[#c3d8ce] sm:text-base">
                    {challenge.description}
                  </p>
                </div>

                {/* Hero stats */}

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
                    <Clock
                      size={17}
                      className="text-[#8fe7bd]"
                    />

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#8ca99c]">
                        Estimated time
                      </p>

                      <p className="mt-0.5 text-sm font-black text-white">
                        {challenge.estimated_minutes} min
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
                    <Trophy
                      size={17}
                      className="text-[#8fe7bd]"
                    />

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#8ca99c]">
                        Reward
                      </p>

                      <p className="mt-0.5 text-sm font-black text-white">
                        +{challenge.difficulty.points} XP
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
                    <Target
                      size={17}
                      className="text-[#8fe7bd]"
                    />

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#8ca99c]">
                        Status
                      </p>

                      <p className="mt-0.5 text-sm font-black text-white">
                        {getStatusLabel(
                          assignment.status,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress */}

                <div className="mt-8 max-w-xl">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#a9c1b6]">
                      Challenge progress
                    </span>

                    <span className="text-[#d8f5e7]">
                      {isCompleted
                        ? "100%"
                        : isStarted
                          ? "50%"
                          : "0%"}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isCompleted
                          ? "w-full bg-[#19d38f]"
                          : isStarted
                            ? "w-1/2 bg-[#19d38f]"
                            : "w-0"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                <Target
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_330px]">
              {/* =================================================
                  LEFT
              ================================================= */}

              <div className="min-w-0 space-y-7">
                {/* =================================================
                    WORKSPACE
                ================================================= */}

                <section className="overflow-hidden rounded-[28px] border border-[#dce8df] bg-white shadow-[0_10px_35px_rgba(15,61,46,0.05)]">
                  {/* Header */}

                  <div className="border-b border-[#e5ece7] px-6 py-6 lg:px-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf6ef] text-[#0f7a58]">
                          <Code2 size={20} />
                        </div>

                        <div>
                          <h2 className="text-xl font-black text-[#17382c]">
                            Your Workspace
                          </h2>

                          <p className="mt-1 text-sm leading-6 text-[#758179]">
                            Work through the challenge, then submit your response for AI evaluation.
                          </p>
                        </div>
                      </div>

                      {isCompleted && (
                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eaf7ef] px-3.5 py-2 text-xs font-black text-[#0f7252]">
                          <CheckCircle2 size={14} />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 lg:p-8">
                    {/* =================================================
                        INSTRUCTIONS
                    ================================================= */}

                    {challenge.instructions?.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0f7a58]">
                              Step 01
                            </p>

                            <h3 className="mt-1 text-lg font-black text-[#17382c]">
                              Challenge Instructions
                            </h3>
                          </div>

                          <span className="hidden text-xs font-bold text-[#89948e] sm:block">
                            {challenge.instructions.length} steps
                          </span>
                        </div>

                        <div className="mt-5 space-y-3">
                          {challenge.instructions.map(
                            (instruction, index) => (
                              <div
                                key={index}
                                className="group flex gap-4 rounded-2xl border border-[#e7eee9] bg-[#f9fbf9] p-4 transition hover:border-[#cfe2d6] hover:bg-[#f6faf7]"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e4f2e9] text-xs font-black text-[#0f7252]">
                                  {index + 1}
                                </div>

                                <p className="pt-1 text-sm leading-6 text-[#56655d]">
                                  {instruction}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* =================================================
                        START BANNER
                    ================================================= */}

                    {!isStarted &&
                      !isCompleted && (
                        <div className="mt-8 overflow-hidden rounded-[24px] border border-[#cfe4d6] bg-[#eef8f2]">
                          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d8f0e1] text-[#0f7252]">
                                <Target size={20} />
                              </div>

                              <div>
                                <h3 className="font-black text-[#17382c]">
                                  Ready when you are
                                </h3>

                                <p className="mt-1 max-w-xl text-sm leading-6 text-[#627169]">
                                  Start the challenge when you're ready. Your progress will then be marked as in progress.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={
                                handleStartChallenge
                              }
                              disabled={
                                starting
                              }
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#0c3024] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {starting ? (
                                <>
                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />
                                  Starting...
                                </>
                              ) : (
                                <>
                                  Start Challenge
                                  <ArrowRight
                                    size={16}
                                  />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                    {/* =================================================
                        RESPONSE
                    ================================================= */}

                    <div className="mt-9">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0f7a58]">
                            Step 02
                          </p>

                          <label
                            htmlFor="challenge-answer"
                            className="mt-1 block text-lg font-black text-[#17382c]"
                          >
                            Your Response
                          </label>

                          <p className="mt-1 text-sm text-[#7a867f]">
                            Explain your solution clearly and include your reasoning where useful.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-[#89948e]">
                          <span>
                            {wordCount} words
                          </span>

                          <span className="text-[#c4ccc7]">
                            •
                          </span>

                          <span>
                            {answer.length} characters
                          </span>
                        </div>
                      </div>

                      <div className="relative mt-4">
                        <textarea
                          id="challenge-answer"
                          value={answer}
                          onChange={(event) =>
                            setAnswer(
                              event.target
                                .value,
                            )
                          }
                          disabled={
                            !canWork ||
                            submitting ||
                            isCompleted
                          }
                          placeholder={
                            isCompleted
                              ? "This challenge has already been completed."
                              : !isStarted
                                ? "Start the challenge to begin writing your response..."
                                : "Write your solution, explanation, or response here..."
                          }
                          className="min-h-80 w-full resize-y rounded-[24px] border border-[#d9e5dd] bg-[#fbfdfb] p-5 text-sm leading-7 text-[#17382c] outline-none transition placeholder:text-[#a0aaa4] focus:border-[#74ad91] focus:bg-white focus:ring-4 focus:ring-[#e6f3eb] disabled:cursor-not-allowed disabled:bg-[#f4f7f5]"
                        />

                        {!isCompleted &&
                          isStarted && (
                            <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg bg-white/90 px-2.5 py-1.5 text-[10px] font-bold text-[#9aa49e] shadow-sm ring-1 ring-[#e2e9e4]">
                              AI evaluated
                            </div>
                          )}
                      </div>

                      {/* Submit */}

                      {!isCompleted && (
                        <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-[#f8faf8] p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <Sparkles
                              size={17}
                              className="mt-0.5 shrink-0 text-[#0f7a58]"
                            />

                            <p className="max-w-lg text-xs leading-5 text-[#718078]">
                              Remo will evaluate your response against the challenge criteria and award XP based on your performance.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={
                              handleSubmit
                            }
                            disabled={
                              submitting ||
                              !isStarted ||
                              !answer.trim()
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0f3d2e] px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0c3024] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                          >
                            {submitting ? (
                              <>
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                                Evaluating...
                              </>
                            ) : (
                              <>
                                Submit Challenge
                                <Send size={16} />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* =================================================
                    EVALUATION
                ================================================= */}

                {hasEvaluation && (
                  <section
                    id="evaluation"
                    className="scroll-mt-24 overflow-hidden rounded-[28px] border border-[#cfe4d6] bg-white shadow-[0_15px_45px_rgba(15,61,46,0.08)]"
                  >
                    {/* Evaluation header */}

                    <div className="relative overflow-hidden bg-[#0f3d2e] px-6 py-8 text-white sm:px-8">
                      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#19d38f]/15 blur-3xl" />

                      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                            <Sparkles
                              size={28}
                              className="text-[#8fe7bd]"
                            />
                          </div>

                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8fcdb0]">
                              Remo's Evaluation
                            </p>

                            <h2 className="mt-1 text-2xl font-black">
                              Challenge Complete
                            </h2>

                            <p className="mt-1 text-sm text-[#bfd6ca]">
                              Here's how your submission performed.
                            </p>
                          </div>
                        </div>

                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-[#d5eee2]">
                          <CheckCircle2 size={14} />
                          Evaluation complete
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      {/* Score overview */}

                      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
                        {/* Main score */}

                        <div className="relative overflow-hidden rounded-2xl border border-[#cfe4d6] bg-[#eef8f2] p-6">
                          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#19d38f]/10 blur-2xl" />

                          <div className="relative">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6c8377]">
                              Performance Score
                            </p>

                            <div className="mt-3 flex items-end gap-2">
                              <span className="text-5xl font-black tracking-tight text-[#0f3d2e]">
                                {score !== null
                                  ? score
                                  : "—"}
                              </span>

                              {score !== null && (
                                <span className="pb-2 text-sm font-bold text-[#7c8e85]">
                                  / 100
                                </span>
                              )}
                            </div>

                            {score !== null && (
                              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#d7e9dd]">
                                <div
                                  className="h-full rounded-full bg-[#19d38f] transition-all duration-1000"
                                  style={{
                                    width: `${Math.max(
                                      0,
                                      Math.min(
                                        score,
                                        100,
                                      ),
                                    )}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* XP */}

                        <div className="rounded-2xl border border-[#e0e9e3] bg-[#f9fbf9] p-6">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f4eb] text-[#0f7a58]">
                            <Zap size={19} />
                          </div>

                          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#87938c]">
                            XP Earned
                          </p>

                          <p className="mt-1 text-3xl font-black text-[#17382c]">
                            +{xpEarned}
                          </p>

                          <p className="mt-1 text-xs text-[#89948e]">
                            Added to your career progress
                          </p>
                        </div>

                        {/* Status */}

                        <div className="rounded-2xl border border-[#e0e9e3] bg-[#f9fbf9] p-6">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f4eb] text-[#0f7a58]">
                            <CheckCircle2 size={19} />
                          </div>

                          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#87938c]">
                            Status
                          </p>

                          <p className="mt-1 text-xl font-black text-[#17382c]">
                            Completed
                          </p>

                          <p className="mt-1 text-xs text-[#89948e]">
                            Challenge successfully evaluated
                          </p>
                        </div>
                      </div>

                      {/* Feedback */}

                      {(result?.validation?.feedback ||
                        result?.feedback) && (
                        <div className="mt-6 rounded-[24px] border border-[#dce8df] bg-[#fbfdfb] p-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#0f7a58]">
                              <Award size={19} />
                            </div>

                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0f7a58]">
                                AI Feedback
                              </p>

                              <h3 className="mt-0.5 font-black text-[#17382c]">
                                Remo's assessment
                              </h3>
                            </div>
                          </div>

                          <p className="mt-5 text-sm leading-7 text-[#58675f]">
                            {result?.validation
                              ?.feedback ||
                              result?.feedback}
                          </p>
                        </div>
                      )}

                      {/* Strengths */}

                      {result?.strengths &&
                        result.strengths.length >
                          0 && (
                          <div className="mt-6">
                            <h3 className="text-sm font-black text-[#17382c]">
                              What you did well
                            </h3>

                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              {result.strengths.map(
                                (
                                  strength,
                                  index,
                                ) => (
                                  <div
                                    key={
                                      index
                                    }
                                    className="flex gap-3 rounded-2xl bg-[#eef8f2] p-4"
                                  >
                                    <CheckCircle2
                                      size={
                                        17
                                      }
                                      className="mt-0.5 shrink-0 text-[#0f7a58]"
                                    />

                                    <p className="text-sm leading-6 text-[#53655b]">
                                      {
                                        strength
                                      }
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Weaknesses */}

                      {result?.weaknesses &&
                        result.weaknesses.length >
                          0 && (
                          <div className="mt-6">
                            <h3 className="text-sm font-black text-[#17382c]">
                              Areas to improve
                            </h3>

                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              {result.weaknesses.map(
                                (
                                  weakness,
                                  index,
                                ) => (
                                  <div
                                    key={
                                      index
                                    }
                                    className="flex gap-3 rounded-2xl bg-[#fff8f5] p-4"
                                  >
                                    <Target
                                      size={
                                        17
                                      }
                                      className="mt-0.5 shrink-0 text-[#bd6b54]"
                                    />

                                    <p className="text-sm leading-6 text-[#6f625d]">
                                      {
                                        weakness
                                      }
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Next step */}

                      <div className="mt-7 rounded-[24px] border border-[#cfe4d6] bg-[#eef8f2] p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Trophy
                                size={18}
                                className="text-[#0f7a58]"
                              />

                              <h3 className="font-black text-[#17382c]">
                                Keep building your career score
                              </h3>
                            </div>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#627169]">
                              Your challenge performance contributes to your Pathwise progress. Complete more challenges to build evidence of your skills.
                            </p>
                          </div>

                          <Link
                            to="/challenges"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#0c3024]"
                          >
                            More Challenges
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* =================================================
                    LEADERBOARD
                ================================================= */}

                {(hasEvaluation ||
                  isCompleted) && (
                  <section
                    id="leaderboard"
                    className="scroll-mt-24 overflow-hidden rounded-[28px] border border-[#dce8df] bg-white shadow-[0_10px_35px_rgba(15,61,46,0.05)]"
                  >
                    <div className="border-b border-[#e5ece7] px-6 py-6 lg:px-7">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#0f7a58]">
                            <Trophy size={20} />
                          </div>

                          <div>
                            <h2 className="text-xl font-black text-[#17382c]">
                              Challenge Leaderboard
                            </h2>

                            <p className="mt-1 text-sm text-[#7a867f]">
                              See how you compare with other learners.
                            </p>
                          </div>
                        </div>

                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f3f7f4] px-3.5 py-2 text-xs font-bold text-[#64736b]">
                          <Users size={14} />
                          {leaderboard.length}{" "}
                          participants
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      {leaderboardLoading ? (
                        <div className="flex min-h-56 flex-col items-center justify-center">
                          <Loader2
                            size={26}
                            className="animate-spin text-[#0f7a58]"
                          />

                          <p className="mt-3 text-sm font-bold text-[#536159]">
                            Loading leaderboard...
                          </p>
                        </div>
                      ) : leaderboardError ? (
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
                          <p className="text-sm font-bold text-red-600">
                            {leaderboardError}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              loadLeaderboard(
                                challenge.id,
                              )
                            }
                            className="mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#17382c] shadow-sm ring-1 ring-red-100 transition hover:bg-[#fafafa]"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : leaderboard.length ===
                        0 ? (
                        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl bg-[#f8faf8] px-6 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf5ee] text-[#0f7a58]">
                            <Trophy size={24} />
                          </div>

                          <h3 className="mt-4 font-black text-[#17382c]">
                            Leaderboard is warming up
                          </h3>

                          <p className="mt-2 max-w-md text-sm leading-6 text-[#7a867f]">
                            Scores will appear here as learners complete this challenge.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-[#e2eae4]">
                          {/* Header */}

                          <div className="hidden grid-cols-[70px_minmax(0,1fr)_130px_120px] gap-4 border-b border-[#e5ece7] bg-[#f8faf8] px-5 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#849089] sm:grid">
                            <span>Rank</span>
                            <span>Learner</span>
                            <span>Status</span>
                            <span className="text-right">
                              Score
                            </span>
                          </div>

                          <div className="divide-y divide-[#e8eee9]">
                            {leaderboard.map(
                              (
                                entry,
                                index,
                              ) => {
                                const rank =
                                  entry.rank ||
                                  index + 1;

                                const currentUser =
                                  Boolean(
                                    entry.is_current_user,
                                  );

                                return (
                                  <div
                                    key={`${entry.user_id}-${index}`}
                                    className={`grid gap-3 px-5 py-4 transition sm:grid-cols-[70px_minmax(0,1fr)_130px_120px] sm:items-center sm:gap-4 ${
                                      currentUser
                                        ? "bg-[#eef8f2]"
                                        : "bg-white hover:bg-[#fafcfb]"
                                    }`}
                                  >
                                    {/* Rank */}

                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${
                                          rank ===
                                          1
                                            ? "bg-[#fff6d9] text-[#a77b00]"
                                            : rank ===
                                                2
                                              ? "bg-[#f0f2f3] text-[#69757d]"
                                              : rank ===
                                                  3
                                                ? "bg-[#f8eee7] text-[#a16d48]"
                                                : "bg-[#f1f5f2] text-[#68766e]"
                                        }`}
                                      >
                                        {rank <=
                                        3 ? (
                                          rank ===
                                          1 ? (
                                            <Crown
                                              size={
                                                16
                                              }
                                            />
                                          ) : (
                                            <Medal
                                              size={
                                                16
                                              }
                                            />
                                          )
                                        ) : (
                                          rank
                                        )}
                                      </div>

                                      <span className="text-xs font-bold text-[#87928c] sm:hidden">
                                        Rank{" "}
                                        {rank}
                                      </span>
                                    </div>

                                    {/* User */}

                                    <div className="flex min-w-0 items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dceee4] text-xs font-black text-[#0f6d50]">
                                        {getInitials(
                                          entry.name,
                                        )}
                                      </div>

                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="truncate text-sm font-black text-[#17382c]">
                                            {
                                              entry.name
                                            }
                                          </p>

                                          {currentUser && (
                                            <span className="rounded-full bg-[#d7efe1] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#0f6d50]">
                                              You
                                            </span>
                                          )}
                                        </div>

                                        {entry.username && (
                                          <p className="mt-0.5 truncate text-xs text-[#8a958f]">
                                            @
                                            {
                                              entry.username
                                            }
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Status */}

                                    <div className="hidden sm:block">
                                      <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${
                                          entry.status ===
                                          "completed"
                                            ? "bg-[#e8f5ed] text-[#0f7252]"
                                            : "bg-[#f2f4f2] text-[#77827c]"
                                        }`}
                                      >
                                        {entry.status ===
                                        "completed"
                                          ? "Completed"
                                          : "In progress"}
                                      </span>
                                    </div>

                                    {/* Score */}

                                    <div className="flex items-center justify-between sm:justify-end">
                                      <span className="text-xs font-bold text-[#87928c] sm:hidden">
                                        Score
                                      </span>

                                      <div className="flex items-center gap-1.5">
                                        <Trophy
                                          size={14}
                                          className="text-[#0f7a58]"
                                        />

                                        <span className="text-base font-black text-[#17382c]">
                                          {
                                            entry.score
                                          }
                                        </span>

                                        <span className="text-xs font-bold text-[#8a958f]">
                                          XP
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* =================================================
                    FOOTER NAV
                ================================================= */}

                <div className="flex justify-center pb-8">
                  <Link
                    to="/challenges"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d9e4dc] bg-white px-5 py-3 text-sm font-bold text-[#526159] transition hover:border-[#bcd4c6] hover:text-[#0f6d50]"
                  >
                    <ArrowLeft size={16} />
                    Back to Today's Challenges
                  </Link>
                </div>
              </div>

              {/* =================================================
                  RIGHT SIDEBAR
              ================================================= */}

              <aside className="space-y-5">
                {/* =================================================
                    CHALLENGE SNAPSHOT
                ================================================= */}

                <section className="rounded-[24px] border border-[#dce8df] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#0f7a58]">
                      <Target size={19} />
                    </div>

                    <div>
                      <h3 className="font-black text-[#17382c]">
                        Challenge Snapshot
                      </h3>

                      <p className="text-xs text-[#89948e]">
                        What you're working on
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-[#f8faf8] px-4 py-3">
                      <span className="text-xs font-bold text-[#77847c]">
                        Type
                      </span>

                      <span className="text-xs font-black capitalize text-[#17382c]">
                        {challenge.challenge_type?.replaceAll(
                          "_",
                          " ",
                        ) || "Challenge"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-[#f8faf8] px-4 py-3">
                      <span className="text-xs font-bold text-[#77847c]">
                        Difficulty
                      </span>

                      <span className="text-xs font-black text-[#17382c]">
                        {challenge.difficulty.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-[#f8faf8] px-4 py-3">
                      <span className="text-xs font-bold text-[#77847c]">
                        Time
                      </span>

                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#17382c]">
                        <Clock size={13} />
                        {challenge.estimated_minutes} min
                      </span>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    SKILLS
                ================================================= */}

                <section className="rounded-[24px] border border-[#dce8df] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#0f7a58]">
                      <Code2 size={19} />
                    </div>

                    <div>
                      <h3 className="font-black text-[#17382c]">
                        Skills Tested
                      </h3>

                      <p className="text-xs text-[#89948e]">
                        What you're practicing
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {challenge.skills?.length >
                    0 ? (
                      challenge.skills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-[#e1eae4] bg-[#f5f8f6] px-3 py-2 text-xs font-bold text-[#4d6257]"
                          >
                            {skill}
                          </span>
                        ),
                      )
                    ) : (
                      <span className="text-sm text-[#87928c]">
                        General career skills
                      </span>
                    )}
                  </div>
                </section>

                {/* =================================================
                    STATUS
                ================================================= */}

                <section className="rounded-[24px] border border-[#dce8df] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#0f7a58]">
                      <CheckCircle2 size={19} />
                    </div>

                    <div>
                      <h3 className="font-black text-[#17382c]">
                        Your Progress
                      </h3>

                      <p className="text-xs text-[#89948e]">
                        Current challenge status
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#f8faf8] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[#68766e]">
                        Status
                      </span>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-black ${
                          isCompleted
                            ? "bg-[#e5f4eb] text-[#0f7252]"
                            : isStarted
                              ? "bg-[#eaf5ee] text-[#0f7252]"
                              : "bg-[#f1f4f2] text-[#78837d]"
                        }`}
                      >
                        {getStatusLabel(
                          assignment.status,
                        )}
                      </span>
                    </div>

                    <div className="my-4 h-px bg-[#e3ebe5]" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#68766e]">
                        Potential XP
                      </span>

                      <span className="font-black text-[#0f7a58]">
                        {challenge.difficulty.points}
                      </span>
                    </div>

                    {isCompleted && (
                      <>
                        <div className="my-4 h-px bg-[#e3ebe5]" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#68766e]">
                            Earned
                          </span>

                          <span className="font-black text-[#0f7a58]">
                            +{assignment.earned_points}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                {/* =================================================
                    RELEVANT ROLES
                ================================================= */}

                {challenge.target_roles?.length >
                  0 && (
                  <section className="rounded-[24px] border border-[#dce8df] bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#0f7a58]">
                        <Award size={19} />
                      </div>

                      <div>
                        <h3 className="font-black text-[#17382c]">
                          Relevant Roles
                        </h3>

                        <p className="text-xs text-[#89948e]">
                          Career paths this helps
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      {challenge.target_roles.map(
                        (role) => (
                          <div
                            key={role}
                            className="flex items-center gap-2 rounded-xl bg-[#f8faf8] px-3 py-2.5 text-xs font-bold text-[#596960]"
                          >
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0f7a58]" />

                            {role}
                          </div>
                        ),
                      )}
                    </div>
                  </section>
                )}

                {/* =================================================
                    AI NOTE
                ================================================= */}

                <section className="relative overflow-hidden rounded-[24px] border border-[#cfe4d6] bg-[#eef8f2] p-6">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#19d38f]/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Sparkles
                        size={18}
                        className="text-[#0f7a58]"
                      />

                      <h3 className="font-black text-[#17382c]">
                        Powered by Remo
                      </h3>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#64736b]">
                      Your response is reviewed against the challenge criteria so Pathwise can measure your skills and give you useful feedback.
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs font-black text-[#0f7252]">
                      <CheckCircle2 size={14} />
                      Evidence-based progress
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
