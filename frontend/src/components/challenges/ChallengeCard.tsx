import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Sparkles,
  Trophy,
} from "lucide-react";

export interface UserChallenge {
  id: number;

  challenge: {
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
  };

  assigned_date: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  earned_points: number;
  completion_data: Record<string, unknown>;
}

interface ChallengeCardProps {
  assignment: UserChallenge;
  onStart: (assignment: UserChallenge) => void;
  starting?: boolean;
}

export default function ChallengeCard({
  assignment,
  onStart,
  starting = false,
}: ChallengeCardProps) {
  const challenge = assignment.challenge;

  // =========================================================
  // NORMALIZE STATUS
  // =========================================================

  const status = String(
    assignment.status || "",
  )
    .trim()
    .toLowerCase();

  const isAssigned =
    status === "assigned";

  const isInProgress =
    status === "in_progress" ||
    status === "in-progress" ||
    status === "in progress";

  const isCompleted =
    status === "completed";

  const isExpired =
    status === "expired";

  const canOpen =
    !isCompleted &&
    !isExpired;

  const buttonLabel = isAssigned
    ? "Start Challenge"
    : "Continue";

  // =========================================================
  // PREVIOUS ANSWER
  // =========================================================

  const hasPreviousAnswer =
    isCompleted &&
    assignment.completion_data &&
    Object.keys(
      assignment.completion_data,
    ).length > 0;

  // =========================================================
  // OPEN PREVIOUS ANSWER
  // =========================================================

  const handlePreviousAnswer = () => {
    window.dispatchEvent(
      new CustomEvent(
        "open-previous-answer",
        {
          detail: assignment,
        },
      ),
    );
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#dfe8e1] bg-white shadow-[0_12px_35px_-25px_rgba(15,61,46,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#cbded2] hover:shadow-[0_22px_45px_-25px_rgba(15,61,46,0.4)]">

      {/* =====================================================
          TOP DECORATION
      ====================================================== */}

      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-[#edf7f1] opacity-80 transition-transform duration-500 group-hover:scale-125" />

      {/* =====================================================
          CARD CONTENT
      ====================================================== */}

      <div className="relative flex flex-1 flex-col p-6">

        {/* ===================================================
            BADGES
        ==================================================== */}

        <div className="mb-5 flex flex-wrap items-center gap-2">

          <span className="rounded-full bg-[#eaf5ee] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[#0f6d50]">
            {challenge.category?.name ||
              "Career"}
          </span>

          <span className="rounded-full border border-[#dce7df] bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[#68786f]">
            {challenge.difficulty?.name ||
              "Medium"}
          </span>

          {challenge.is_ai_generated && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-600">
              <Sparkles size={11} />
              AI Generated
            </span>
          )}

        </div>

        {/* ===================================================
            TITLE
        ==================================================== */}

        <h3 className="text-lg font-black leading-7 tracking-tight text-[#0b2b20] transition-colors group-hover:text-[#0f6d50]">
          {challenge.title}
        </h3>

        {/* ===================================================
            DESCRIPTION
        ==================================================== */}

        <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#718078]">
          {challenge.description}
        </p>

        {/* ===================================================
            SKILLS
        ==================================================== */}

        {challenge.skills &&
          challenge.skills.length > 0 && (
            <div className="mt-5">

              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#919d97]">
                Skills
              </p>

              <div className="flex flex-wrap gap-1.5">

                {challenge.skills
                  .slice(0, 4)
                  .map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-[#f2f7f4] px-2.5 py-1.5 text-[10px] font-semibold text-[#426155]"
                    >
                      {skill}
                    </span>
                  ))}

                {challenge.skills.length >
                  4 && (
                  <span className="rounded-lg bg-[#f2f7f4] px-2.5 py-1.5 text-[10px] font-semibold text-[#718078]">
                    +
                    {challenge.skills.length -
                      4}
                  </span>
                )}

              </div>
            </div>
          )}

        {/* ===================================================
            SPACER
        ==================================================== */}

        <div className="flex-1" />

        {/* ===================================================
            META
        ==================================================== */}

        <div className="mt-6 flex items-center justify-between border-t border-[#edf1ee] pt-5">

          <div className="flex items-center gap-4">

            {/* TIME */}

            <div className="flex items-center gap-1.5">

              <Clock
                size={14}
                className="text-[#84918b]"
              />

              <span className="text-[11px] font-semibold text-[#68786f]">
                {challenge.estimated_minutes} min
              </span>

            </div>

            {/* XP */}

            <div className="flex items-center gap-1.5">

              <Trophy
                size={14}
                className="text-[#d59c25]"
              />

              <span className="text-[11px] font-bold text-[#68786f]">
                {challenge.difficulty?.points ?? 0} XP
              </span>

            </div>

          </div>

          {/* STATUS */}

          {isCompleted && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">

              <CheckCircle2 size={14} />

              Completed

            </div>
          )}

          {isInProgress && !isCompleted && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#c28a17]">

              <Clock size={14} />

              In Progress

            </div>
          )}

          {isAssigned && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0f6d50]">

              <Sparkles size={14} />

              Ready

            </div>
          )}

          {isExpired && (
            <div className="text-[11px] font-bold text-red-500">
              Expired
            </div>
          )}

        </div>

        {/* ===================================================
            START / CONTINUE
        ==================================================== */}

        {canOpen && (
          <button
            type="button"
            onClick={() => {
              if (!starting) {
                onStart(assignment);
              }
            }}
            disabled={starting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3d2e] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-12px_rgba(15,61,46,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0c3024] hover:shadow-[0_12px_25px_-12px_rgba(15,61,46,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {starting ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                Opening...
              </>
            ) : (
              <>
                {buttonLabel}

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </>
            )}

          </button>
        )}

        {/* ===================================================
            COMPLETED ACTIONS
        ==================================================== */}

        {isCompleted && (
          <div className="mt-5 space-y-2">

            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">

              <CheckCircle2 size={15} />

              Challenge completed ·{" "}
              {assignment.earned_points} XP earned

            </div>

            {/* PREVIOUS ANSWER */}

            <button
              type="button"
              onClick={handlePreviousAnswer}
              className="group/answer flex w-full items-center justify-center gap-2 rounded-xl border border-[#d9e5dd] bg-white px-4 py-3 text-xs font-bold text-[#315347] transition-all hover:-translate-y-0.5 hover:border-[#bcd5c7] hover:bg-[#f7fbf8] hover:text-[#0f6d50] hover:shadow-sm"
            >

              <Eye
                size={15}
                className="transition-transform group-hover/answer:scale-110"
              />

              {hasPreviousAnswer
                ? "Check Previous Answer"
                : "View Submission"}

              <ArrowRight
                size={14}
                className="transition-transform group-hover/answer:translate-x-0.5"
              />

            </button>

          </div>
        )}

        {/* ===================================================
            EXPIRED
        ==================================================== */}

        {isExpired && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-xs font-bold text-red-600">
            This challenge has expired.
          </div>
        )}

      </div>
    </article>
  );
}