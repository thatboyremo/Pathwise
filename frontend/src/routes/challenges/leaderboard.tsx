import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Crown,
  Loader2,
  Medal,
  Search,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { Navbar } from "../../components/dashboard/Navbar";
import { Sidebar } from "../../components/dashboard/Sidebar";

export const Route = createFileRoute(
  "/challenges/leaderboard",
)({
  component: LeaderboardPage,
});

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  username?: string;
  score: number;
  challenges_completed?: number;
  status?: string;
  is_current_user?: boolean;
}

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
        data?.message ||
        "Unable to load leaderboard.",
    );
  }

  return data;
}

function getInitials(name: string) {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function LeaderboardPage() {
  const [entries, setEntries] = useState<
    LeaderboardEntry[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      setLoading(true);
      setError("");

      /*
       * This endpoint should return the overall
       * career challenge leaderboard.
       */
      const data = await apiFetch(
        "/api/challenges/leaderboard/",
      );

      const leaderboard =
        data?.leaderboard ||
        data?.results ||
        data ||
        [];

      setEntries(
        Array.isArray(leaderboard)
          ? leaderboard
          : [],
      );
    } catch (err) {
      console.error(
        "LEADERBOARD ERROR:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load leaderboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredEntries =
    entries.filter((entry) => {
      const searchValue =
        search.toLowerCase().trim();

      if (!searchValue) return true;

      return (
        entry.name
          ?.toLowerCase()
          .includes(searchValue) ||
        entry.username
          ?.toLowerCase()
          .includes(searchValue)
      );
    });

  const topThree = entries
    .filter((entry) => entry.rank <= 3)
    .sort((a, b) => a.rank - b.rank);

  const currentUser =
    entries.find(
      (entry) => entry.is_current_user,
    );

  const totalXP = entries.reduce(
    (total, entry) =>
      total + (entry.score || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#0b2118]">
      <Navbar title="Challenge Leaderboard" />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1">
          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="border-b border-[#dfe8e1] bg-white">
            <div className="mx-auto max-w-7xl px-6 py-5 lg:px-10">
              <Link
                to="/challenges"
                className="group inline-flex items-center gap-2 text-sm font-bold text-[#69776f] transition hover:text-[#0f7a58]"
              >
                <ArrowLeft
                  size={17}
                  className="transition group-hover:-translate-x-1"
                />
                Back to Challenges
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="relative overflow-hidden rounded-[30px] bg-[#0f3d2e] px-7 py-9 text-white shadow-[0_18px_50px_rgba(15,61,46,0.12)] lg:px-10">
              <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#3c8b6b] opacity-25 blur-3xl" />

              <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#1d6b4f] opacity-30 blur-3xl" />

              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#bfe7d0] ring-1 ring-white/10">
                    <Sparkles size={13} />
                    Career Challenge Rankings
                  </div>

                  <h1 className="mt-5 max-w-2xl text-3xl font-black tracking-tight lg:text-5xl">
                    Challenge Leaderboard
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#c4d8cf] lg:text-base">
                    See how you stack up against other
                    learners, track your progress, and
                    keep pushing your career skills
                    forward.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-32.5 rounded-2xl bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur-sm">
                    <Users
                      size={20}
                      className="text-[#9dd8b9]"
                    />

                    <p className="mt-3 text-2xl font-black">
                      {entries.length}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#b7cec2]">
                      Participants
                    </p>
                  </div>

                  <div className="min-w-32.5 rounded-2xl bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur-sm">
                    <Trophy
                      size={20}
                      className="text-[#9dd8b9]"
                    />

                    <p className="mt-3 text-2xl font-black">
                      {totalXP}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#b7cec2]">
                      Total XP
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                YOUR POSITION
            ===================================================== */}

            {currentUser && (
              <section className="mt-6 rounded-[24px] border border-[#cfe4d6] bg-[#eef8f2] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d8eee1] text-[#0f7252]">
                      <Award size={21} />
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#668076]">
                        Your Position
                      </p>

                      <p className="mt-1 font-black text-[#17382c]">
                        You're ranked #
                        {currentUser.rank}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs font-bold text-[#7c8982]">
                        Score
                      </p>

                      <p className="mt-1 text-lg font-black text-[#0f6d50]">
                        {currentUser.score} XP
                      </p>
                    </div>

                    <div className="h-8 w-px bg-[#cfe1d6]" />

                    <div>
                      <p className="text-xs font-bold text-[#7c8982]">
                        Challenges
                      </p>

                      <p className="mt-1 text-lg font-black text-[#17382c]">
                        {currentUser.challenges_completed ??
                          "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* =====================================================
                TOP 3
            ===================================================== */}

            {!loading &&
              topThree.length > 0 && (
                <section className="mt-8">
                  <div className="mb-5">
                    <h2 className="text-xl font-black text-[#17382c]">
                      Top Performers
                    </h2>

                    <p className="mt-1 text-sm text-[#7a867f]">
                      The learners leading the board.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    {topThree.map((entry) => {
                      const isFirst =
                        entry.rank === 1;

                      return (
                        <div
                          key={entry.user_id}
                          className={`relative overflow-hidden rounded-[26px] border bg-white p-6 shadow-sm ${
                            isFirst
                              ? "border-[#d6e8dc] shadow-[0_12px_35px_rgba(15,61,46,0.08)] md:-translate-y-3"
                              : "border-[#dce8df]"
                          }`}
                        >
                          {isFirst && (
                            <div className="absolute right-4 top-4">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff6d8] text-[#ad8000]">
                                <Crown
                                  size={18}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col items-center text-center">
                            <div
                              className={`flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-black ${
                                entry.rank ===
                                1
                                  ? "bg-[#fff3c9] text-[#a87900]"
                                  : entry.rank ===
                                      2
                                    ? "bg-[#eef1f2] text-[#69767d]"
                                    : "bg-[#f7ebe3] text-[#a36e4b]"
                              }`}
                            >
                              {entry.rank ===
                              1 ? (
                                <Crown
                                  size={28}
                                />
                              ) : (
                                <Medal
                                  size={27}
                                />
                              )}
                            </div>

                            <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#dceee4] text-sm font-black text-[#0f6d50]">
                              {getInitials(
                                entry.name,
                              )}
                            </div>

                            <h3 className="mt-3 font-black text-[#17382c]">
                              {entry.name}
                            </h3>

                            {entry.username && (
                              <p className="mt-1 text-xs text-[#8a958f]">
                                @{entry.username}
                              </p>
                            )}

                            <div className="mt-5 flex items-center gap-2">
                              <Trophy
                                size={16}
                                className="text-[#0f7a58]"
                              />

                              <span className="text-2xl font-black text-[#17382c]">
                                {entry.score}
                              </span>

                              <span className="text-xs font-bold text-[#89948e]">
                                XP
                              </span>
                            </div>

                            <span className="mt-2 rounded-full bg-[#eef5f0] px-3 py-1 text-[11px] font-black text-[#65756c]">
                              #{entry.rank}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

            {/* =====================================================
                LEADERBOARD TABLE
            ===================================================== */}

            <section className="mt-8 overflow-hidden rounded-[28px] border border-[#dce8df] bg-white shadow-sm">
              <div className="border-b border-[#e4ebe6] px-6 py-6 lg:px-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#0f7a58]">
                        <Trophy size={20} />
                      </div>

                      <div>
                        <h2 className="text-xl font-black text-[#17382c]">
                          All Rankings
                        </h2>

                        <p className="mt-1 text-sm text-[#7c8881]">
                          Every participant and their current score.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative w-full md:w-64">
                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#89948e]"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                      placeholder="Search learners..."
                      className="w-full rounded-xl border border-[#dce6df] bg-[#f9fbfa] py-3 pl-10 pr-4 text-sm text-[#17382c] outline-none transition placeholder:text-[#9aa49f] focus:border-[#8bbba1] focus:bg-white focus:ring-4 focus:ring-[#e9f4ed]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="flex min-h-75 flex-col items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf5ee]">
                      <Loader2
                        size={26}
                        className="animate-spin text-[#0f7a58]"
                      />
                    </div>

                    <p className="mt-4 font-black text-[#17382c]">
                      Loading rankings
                    </p>

                    <p className="mt-1 text-sm text-[#87928c]">
                      Getting the latest scores...
                    </p>
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
                    <p className="font-bold text-red-600">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={
                        loadLeaderboard
                      }
                      className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#17382c] shadow-sm ring-1 ring-red-100"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredEntries.length ===
                  0 ? (
                  <div className="flex min-h-70 flex-col items-center justify-center rounded-2xl bg-[#f8faf8] text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf5ee] text-[#0f7a58]">
                      <Users size={24} />
                    </div>

                    <h3 className="mt-4 font-black text-[#17382c]">
                      No learners found
                    </h3>

                    <p className="mt-2 text-sm text-[#87928c]">
                      Try a different search.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-[#e2eae4]">
                    {/* Header */}

                    <div className="hidden grid-cols-[80px_minmax(0,1fr)_150px_130px] gap-4 border-b border-[#e4ebe6] bg-[#f8faf8] px-5 py-3 text-[11px] font-black uppercase tracking-wider text-[#859089] sm:grid">
                      <span>Rank</span>
                      <span>Learner</span>
                      <span>Challenges</span>
                      <span className="text-right">
                        Score
                      </span>
                    </div>

                    {/* Rows */}

                    <div className="divide-y divide-[#e7ede9]">
                      {filteredEntries.map(
                        (
                          entry,
                          index,
                        ) => {
                          const rank =
                            entry.rank ||
                            index + 1;

                          const isCurrentUser =
                            Boolean(
                              entry.is_current_user,
                            );

                          return (
                            <div
                              key={`${entry.user_id}-${index}`}
                              className={`grid gap-4 px-5 py-4 transition sm:grid-cols-[80px_minmax(0,1fr)_150px_130px] sm:items-center ${
                                isCurrentUser
                                  ? "bg-[#eef8f2]"
                                  : "bg-white hover:bg-[#fafcfb]"
                              }`}
                            >
                              {/* Rank */}

                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black ${
                                    rank ===
                                    1
                                      ? "bg-[#fff4ce] text-[#a77b00]"
                                      : rank ===
                                          2
                                        ? "bg-[#eef1f2] text-[#68757c]"
                                        : rank ===
                                            3
                                          ? "bg-[#f7ece4] text-[#a16d4a]"
                                          : "bg-[#f1f5f2] text-[#68766e]"
                                  }`}
                                >
                                  {rank <=
                                  3 ? (
                                    rank ===
                                    1 ? (
                                      <Crown
                                        size={
                                          15
                                        }
                                      />
                                    ) : (
                                      <Medal
                                        size={
                                          15
                                        }
                                      />
                                    )
                                  ) : (
                                    rank
                                  )}
                                </div>

                                <span className="text-xs font-bold text-[#87928c] sm:hidden">
                                  #{rank}
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

                                    {isCurrentUser && (
                                      <span className="rounded-full bg-[#d6eee0] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#0f6d50]">
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

                              {/* Challenges */}

                              <div className="hidden sm:block">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2
                                    size={15}
                                    className="text-[#0f7a58]"
                                  />

                                  <span className="text-sm font-bold text-[#64736b]">
                                    {entry.challenges_completed ??
                                      "—"}
                                  </span>

                                  <span className="text-xs text-[#8b9690]">
                                    completed
                                  </span>
                                </div>
                              </div>

                              {/* Score */}

                              <div className="flex items-center justify-between sm:justify-end">
                                <span className="text-xs font-bold text-[#89948e] sm:hidden">
                                  Score
                                </span>

                                <div className="flex items-center gap-1.5">
                                  <Trophy
                                    size={15}
                                    className="text-[#0f7a58]"
                                  />

                                  <span className="text-base font-black text-[#17382c]">
                                    {
                                      entry.score
                                    }
                                  </span>

                                  <span className="text-xs font-bold text-[#89948e]">
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

            {/* =====================================================
                BOTTOM CTA
            ===================================================== */}

            <section className="mt-7 mb-10 rounded-[26px] border border-[#dce8df] bg-white p-6 shadow-sm lg:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={18}
                      className="text-[#0f7a58]"
                    />

                    <h3 className="font-black text-[#17382c]">
                      Keep building your career
                    </h3>
                  </div>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#748078]">
                    Complete more daily challenges to
                    earn XP, improve your skills, and
                    climb the leaderboard.
                  </p>
                </div>

                <Link
                  to="/challenges"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#0c3024]"
                >
                  Continue Challenges
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}