import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  MessageSquareText,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Target,
  Trophy,
  UserRound,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  startInterview,
  submitInterviewAnswer,
  type StartInterviewResponse,
  type SubmitAnswerResponse,
} from "@/api/interview";

export const Route = createFileRoute(
  "/dashboard/interview"
)({
  component: MockInterviewPage,
});

/* ======================================================
   TYPES
====================================================== */

type VoiceStage =
  | "idle"
  | "listening"
  | "evaluating"
  | "speaking";

type SpeechRecognitionResultEvent = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionErrorEvent = Event & {
  error: string;
};

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult:
    | ((event: SpeechRecognitionResultEvent) => void)
    | null;
  onerror:
    | ((event: SpeechRecognitionErrorEvent) => void)
    | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

/* ======================================================
   PAGE
====================================================== */

function MockInterviewPage() {
  const [started, setStarted] = useState(false);

  const [session, setSession] =
    useState<StartInterviewResponse | null>(null);

  const [answer, setAnswer] = useState("");

  const [feedback, setFeedback] =
    useState<SubmitAnswerResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [voiceMode, setVoiceMode] = useState(false);

  const [voiceStage, setVoiceStage] =
    useState<VoiceStage>("idle");

  const [voiceSupported, setVoiceSupported] =
    useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  /* ====================================================
     INTERVIEW TIMER
  ==================================================== */

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [questionElapsedSeconds, setQuestionElapsedSeconds] =
    useState(0);

  /* ====================================================
     VOICE REFS
  ==================================================== */

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(null);

  const shouldSubmitVoiceRef =
    useRef(false);

  const speechCancelledRef =
    useRef(false);

  /*
   * IMPORTANT:
   * Keep the latest transcript in a ref as well as state.
   * This prevents SpeechRecognition's onend callback
   * from reading stale React state.
   */
  const answerRef = useRef("");

  const [form, setForm] = useState({
    company: "",
    job_role: "",
    experience_level: "Mid-level",
    interview_type: "Technical",
    difficulty: "Medium",
    question_count: 5,
    job_description: "",
  });

  /* ====================================================
     TOTAL INTERVIEW TIMER
  ==================================================== */

  useEffect(() => {
    if (!started) {
      setElapsedSeconds(0);
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [started]);

  /* ====================================================
     QUESTION TIMER
  ==================================================== */

  useEffect(() => {
    if (!started) {
      setQuestionElapsedSeconds(0);
      return;
    }

    setQuestionElapsedSeconds(0);

    const interval = window.setInterval(() => {
      setQuestionElapsedSeconds(
        (current) => current + 1
      );
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    started,
    session?.current_question_number,
  ]);

  /* ====================================================
     VOICE SUPPORT
  ==================================================== */

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    setVoiceSupported(true);

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-NG";

    recognition.onstart = () => {
      setVoiceStage("listening");
    };

    recognition.onresult = (
      event: SpeechRecognitionResultEvent
    ) => {
      let transcript = "";

      for (
        let i = 0;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0].transcript;
      }

      const cleanTranscript =
        transcript.trim();

      answerRef.current =
        cleanTranscript;

      setAnswer(cleanTranscript);
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      shouldSubmitVoiceRef.current = false;

      setVoiceStage("idle");

      if (event.error === "not-allowed") {
        setError(
          "Microphone access was blocked. Please allow microphone access in your browser."
        );
      } else if (event.error === "no-speech") {
        setError(
          "I couldn't hear an answer. Please try speaking again."
        );
      } else {
        setError(
          "Voice recognition stopped unexpectedly. Please try again."
        );
      }
    };

    recognition.onend = () => {
      const latestAnswer =
        answerRef.current.trim();

      if (
        shouldSubmitVoiceRef.current &&
        latestAnswer
      ) {
        shouldSubmitVoiceRef.current = false;

        handleSubmitAnswer(
          latestAnswer,
          true
        );
      } else {
        setVoiceStage("idle");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // Ignore cleanup errors.
      }

      recognitionRef.current = null;
    };
  }, []);

  /* ====================================================
     FORM
  ==================================================== */

  function updateForm(
    field: string,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* ====================================================
     FORMAT TIME
  ==================================================== */

  function formatTime(seconds: number) {
    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  /* ====================================================
     SPEAK
  ==================================================== */

  const speakText = useCallback(
    (text: string) => {
      if (!text || !voiceMode) return;

      if (!("speechSynthesis" in window)) {
        setError(
          "Your browser does not support voice playback."
        );
        return;
      }

      window.speechSynthesis.cancel();

      speechCancelledRef.current = false;

      const utterance =
        new SpeechSynthesisUtterance(text);

      utterance.lang = "en-NG";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setVoiceStage("speaking");
      };

      utterance.onend = () => {
        setIsSpeaking(false);

        if (!speechCancelledRef.current) {
          setVoiceStage("idle");
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setVoiceStage("idle");
      };

      window.speechSynthesis.speak(
        utterance
      );
    },
    [voiceMode]
  );

  /* ====================================================
     START INTERVIEW
  ==================================================== */

  async function handleStartInterview() {
    setError("");

    if (!form.company.trim()) {
      setError(
        "Please enter the company name."
      );
      return;
    }

    if (!form.job_role.trim()) {
      setError(
        "Please enter the job role."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await startInterview(form);

      setSession(result);
      setStarted(true);

      setFeedback(null);

      setAnswer("");
      answerRef.current = "";

      setElapsedSeconds(0);
      setQuestionElapsedSeconds(0);

      /*
       * Give React a moment to render the
       * interview room before Remo speaks.
       */
      if (
        voiceMode &&
        result.current_question
      ) {
        setTimeout(() => {
          speakText(
            result.current_question
          );
        }, 500);
      }
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
          "Unable to start the interview. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ====================================================
     START VOICE ANSWER
  ==================================================== */

  function startListening() {
    setError("");

    if (!voiceSupported) {
      setError(
        "Voice recognition is not supported in this browser. Try Google Chrome or Microsoft Edge."
      );
      return;
    }

    if (!recognitionRef.current) {
      setError(
        "Voice recognition is unavailable. Please refresh the page and try again."
      );
      return;
    }

    if (submitting) return;

    /*
     * Stop Remo if he is currently speaking.
     */
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    speechCancelledRef.current = true;

    setIsSpeaking(false);

    answerRef.current = "";

    setAnswer("");

    shouldSubmitVoiceRef.current =
      true;

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error(err);

      shouldSubmitVoiceRef.current =
        false;

      setVoiceStage("idle");

      setError(
        "Unable to start the microphone. Please try again."
      );
    }
  }

  /* ====================================================
     STOP LISTENING
  ==================================================== */

  function stopListening() {
    /*
     * Keep this true so onend submits the
     * latest transcript.
     */
    shouldSubmitVoiceRef.current =
      true;

    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore.
    }
  }

  /* ====================================================
     CANCEL VOICE ANSWER
  ==================================================== */

  function cancelListening() {
    shouldSubmitVoiceRef.current =
      false;

    answerRef.current = "";

    try {
      recognitionRef.current?.abort();
    } catch {
      // Ignore.
    }

    setVoiceStage("idle");
    setAnswer("");
  }

  /* ====================================================
     STOP REMO SPEAKING
  ==================================================== */

  function stopSpeaking() {
    speechCancelledRef.current =
      true;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setVoiceStage("idle");
  }

  /* ====================================================
     SUBMIT ANSWER
  ==================================================== */

  async function handleSubmitAnswer(
    providedAnswer?: string,
    fromVoice = false
  ) {
    if (!session) return;

    const finalAnswer =
      providedAnswer ??
      answerRef.current ??
      answer;

    if (!finalAnswer.trim()) {
      setError(
        "Please provide an answer before submitting."
      );
      return;
    }

    try {
      setSubmitting(true);

      setError("");

      if (fromVoice) {
        setVoiceStage("evaluating");
      }

      const result =
        await submitInterviewAnswer(
          session.session_id,
          finalAnswer.trim()
        );

      setFeedback(result);

      answerRef.current = "";
      setAnswer("");

      /*
       * Backend already gives us the next
       * question when there is one.
       */
      if (result.has_next) {
        const nextQuestion =
          result.next_question || "";

        const nextQuestionNumber =
          result.next_question_number ||
          session.current_question_number;

        setSession((current) =>
          current
            ? {
                ...current,
                current_question:
                  nextQuestion,
                current_question_number:
                  nextQuestionNumber,
              }
            : current
        );

        setQuestionElapsedSeconds(0);

        /*
         * Voice interview:
         * Remo automatically asks the next
         * question.
         */
        if (
          fromVoice &&
          voiceMode &&
          nextQuestion
        ) {
          setTimeout(() => {
            speakText(nextQuestion);
          }, 700);
        } else {
          setVoiceStage("idle");
        }
      } else {
        /*
         * Interview complete.
         */
        setVoiceStage("idle");

        if (
          fromVoice &&
          voiceMode &&
          result.feedback
        ) {
          setTimeout(() => {
            speakText(
              `Your interview is complete. You scored ${result.session_score || result.overall_score} out of 100. ${result.feedback}`
            );
          }, 700);
        }
      }
    } catch (err: any) {
      console.error(err);

      setVoiceStage("idle");

      setError(
        err?.response?.data?.error ||
          "Unable to submit your answer."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ====================================================
     NEXT QUESTION
  ==================================================== */

  function handleNextQuestion() {
    if (!feedback?.has_next) return;

    setFeedback(null);

    setAnswer("");

    answerRef.current = "";

    setQuestionElapsedSeconds(0);

    /*
     * In voice mode the backend question is
     * already loaded. Let the user start listening.
     */
    if (voiceMode) {
      setVoiceStage("idle");
    }
  }

  /* ====================================================
     PRACTICE AGAIN
  ==================================================== */

  function practiceAgain() {
    shouldSubmitVoiceRef.current =
      false;

    answerRef.current = "";

    try {
      recognitionRef.current?.abort();
    } catch {
      // Ignore.
    }

    speechCancelledRef.current =
      true;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setVoiceStage("idle");

    setStarted(false);

    setSession(null);

    setFeedback(null);

    setAnswer("");

    setError("");

    setElapsedSeconds(0);

    setQuestionElapsedSeconds(0);
  }

  /* ====================================================
     END INTERVIEW
  ==================================================== */

  function resetInterview() {
    shouldSubmitVoiceRef.current =
      false;

    answerRef.current = "";

    try {
      recognitionRef.current?.abort();
    } catch {
      // Ignore.
    }

    speechCancelledRef.current =
      true;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);

    setVoiceStage("idle");

    setStarted(false);

    setSession(null);

    setFeedback(null);

    setAnswer("");

    setError("");

    setElapsedSeconds(0);

    setQuestionElapsedSeconds(0);
  }

  /* ====================================================
     SETUP
  ==================================================== */

  if (!started) {
    return (
      <InterviewSetup
        form={form}
        updateForm={updateForm}
        loading={loading}
        error={error}
        voiceMode={voiceMode}
        setVoiceMode={setVoiceMode}
        voiceSupported={voiceSupported}
        onStart={handleStartInterview}
      />
    );
  }

  const progress =
    ((session?.current_question_number ||
      1) /
      (session?.total_questions || 1)) *
    100;

  const isComplete =
    !!feedback && !feedback.has_next;

  return (
    <div className="space-y-7">
      {/* ==================================================
          INTERVIEW ROOM HEADER
      ================================================== */}

      <section className="overflow-hidden rounded-[2rem] bg-[#0f3d2e] text-white shadow-sm">
        <div className="p-7 sm:p-9">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-emerald-100">
                <Sparkles className="h-3.5 w-3.5 text-[#f4b740]" />
                AI Interview Room
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {form.job_role}
              </h1>

              <p className="mt-2 text-sm text-emerald-100/70">
                {form.company} ·{" "}
                {form.interview_type} ·{" "}
                {form.difficulty}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold">
                <Clock3 className="h-4 w-4 text-[#f4b740]" />
                {formatTime(
                  elapsedSeconds
                )}
              </div>

              {voiceMode && (
                <button
                  onClick={() =>
                    isSpeaking
                      ? stopSpeaking()
                      : speakText(
                          session?.current_question ||
                            ""
                        )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="h-4 w-4" />
                      Stop Remo
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Hear question
                    </>
                  )}
                </button>
              )}

              <button
                onClick={resetInterview}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <X className="h-4 w-4" />
                End Interview
              </button>
            </div>
          </div>

          {/* QUESTION PROGRESS */}

          <div className="mt-8">
            <div className="flex items-center justify-between text-xs text-emerald-100/70">
              <span>
                Question{" "}
                {session?.current_question_number}{" "}
                of{" "}
                {session?.total_questions}
              </span>

              <span>
                {Math.round(progress)}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#f4b740] transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* HEADER STATS */}

        <div className="grid border-t border-white/10 sm:grid-cols-3">
          <RoomStat
            label="Interview type"
            value={form.interview_type}
          />

          <RoomStat
            label="Difficulty"
            value={form.difficulty}
          />

          <RoomStat
            label="Mode"
            value={
              voiceMode
                ? "Voice"
                : "Text"
            }
          />
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==================================================
          COMPLETION
      ================================================== */}

      {isComplete ? (
        <FinalInterviewReport
          feedback={feedback}
          totalQuestions={
            session?.total_questions || 0
          }
          elapsedSeconds={
            elapsedSeconds
          }
          onPracticeAgain={
            practiceAgain
          }
        />
      ) : (
        <>
          {/* ==================================================
              MAIN INTERVIEW AREA
          ================================================== */}

          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            {/* QUESTION */}

            <section className="rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
                    <MessageSquareText className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      Interview question
                    </p>

                    <p className="text-xs text-neutral-400">
                      Question{" "}
                      {
                        session?.current_question_number
                      }
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatTime(
                    questionElapsedSeconds
                  )}
                </div>
              </div>

              <h2 className="mt-7 text-2xl font-bold leading-relaxed text-[#0d1f17] sm:text-3xl">
                {session?.current_question}
              </h2>

              <p className="mt-4 text-sm leading-6 text-neutral-500">
                Take your time. Give a clear answer
                and support your points with examples
                where possible.
              </p>

              {/* ==================================================
                  VOICE MODE
              ================================================== */}

              {voiceMode ? (
                <div className="mt-8">
                  <VoiceInterviewPanel
                    voiceStage={voiceStage}
                    answer={answer}
                    submitting={submitting}
                    onStartListening={
                      startListening
                    }
                    onStopListening={
                      stopListening
                    }
                    onCancelListening={
                      cancelListening
                    }
                    onStopSpeaking={
                      stopSpeaking
                    }
                  />

                  {/* TEXT FALLBACK */}

                  <div className="mt-5">
                    <details className="group">
                      <summary className="cursor-pointer list-none text-center text-xs font-semibold text-neutral-400 transition hover:text-emerald-700">
                        Prefer typing? Enter your answer
                        instead
                      </summary>

                      <div className="mt-4">
                        <textarea
                          value={answer}
                          onChange={(event) => {
                            const value =
                              event.target.value;

                            setAnswer(value);

                            answerRef.current =
                              value;
                          }}
                          disabled={
                            submitting
                          }
                          placeholder="Type your answer here..."
                          className="min-h-45 w-full resize-none rounded-2xl border border-emerald-900/10 bg-[#fafbf8] p-5 text-sm leading-7 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                        />

                        <button
                          onClick={() =>
                            handleSubmitAnswer(
                              answer,
                              false
                            )
                          }
                          disabled={
                            submitting ||
                            !answer.trim()
                          }
                          className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#0f3d2e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3024] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Evaluating...
                            </>
                          ) : (
                            <>
                              Submit answer
                              <ChevronRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </details>
                  </div>
                </div>
              ) : (
                /* ==================================================
                   NORMAL TEXT MODE
                ================================================== */

                <div className="mt-8">
                  <label className="mb-2 block text-sm font-semibold text-neutral-800">
                    Your answer
                  </label>

                  <textarea
                    value={answer}
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      setAnswer(value);

                      answerRef.current =
                        value;
                    }}
                    disabled={submitting}
                    placeholder="Type your answer here. Explain your thinking clearly and give examples where possible..."
                    className="min-h-62.5 w-full resize-none rounded-2xl border border-emerald-900/10 bg-[#fafbf8] p-5 text-sm leading-7 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />

                  <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-xs text-neutral-400">
                      Tip: Use the STAR method for
                      behavioural questions.
                    </p>

                    <button
                      onClick={() =>
                        handleSubmitAnswer()
                      }
                      disabled={
                        submitting ||
                        !answer.trim()
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f3d2e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3024] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          Submit answer
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* SWITCH TO VOICE */}

                  {voiceSupported && (
                    <button
                      onClick={() =>
                        setVoiceMode(true)
                      }
                      className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 transition hover:text-emerald-900"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      Switch to voice interview
                    </button>
                  )}
                </div>
              )}

              {/* ==================================================
                  EVALUATION ACTION
              ================================================== */}

              {feedback &&
                feedback.has_next && (
                  <div className="mt-8 rounded-2xl border border-emerald-900/10 bg-[#f7faf8] p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm font-bold text-[#0d1f17]">
                          Ready for the next question?
                        </p>

                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          Your evaluation is ready. Continue
                          when you're ready.
                        </p>
                      </div>

                      <button
                        onClick={
                          handleNextQuestion
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f3d2e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3024]"
                      >
                        Next Question
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
            </section>

            {/* ==================================================
                SIDE PANEL
            ================================================== */}

            <div className="space-y-6">
              <InterviewInfo
                company={form.company}
                role={form.job_role}
                type={form.interview_type}
                difficulty={
                  form.difficulty
                }
              />

              <InterviewRoomStatus
                voiceMode={voiceMode}
                voiceSupported={
                  voiceSupported
                }
                stage={voiceStage}
                questionTime={
                  questionElapsedSeconds
                }
              />

              {feedback && (
                <FeedbackCard
                  feedback={feedback}
                />
              )}
            </div>
          </div>

          {/* ==================================================
              FEEDBACK
          ================================================== */}

          {feedback && (
            <FeedbackDetails
              feedback={feedback}
            />
          )}
        </>
      )}

      {/* ==================================================
          VOICE MODAL
      ================================================== */}

      {voiceStage !== "idle" && (
        <VoiceModal
          stage={voiceStage}
          answer={answer}
          onStopListening={
            stopListening
          }
          onCancelListening={
            cancelListening
          }
          onStopSpeaking={
            stopSpeaking
          }
        />
      )}
    </div>
  );
}

/* ======================================================
   ROOM STAT
====================================================== */

function RoomStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-white/10 p-4 sm:border-r last:border-r-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100/50">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

/* ======================================================
   SETUP
====================================================== */

function InterviewSetup({
  form,
  updateForm,
  loading,
  error,
  voiceMode,
  setVoiceMode,
  voiceSupported,
  onStart,
}: any) {
  return (
    <div className="space-y-7">
      <section>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <Sparkles className="h-3.5 w-3.5" />
          AI Interview Room
        </div>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#0f3d2e] sm:text-5xl">
          Practice like the
          <span className="ml-2 font-serif italic text-emerald-700">
            real thing.
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
          Configure your interview and let Remo
          generate questions, evaluate your answers
          and coach you after every response.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-7">
          <h2 className="text-xl font-bold text-[#0d1f17]">
            Set up your interview
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Tell Remo what you want to practise.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Company"
            placeholder="e.g. Google"
            value={form.company}
            onChange={(value: string) =>
              updateForm(
                "company",
                value
              )
            }
          />

          <Input
            label="Job role"
            placeholder="e.g. Data Scientist"
            value={form.job_role}
            onChange={(value: string) =>
              updateForm(
                "job_role",
                value
              )
            }
          />

          <Select
            label="Experience level"
            value={form.experience_level}
            onChange={(value: string) =>
              updateForm(
                "experience_level",
                value
              )
            }
            options={[
              "Entry-level",
              "Junior",
              "Mid-level",
              "Senior",
              "Lead",
            ]}
          />

          <Select
            label="Interview type"
            value={form.interview_type}
            onChange={(value: string) =>
              updateForm(
                "interview_type",
                value
              )
            }
            options={[
              "Technical",
              "Behavioural",
              "Mixed",
              "System Design",
            ]}
          />

          <Select
            label="Difficulty"
            value={form.difficulty}
            onChange={(value: string) =>
              updateForm(
                "difficulty",
                value
              )
            }
            options={[
              "Easy",
              "Medium",
              "Hard",
            ]}
          />

          <Select
            label="Number of questions"
            value={String(
              form.question_count
            )}
            onChange={(value: string) =>
              updateForm(
                "question_count",
                Number(value)
              )
            }
            options={[
              "3",
              "5",
              "7",
              "10",
            ]}
          />
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold text-neutral-800">
            Job description
            <span className="ml-1 font-normal text-neutral-400">
              optional
            </span>
          </label>

          <textarea
            value={form.job_description}
            onChange={(event) =>
              updateForm(
                "job_description",
                event.target.value
              )
            }
            placeholder="Paste the job description here to make the interview more relevant..."
            className="mt-2 min-h-37.5 w-full resize-none rounded-2xl border border-emerald-900/10 bg-[#fafbf8] p-4 text-sm leading-6 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        {/* ==================================================
            VOICE MODE
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-emerald-900/10 bg-[#f7faf8] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
                <Mic className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-[#0d1f17]">
                  Voice interview
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Let Remo ask questions aloud and
                  evaluate your spoken answers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setVoiceMode(!voiceMode)
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                voiceMode
                  ? "bg-[#0f3d2e]"
                  : "bg-neutral-200"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  voiceMode
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {voiceMode && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs text-neutral-500">
              {voiceSupported ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Voice recognition is available in
                  this browser.
                </>
              ) : (
                <>
                  <MicOff className="h-4 w-4 text-red-500" />
                  Voice recognition is unavailable.
                  Try Chrome or Edge.
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onStart}
          disabled={
            loading ||
            (voiceMode &&
              !voiceSupported)
          }
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f3d2e] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b3024] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing interview...
            </>
          ) : (
            <>
              {voiceMode ? (
                <Mic className="h-4 w-4 text-[#f4b740]" />
              ) : (
                <Play className="h-4 w-4 text-[#f4b740]" />
              )}

              {voiceMode
                ? "Start Voice Interview"
                : "Start Interview Room"}
            </>
          )}
        </button>
      </section>
    </div>
  );
}

/* ======================================================
   INPUT
====================================================== */

function Input({
  label,
  placeholder,
  value,
  onChange,
}: any) {
  return (
    <div>
      <label className="text-sm font-semibold text-neutral-800">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 h-12 w-full rounded-xl border border-emerald-900/10 bg-[#fafbf8] px-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}

/* ======================================================
   SELECT
====================================================== */

function Select({
  label,
  value,
  onChange,
  options,
}: any) {
  return (
    <div>
      <label className="text-sm font-semibold text-neutral-800">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 h-12 w-full rounded-xl border border-emerald-900/10 bg-[#fafbf8] px-4 text-sm outline-none focus:border-emerald-600"
      >
        {options.map(
          (option: string) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </div>
  );
}

/* ======================================================
   INTERVIEW INFO
====================================================== */

function InterviewInfo({
  company,
  role,
  type,
  difficulty,
}: any) {
  return (
    <section className="rounded-[2rem] border border-emerald-900/10 bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs text-neutral-400">
            Interview details
          </p>

          <h2 className="font-bold text-[#0d1f17]">
            {company}
          </h2>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <InfoRow
          icon={UserRound}
          label="Role"
          value={role}
        />

        <InfoRow
          icon={MessageSquareText}
          label="Type"
          value={type}
        />

        <InfoRow
          icon={Target}
          label="Difficulty"
          value={difficulty}
        />
      </div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-xs text-neutral-400">
          {label}
        </p>

        <p className="text-sm font-semibold text-neutral-800">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ======================================================
   INTERVIEW ROOM STATUS
====================================================== */

function InterviewRoomStatus({
  voiceMode,
  voiceSupported,
  stage,
  questionTime,
}: {
  voiceMode: boolean;
  voiceSupported: boolean;
  stage: VoiceStage;
  questionTime: number;
}) {
  const status =
    stage === "listening"
      ? "Remo is listening"
      : stage === "evaluating"
      ? "Remo is evaluating"
      : stage === "speaking"
      ? "Remo is speaking"
      : "Ready for your answer";

  return (
    <section className="rounded-[2rem] border border-emerald-900/10 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-10 w-10 place-items-center rounded-xl ${
              stage === "listening"
                ? "bg-[#0f3d2e] text-white"
                : "bg-emerald-50 text-emerald-800"
            }`}
          >
            {stage === "listening" ? (
              <Mic className="h-5 w-5" />
            ) : stage ===
              "evaluating" ? (
              <BrainCircuit className="h-5 w-5" />
            ) : stage ===
              "speaking" ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>

          <div>
            <p className="text-xs text-neutral-400">
              Remo
            </p>

            <p className="text-sm font-bold text-[#0d1f17]">
              {status}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-500">
          <Clock3 className="h-3.5 w-3.5" />
          {formatStaticTime(
            questionTime
          )}
        </div>
      </div>

      {/* AUDIO BARS */}

      {voiceMode && (
        <div className="mt-6 rounded-2xl bg-[#f7faf8] p-4">
          <div className="flex h-8 items-center justify-center gap-1">
            {[
              3,
              6,
              4,
              8,
              5,
              7,
              4,
              6,
              3,
            ].map(
              (height, index) => (
                <span
                  key={index}
                  className={`w-1.5 rounded-full transition-all ${
                    stage === "listening"
                      ? "animate-pulse bg-emerald-700"
                      : "bg-emerald-200"
                  }`}
                  style={{
                    height: `${height * 3}px`,
                    animationDelay: `${index * 80}ms`,
                  }}
                />
              )
            )}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-neutral-500">
            <span
              className={`h-2 w-2 rounded-full ${
                voiceSupported
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            />

            {voiceSupported
              ? "Microphone ready"
              : "Voice unavailable"}
          </div>
        </div>
      )}

      {!voiceMode && (
        <div className="mt-5 rounded-2xl bg-[#f7faf8] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-emerald-700">
              <MessageSquareText className="h-4 w-4" />
            </div>

            <p className="text-xs leading-5 text-neutral-500">
              Type your answer below and Remo will
              evaluate it after submission.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function formatStaticTime(
  seconds: number
) {
  const minutes = Math.floor(
    seconds / 60
  );

  const remainingSeconds =
    seconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

/* ======================================================
   VOICE INTERVIEW PANEL
====================================================== */

function VoiceInterviewPanel({
  voiceStage,
  answer,
  submitting,
  onStartListening,
  onStopListening,
  onCancelListening,
  onStopSpeaking,
}: {
  voiceStage: VoiceStage;
  answer: string;
  submitting: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onCancelListening: () => void;
  onStopSpeaking: () => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-emerald-900/10 bg-[#f7faf8] p-6">
      <div className="flex flex-col items-center text-center">
        <div
          className={`relative grid h-24 w-24 place-items-center rounded-full transition-all ${
            voiceStage === "listening"
              ? "bg-[#0f3d2e] text-white shadow-[0_0_0_14px_rgba(15,61,46,0.08)]"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {voiceStage ===
            "listening" && (
            <>
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-700/20" />

              <span className="absolute -inset-3 rounded-full border border-emerald-600/20" />
            </>
          )}

          <div className="relative">
            {voiceStage ===
            "listening" ? (
              <Mic className="h-9 w-9" />
            ) : voiceStage ===
              "evaluating" ? (
              <BrainCircuit className="h-9 w-9" />
            ) : voiceStage ===
              "speaking" ? (
              <Volume2 className="h-9 w-9" />
            ) : (
              <Mic className="h-9 w-9" />
            )}
          </div>
        </div>

        <h3 className="mt-6 text-xl font-bold text-[#0d1f17]">
          {voiceStage ===
          "listening"
            ? "Your turn"
            : voiceStage ===
              "evaluating"
            ? "Remo is evaluating"
            : voiceStage ===
              "speaking"
            ? "Remo is speaking"
            : "Ready for your answer"}
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
          {voiceStage ===
          "listening"
            ? "Speak naturally. Remo is listening to your answer."
            : voiceStage ===
              "evaluating"
            ? "Your answer is being analysed. Remo will continue the interview shortly."
            : voiceStage ===
              "speaking"
            ? "Listen carefully to Remo's question."
            : "Tap the microphone when you're ready to answer."}
        </p>

        {/* LIVE TRANSCRIPT */}

        {answer && (
          <div className="mt-6 w-full rounded-2xl border border-emerald-900/10 bg-white p-4 text-left">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <Mic className="h-3.5 w-3.5" />
              Live transcript
            </div>

            <p className="text-sm leading-6 text-neutral-700">
              {answer}
            </p>
          </div>
        )}

        {/* BUTTONS */}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {voiceStage ===
            "listening" && (
            <>
              <button
                onClick={
                  onStopListening
                }
                className="inline-flex items-center gap-2 rounded-full bg-[#0f3d2e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3024]"
              >
                <Square className="h-4 w-4 fill-current" />
                Finish answer
              </button>

              <button
                onClick={
                  onCancelListening
                }
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </>
          )}

          {voiceStage ===
            "evaluating" && (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              Evaluating answer...
            </div>
          )}

          {voiceStage ===
            "speaking" && (
            <button
              onClick={
                onStopSpeaking
              }
              className="inline-flex items-center gap-2 rounded-full bg-[#0f3d2e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3024]"
            >
              <VolumeX className="h-4 w-4" />
              Stop Remo
            </button>
          )}

          {voiceStage ===
            "idle" && (
            <button
              onClick={
                onStartListening
              }
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#0f3d2e] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b3024] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mic className="h-4 w-4" />
              Answer with voice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   FEEDBACK CARD
====================================================== */

function FeedbackCard({
  feedback,
}: {
  feedback: SubmitAnswerResponse;
}) {
  const score =
    feedback.overall_score || 0;

  return (
    <section className="rounded-[2rem] bg-[#0f3d2e] p-6 text-white">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-[#f4b740]" />

        <h2 className="font-bold">
          Latest evaluation
        </h2>
      </div>

      <div className="mt-6 flex items-end gap-2">
        <span className="text-5xl font-bold">
          {score}
        </span>

        <span className="mb-1 text-sm text-emerald-100/60">
          / 100
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#f4b740]"
          style={{
            width: `${Math.max(
              0,
              Math.min(score, 100)
            )}%`,
          }}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-emerald-50/80">
        {feedback.feedback}
      </p>
    </section>
  );
}

/* ======================================================
   FEEDBACK DETAILS
====================================================== */

function FeedbackDetails({
  feedback,
}: {
  feedback: SubmitAnswerResponse;
}) {
  const scores = [
    {
      label: "Technical",
      value:
        feedback.technical_score || 0,
    },
    {
      label: "Communication",
      value:
        feedback.communication_score ||
        0,
    },
    {
      label: "Confidence",
      value:
        feedback.confidence_score || 0,
    },
    {
      label: "Problem solving",
      value:
        feedback.problem_solving_score ||
        0,
    },
  ];

  return (
    <section className="space-y-6">
      {/* SECTION HEADER */}

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            AI evaluation
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#0d1f17]">
            Your answer breakdown
          </h2>
        </div>

        <div className="hidden items-center gap-2 text-xs text-neutral-400 sm:flex">
          <BrainCircuit className="h-4 w-4" />
          Powered by Remo
        </div>
      </div>

      {/* SCORES */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {scores.map((score) => (
          <ScoreCard
            key={score.label}
            label={score.label}
            value={score.value}
          />
        ))}
      </div>

      {/* STRENGTHS / WEAKNESSES */}

      <div className="grid gap-6 lg:grid-cols-2">
        <FeedbackList
          title="What you did well"
          items={feedback.strengths}
          positive
        />

        <FeedbackList
          title="Areas to improve"
          items={feedback.weaknesses}
        />
      </div>

      {/* BETTER ANSWERS */}

      <div>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Answer coaching
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#0d1f17]">
            See how your answer could be stronger
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AnswerVersion
            title="Improved answer"
            value={
              feedback.improved_answer
            }
          />

          <AnswerVersion
            title="Professional version"
            value={
              feedback.professional_version
            }
          />

          <AnswerVersion
            title="FAANG-style version"
            value={
              feedback.faang_version
            }
          />

          <AnswerVersion
            title="Concise version"
            value={
              feedback.concise_version
            }
          />
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   SCORE CARD
====================================================== */

function ScoreCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const safeValue = Math.max(
    0,
    Math.min(value || 0, 100)
  );

  return (
    <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">
          {label}
        </p>

        <span className="text-xs font-semibold text-emerald-700">
          {safeValue}%
        </span>
      </div>

      <p className="mt-2 text-3xl font-bold text-emerald-950">
        {safeValue}
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-50">
        <div
          className="h-full rounded-full bg-emerald-700 transition-all duration-500"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ======================================================
   FEEDBACK LIST
====================================================== */

function FeedbackList({
  title,
  items,
  positive = false,
}: any) {
  return (
    <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        {positive ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <Target className="h-5 w-5 text-emerald-700" />
        )}

        <h2 className="font-bold text-neutral-900">
          {title}
        </h2>
      </div>

      <div className="mt-4 space-y-3">
        {items?.length ? (
          items.map(
            (
              item: string,
              index: number
            ) => (
              <div
                key={`${item}-${index}`}
                className={`rounded-2xl p-4 ${
                  positive
                    ? "bg-emerald-50"
                    : "bg-neutral-50"
                }`}
              >
                <div className="flex gap-3">
                  {positive ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  )}

                  <p className="text-sm leading-6 text-neutral-700">
                    {item}
                  </p>
                </div>
              </div>
            )
          )
        ) : (
          <p className="text-sm text-neutral-500">
            Nothing to report.
          </p>
        )}
      </div>
    </div>
  );
}

/* ======================================================
   ANSWER VERSION
====================================================== */

function AnswerVersion({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-neutral-900">
          {title}
        </h2>

        <Sparkles className="h-4 w-4 text-emerald-600" />
      </div>

      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-600">
        {value ||
          "No version generated."}
      </p>
    </div>
  );
}

/* ======================================================
   FINAL INTERVIEW REPORT
====================================================== */

function FinalInterviewReport({
  feedback,
  totalQuestions,
  elapsedSeconds,
  onPracticeAgain,
}: {
  feedback: SubmitAnswerResponse;
  totalQuestions: number;
  elapsedSeconds: number;
  onPracticeAgain: () => void;
}) {
  const overall =
    feedback.session_score ||
    feedback.overall_score ||
    0;

  const categoryScores = [
    {
      label: "Technical",
      value:
        feedback.technical_score || 0,
    },
    {
      label: "Communication",
      value:
        feedback.communication_score ||
        0,
    },
    {
      label: "Confidence",
      value:
        feedback.confidence_score || 0,
    },
    {
      label: "Problem solving",
      value:
        feedback.problem_solving_score ||
        0,
    },
  ];

  const strongest =
    categoryScores.reduce(
      (best, current) =>
        current.value > best.value
          ? current
          : best,
      categoryScores[0]
    );

  const weakest =
    categoryScores.reduce(
      (worst, current) =>
        current.value < worst.value
          ? current
          : worst,
      categoryScores[0]
    );

  const performance =
    overall >= 85
      ? "Excellent performance"
      : overall >= 70
      ? "Strong performance"
      : overall >= 55
      ? "Good foundation"
      : "More practice recommended";

  return (
    <section className="space-y-6">
      {/* HERO */}

      <section className="overflow-hidden rounded-[2rem] bg-[#0f3d2e] p-7 text-white shadow-sm sm:p-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10">
            <Trophy className="h-8 w-8 text-[#f4b740]" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/60">
            Interview complete
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {performance}
          </h1>

          <div className="mt-8">
            <span className="text-7xl font-bold tracking-tight">
              {overall}
            </span>

            <span className="ml-2 text-lg text-emerald-100/60">
              / 100
            </span>
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-emerald-50/75">
            Remo evaluated your interview across technical
            ability, communication, confidence and problem
            solving.
          </p>
        </div>
      </section>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-3">
        <ReportStat
          icon={MessageSquareText}
          label="Questions"
          value={String(
            totalQuestions
          )}
        />

        <ReportStat
          icon={Clock3}
          label="Interview time"
          value={formatStaticTime(
            elapsedSeconds
          )}
        />

        <ReportStat
          icon={Trophy}
          label="Overall score"
          value={`${overall}/100`}
        />
      </div>

      {/* CATEGORY SCORES */}

      <section className="rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
            <BarChart3 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Performance breakdown
            </p>

            <h2 className="text-xl font-bold text-[#0d1f17]">
              Your interview scores
            </h2>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {categoryScores.map(
            (score) => (
              <ScoreCard
                key={score.label}
                label={score.label}
                value={score.value}
              />
            )
          )}
        </div>
      </section>

      {/* STRONGEST / WEAKEST */}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Trophy className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-neutral-400">
                Strongest area
              </p>

              <h2 className="font-bold text-[#0d1f17]">
                {strongest.label}
              </h2>
            </div>
          </div>

          <p className="mt-5 text-3xl font-bold text-emerald-800">
            {strongest.value}/100
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            This was your strongest performance category
            in this interview.
          </p>
        </section>

        <section className="rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Target className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-neutral-400">
                Focus area
              </p>

              <h2 className="font-bold text-[#0d1f17]">
                {weakest.label}
              </h2>
            </div>
          </div>

          <p className="mt-5 text-3xl font-bold text-emerald-800">
            {weakest.value}/100
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Improving this area could have the biggest
            impact on your next interview.
          </p>
        </section>
      </div>

      {/* FEEDBACK */}

      <div className="grid gap-6 lg:grid-cols-2">
        <FeedbackList
          title="Your strengths"
          items={feedback.strengths}
          positive
        />

        <FeedbackList
          title="Focus for next time"
          items={feedback.weaknesses}
        />
      </div>

      {/* FINAL FEEDBACK */}

      <section className="rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
            <BrainCircuit className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Remo's assessment
            </p>

            <h2 className="text-xl font-bold text-[#0d1f17]">
              Final feedback
            </h2>
          </div>
        </div>

        <p className="mt-6 text-sm leading-7 text-neutral-600">
          {feedback.feedback}
        </p>
      </section>

      {/* ACTIONS */}

      <section className="rounded-[2rem] border border-emerald-900/10 bg-[#f7faf8] p-7 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Keep improving
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#0d1f17]">
              Ready for another round?
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Practice again with the same role and
              settings, or change the difficulty and
              interview type.
            </p>
          </div>

          <button
            onClick={
              onPracticeAgain
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0f3d2e] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b3024]"
          >
            <RotateCcw className="h-4 w-4" />
            Practice Again
          </button>
        </div>
      </section>
    </section>
  );
}

/* ======================================================
   REPORT STAT
====================================================== */

function ReportStat({
  icon: Icon,
  label,
  value,
}: any) {
  return (
    <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-xs text-neutral-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-[#0d1f17]">
        {value}
      </p>
    </div>
  );
}

/* ======================================================
   VOICE MODAL
====================================================== */

function VoiceModal({
  stage,
  answer,
  onStopListening,
  onCancelListening,
  onStopSpeaking,
}: {
  stage: VoiceStage;
  answer: string;
  onStopListening: () => void;
  onCancelListening: () => void;
  onStopSpeaking: () => void;
}) {
  const isListening =
    stage === "listening";

  const isEvaluating =
    stage === "evaluating";

  const isSpeaking =
    stage === "speaking";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#061b14]/70 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Remo Voice Interview
          </div>

          <button
            onClick={
              isListening
                ? onCancelListening
                : isSpeaking
                ? onStopSpeaking
                : undefined
            }
            disabled={isEvaluating}
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-9 flex flex-col items-center text-center">
          {/* MAIN ICON */}

          <div
            className={`relative grid h-28 w-28 place-items-center rounded-full ${
              isListening
                ? "bg-[#0f3d2e] text-white"
                : "bg-emerald-50 text-emerald-800"
            }`}
          >
            {isListening && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-700/20" />

                <span className="absolute -inset-3 rounded-full border border-emerald-600/20" />
              </>
            )}

            <div className="relative">
              {isListening ? (
                <Mic className="h-10 w-10" />
              ) : isEvaluating ? (
                <BrainCircuit className="h-10 w-10" />
              ) : (
                <Volume2 className="h-10 w-10" />
              )}
            </div>
          </div>

          {/* TITLE */}

          <h2 className="mt-7 text-2xl font-bold tracking-tight text-[#0d1f17]">
            {isListening
              ? "Remo is listening"
              : isEvaluating
              ? "Remo is evaluating"
              : "Remo is speaking"}
          </h2>

          {/* DESCRIPTION */}

          <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
            {isListening
              ? "Speak naturally and answer the interview question. Your response will be transcribed automatically."
              : isEvaluating
              ? "Your answer has been submitted. Remo is analysing your response."
              : "Listen to the question carefully. You can stop the audio at any time."}
          </p>

          {/* LIVE TRANSCRIPT */}

          {isListening &&
            answer && (
              <div className="mt-6 w-full rounded-2xl border border-emerald-900/10 bg-[#f7faf8] p-4 text-left">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <Mic className="h-3.5 w-3.5" />
                  Listening...
                </div>

                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  {answer}
                </p>
              </div>
            )}

          {/* AUDIO ANIMATION */}

          {isSpeaking && (
            <div className="mt-7 flex h-8 items-center justify-center gap-1">
              {[3, 6, 4, 8, 5, 7].map(
                (height, index) => (
                  <span
                    key={index}
                    className="w-1.5 animate-pulse rounded-full bg-emerald-600"
                    style={{
                      height: `${height * 4}px`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                )
              )}
            </div>
          )}

          {/* EVALUATING */}

          {isEvaluating && (
            <div className="mt-7 flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analysing your answer
            </div>
          )}

          {/* BUTTONS */}

          {isListening && (
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                onClick={
                  onStopListening
                }
                className="inline-flex items-center gap-2 rounded-full bg-[#0f3d2e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3024]"
              >
                <Square className="h-4 w-4 fill-current" />
                Finish answer
              </button>

              <button
                onClick={
                  onCancelListening
                }
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}

          {isSpeaking && (
            <button
              onClick={
                onStopSpeaking
              }
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              <VolumeX className="h-4 w-4" />
              Stop Remo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}