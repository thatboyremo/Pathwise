import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  FileText,
  GraduationCap,
  MessageCircle,
  RefreshCw,
  Send,
  Target,
  TrendingUp,
  BriefcaseBusiness,
  Sparkles,
  ChevronRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Brain,
} from "lucide-react";

import api from "../api/axios";

export const Route = createFileRoute("/dashboard/coach")({
  component: CareerCoachPage,
});

/* ===============================================================
   TYPES
=============================================================== */

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type Action = {
  title: string;
  description: string;
  button: string;
  prompt: string;
  icon: typeof Target;
};

type Skill = {
  id?: number;
  name: string;
  level?: string;
  category?: string;
};

type Experience = {
  id?: number;
  role?: string;
  company?: string;
  period?: string;
  description?: string;
};

type Education = {
  id?: number;
  degree?: string;
  institution?: string;
  field?: string;
  period?: string;
  grade?: string;
};

type Project = {
  id?: number;
  name?: string;
  description?: string;
  technologies?: string[];
  url?: string;
};

type Profile = {
  full_name?: string;
  phone?: string;
  country?: string;
  city?: string;
  bio?: string;
  career_goal?: string;
  target_role?: string;
  years_experience?: number;
  work_preference?: string;

  linkedin?: string;
  github?: string;
  portfolio?: string;

  resume_filename?: string;
  resume_score?: number;
  ats_score?: number;
  resume_word_count?: number;
  resume_uploaded?: boolean;
  resume_analyzed?: boolean;

  career_score?: number;
  profile_completion?: number;
  completed?: boolean;

  profile_picture?: string;

  skills?: Skill[];
  experiences?: Experience[];
  education?: Education[];
  projects?: Project[];
};

type ProfileResponse = {
  profile?: Profile;
  skills?: Skill[];
  experiences?: Experience[];
  education?: Education[];
  projects?: Project[];
};

/* ===============================================================
   SPEECH RECOGNITION TYPES

   These names are intentionally unique so they don't collide
   with browser/project SpeechRecognition typings.
=============================================================== */

type PathwiseSpeechResultEvent = Event & {
  results: SpeechRecognitionResultList;
};

type PathwiseSpeechErrorEvent = Event & {
  error: string;
};

type PathwiseSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;

  start: () => void;
  stop: () => void;
  abort: () => void;

  onstart: (() => void) | null;

  onend: (() => void) | null;

  onerror:
    | ((event: PathwiseSpeechErrorEvent) => void)
    | null;

  onresult:
    | ((event: PathwiseSpeechResultEvent) => void)
    | null;
};

type PathwiseSpeechRecognitionConstructor =
  new () => PathwiseSpeechRecognition;

/* ===============================================================
   VOICE STAGE
=============================================================== */

type VoiceStage =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking";

/* ===============================================================
   CLEAN AI RESPONSE
=============================================================== */

function cleanAssistantResponse(
  text: string,
): string {
  return text
    /*
     * Remove Markdown table separator rows.
     */
    .replace(
      /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/gm,
      "",
    )

    /*
     * Convert Markdown table rows into readable text.
     */
    .replace(
      /^\s*\|(.+)\|\s*$/gm,
      (_match, row: string) => {
        return row
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean)
          .join(" · ");
      },
    )

    /*
     * Remove Markdown headings.
     */
    .replace(
      /^\s*#{1,6}\s*/gm,
      "",
    )

    /*
     * Remove bold Markdown.
     */
    .replace(
      /\*\*(.*?)\*\*/g,
      "$1",
    )

    /*
     * Remove underline-style Markdown.
     */
    .replace(
      /__(.*?)__/g,
      "$1",
    )

    /*
     * Remove italic Markdown.
     */
    .replace(
      /(?<!\*)\*(.*?)\*(?!\*)/g,
      "$1",
    )

    /*
     * Convert Markdown bullets into clean text.
     */
    .replace(
      /^\s*[-*+]\s+/gm,
      "",
    )

    /*
     * Remove horizontal separators.
     */
    .replace(
      /^\s*-{3,}\s*$/gm,
      "",
    )

    /*
     * Remove excessive blank lines.
     */
    .replace(
      /\n{3,}/g,
      "\n\n",
    )

    .trim();
}

/* ===============================================================
   PAGE
=============================================================== */

function CareerCoachPage() {
  const [message, setMessage] =
    useState("");

  const [isTyping, setIsTyping] =
    useState(false);

  const [error, setError] =
    useState("");

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [isLoadingProfile, setIsLoadingProfile] =
    useState(true);

  /* -------------------------------------------------------------
     VOICE
  ------------------------------------------------------------- */

  const [voiceSupported, setVoiceSupported] =
    useState(true);

  const [voiceStage, setVoiceStage] =
    useState<VoiceStage>("idle");

  const [voiceConversationActive, setVoiceConversationActive] =
    useState(false);

  const voiceConversationActiveRef =
    useRef(false);

  const [voiceError, setVoiceError] =
    useState("");

  const recognitionRef =
    useRef<PathwiseSpeechRecognition | null>(
      null,
    );

  const voiceTranscriptRef =
    useRef("");

  const voiceRequestRef =
    useRef(false);

  /* -------------------------------------------------------------
     CHAT
  ------------------------------------------------------------- */

  const [messages, setMessages] =
    useState<Message[]>([
      {
        id: 1,
        role: "assistant",
        text:
          "Welcome to Remo, your AI Career Advisor. I can help you improve your CV, identify skill gaps, prepare for interviews, choose career paths, and plan your next steps.",
      },
    ]);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  /* =============================================================
     PROFILE
  ============================================================= */

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoadingProfile(true);

        const response =
          await api.get("profile/");

        const data:
          | ProfileResponse
          | Profile =
          response.data ?? {};

        if (
          "profile" in data &&
          data.profile
        ) {
          setProfile({
            ...data.profile,

            skills:
              data.skills ??
              data.profile.skills ??
              [],

            experiences:
              data.experiences ??
              data.profile.experiences ??
              [],

            education:
              data.education ??
              data.profile.education ??
              [],

            projects:
              data.projects ??
              data.profile.projects ??
              [],
          });
        } else {
          setProfile(
            data as Profile,
          );
        }
      } catch (requestError) {
        console.error(
          "Failed to load career profile:",
          requestError,
        );

        setError(
          "We couldn't load your career profile. Some recommendations may be limited.",
        );
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, []);

  /* =============================================================
     DERIVED PROFILE DATA
  ============================================================= */

  const fullName =
    profile?.full_name?.trim() ||
    "there";

  const firstName =
    fullName !== "there"
      ? fullName.split(" ")[0]
      : "there";

  const targetRole =
    profile?.target_role?.trim() ||
    "your target career";

  const skills =
    profile?.skills ?? [];

  const experiences =
    profile?.experiences ?? [];

  const projects =
    profile?.projects ?? [];

  const readiness =
    getCareerReadiness(profile);

  const readinessLabel =
    readiness >= 80
      ? "Strong foundation"
      : readiness >= 60
        ? "Good progress"
        : readiness >= 40
          ? "Building momentum"
          : "Getting started";

  const readinessDescription =
    readiness >= 80
      ? `Your profile shows strong progress toward ${targetRole}. Keep strengthening your experience and applications.`
      : readiness >= 60
        ? `You have a solid base for ${targetRole}. Focus on the areas that will make you more competitive.`
        : readiness >= 40
          ? `You're building a useful foundation for ${targetRole}. A few focused improvements can make a big difference.`
          : `Let's strengthen your profile step by step so you're better prepared for ${targetRole}.`;

  /* =============================================================
     ACTIONS
  ============================================================= */

  const actions: Action[] = [
    {
      title: "Improve my CV",
      description:
        "Get practical recommendations to make your CV stronger and more relevant.",
      button: "Review CV",
      prompt:
        `Review my CV for ${targetRole} and tell me the most important improvements I should make.`,
      icon: FileText,
    },
    {
      title: "Find skill gaps",
      description:
        "Discover the skills you should focus on to become more competitive.",
      button: "Analyse skills",
      prompt:
        `Based on my profile and goal of becoming a ${targetRole}, what skill gaps should I focus on first?`,
      icon: TrendingUp,
    },
    {
      title: "Prepare for interviews",
      description:
        "Practice technical and behavioural questions for your target roles.",
      button: "Start practice",
      prompt:
        `Help me prepare for an interview for a ${targetRole} position based on my current experience and skills.`,
      icon: MessageCircle,
    },
    {
      title: "Plan my career",
      description:
        "Build a clear and practical roadmap toward your career goals.",
      button: "Build roadmap",
      prompt:
        `Create a practical career roadmap for becoming a ${targetRole}, based on my current profile, skills, education, projects, and experience.`,
      icon: GraduationCap,
    },
  ];

  /* =============================================================
     CHAT SCROLL
  ============================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  /* =============================================================
     SPEECH RECOGNITION SETUP
  ============================================================= */

  useEffect(() => {
    const speechWindow =
      window as typeof window & {
        SpeechRecognition?: PathwiseSpeechRecognitionConstructor;
        webkitSpeechRecognition?: PathwiseSpeechRecognitionConstructor;
      };

    const SpeechRecognitionAPI =
      speechWindow.SpeechRecognition ??
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setVoiceSupported(false);
      return;
    }

    setVoiceSupported(true);

    const recognition =
      new SpeechRecognitionAPI();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-NG";

    /* -----------------------------------------------------------
       START
    ----------------------------------------------------------- */

    recognition.onstart = () => {
      setVoiceStage("listening");
      setVoiceError("");

      voiceTranscriptRef.current = "";
      voiceRequestRef.current = true;
    };

    /* -----------------------------------------------------------
       RESULT
    ----------------------------------------------------------- */

    recognition.onresult = (
      event: PathwiseSpeechResultEvent,
    ) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (
        let index = 0;
        index < event.results.length;
        index++
      ) {
        const result =
          event.results[index];

        const transcript =
          result[0]?.transcript || "";

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const combined =
        `${finalTranscript} ${interimTranscript}`
          .trim();

      voiceTranscriptRef.current =
        combined;

      setMessage(combined);
    };

    /* -----------------------------------------------------------
       ERROR
    ----------------------------------------------------------- */

    recognition.onerror = (
      event: PathwiseSpeechErrorEvent,
    ) => {
      console.error(
        "Speech recognition error:",
        event.error,
      );

      /*
       * If the user ended the conversation,
       * don't display an error.
       */
      if (
        !voiceConversationActiveRef.current
      ) {
        setVoiceStage("idle");
        return;
      }

      /*
       * no-speech is not a fatal error.
       *
       * We simply return to listening.
       */
      if (
        event.error === "no-speech"
      ) {
        setVoiceStage("listening");

        setTimeout(() => {
          startListeningAutomatically();
        }, 400);

        return;
      }

      if (
        event.error === "not-allowed"
      ) {
        voiceConversationActiveRef.current = false;
        setVoiceConversationActive(false);
        setVoiceStage("idle");

        setVoiceError(
          "Microphone permission was denied. Please allow microphone access in your browser.",
        );

        return;
      }

      if (
        event.error === "audio-capture"
      ) {
        voiceConversationActiveRef.current = false;
        setVoiceConversationActive(false);
        setVoiceStage("idle");

        setVoiceError(
          "No microphone was detected. Please check your microphone.",
        );

        return;
      }

      /*
       * Other errors.
       *
       * Keep voice mode alive where possible.
       */
      setVoiceError(
        "I had trouble hearing you. I'll try listening again.",
      );

      setVoiceStage("listening");

      setTimeout(() => {
        startListeningAutomatically();
      }, 500);
    };

    /* -----------------------------------------------------------
       END
    ----------------------------------------------------------- */

    recognition.onend = () => {
      const transcript =
        voiceTranscriptRef.current.trim();

      /*
       * The user explicitly ended voice mode.
       */
      if (
        !voiceConversationActiveRef.current
      ) {
        voiceTranscriptRef.current = "";
        voiceRequestRef.current = false;
        setVoiceStage("idle");
        return;
      }

      /*
       * Nothing was said.
       *
       * Keep the conversation alive.
       */
      if (!transcript) {
        voiceTranscriptRef.current = "";

        setTimeout(() => {
          startListeningAutomatically();
        }, 300);

        return;
      }

      /*
       * We have a complete voice message.
       */
      setMessage("");

      voiceTranscriptRef.current = "";

      setVoiceStage("thinking");

      sendMessage(
        transcript,
        true,
      );
    };

    recognitionRef.current =
      recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // Ignore cleanup errors.
      }

      recognitionRef.current = null;
    };
  }, []);

  /* =============================================================
     SPEECH SYNTHESIS CLEANUP
  ============================================================= */

  useEffect(() => {
    return () => {
      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* =============================================================
     AUTOMATIC LISTENING
  ============================================================= */

  function startListeningAutomatically() {
    if (
      !voiceConversationActiveRef.current ||
      !recognitionRef.current
    ) {
      return;
    }

    voiceTranscriptRef.current = "";
    voiceRequestRef.current = true;

    setMessage("");
    setVoiceError("");

    setTimeout(() => {
      if (
        !voiceConversationActiveRef.current ||
        !recognitionRef.current
      ) {
        return;
      }

      try {
        recognitionRef.current.start();
      } catch (requestError) {
        /*
         * SpeechRecognition throws when it is already
         * running. This is safe to ignore.
         */
        console.debug(
          "Speech recognition is already active:",
          requestError,
        );
      }
    }, 350);
  }

  /* =============================================================
     SPEAK REMO
  ============================================================= */

  function speakResponse(
    text: string,
  ) {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      if (
        voiceConversationActiveRef.current
      ) {
        startListeningAutomatically();
      } else {
        setVoiceStage("idle");
        voiceRequestRef.current = false;
      }

      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text,
      );

    utterance.lang = "en-NG";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setVoiceStage("speaking");
    };

    utterance.onend = () => {
      /*
       * Keep Remo in the conversation.
       */
      if (
        voiceConversationActiveRef.current
      ) {
        startListeningAutomatically();
      } else {
        setVoiceStage("idle");
        voiceRequestRef.current = false;
      }
    };

    utterance.onerror = () => {
      if (
        voiceConversationActiveRef.current
      ) {
        startListeningAutomatically();
      } else {
        setVoiceStage("idle");
        voiceRequestRef.current = false;
      }
    };

    window.speechSynthesis.speak(
      utterance,
    );
  }

  /* =============================================================
     STOP SPEAKING
  ============================================================= */

  function stopSpeaking() {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    /*
     * If continuous voice mode is active,
     * stopping Remo's speech returns to listening.
     */
    if (
      voiceConversationActiveRef.current
    ) {
      startListeningAutomatically();
    } else {
      voiceRequestRef.current = false;
      setVoiceStage("idle");
    }
  }

  /* =============================================================
     STOP VOICE CONVERSATION
  ============================================================= */

  function stopVoiceConversation() {
    voiceConversationActiveRef.current = false;
    setVoiceConversationActive(false);

    voiceTranscriptRef.current = "";
    voiceRequestRef.current = false;

    /*
     * Stop Remo speaking.
     */
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    /*
     * Stop microphone.
     */
    try {
      recognitionRef.current?.abort();
    } catch {
      // Ignore cleanup errors.
    }

    setMessage("");
    setVoiceStage("idle");
  }

  /* =============================================================
     STOP LISTENING
  ============================================================= */

  function stopListening() {
    /*
     * In continuous mode, this means:
     *
     * "End the voice conversation."
     */
    stopVoiceConversation();
  }

  /* =============================================================
     TOGGLE MICROPHONE
  ============================================================= */

  function toggleListening() {
    if (!voiceSupported) {
      setVoiceError(
        "Voice input is not supported in this browser. Try Google Chrome or Microsoft Edge.",
      );

      return;
    }

    /*
     * If voice mode is already active,
     * pressing the microphone ends the entire
     * voice conversation.
     */
    if (
      voiceConversationActiveRef.current
    ) {
      stopVoiceConversation();
      return;
    }

    setVoiceError("");

    /*
     * Stop any current speech.
     */
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    voiceConversationActiveRef.current = true;
    setVoiceConversationActive(true);

    voiceTranscriptRef.current = "";
    voiceRequestRef.current = true;

    setMessage("");

    try {
      recognitionRef.current?.start();
    } catch (requestError) {
      console.error(
        "Unable to start speech recognition:",
        requestError,
      );

      voiceConversationActiveRef.current = false;
      setVoiceConversationActive(false);
      setVoiceStage("idle");

      setVoiceError(
        "Unable to start the microphone. Please try again.",
      );
    }
  }

  /* =============================================================
     SEND MESSAGE
  ============================================================= */

  async function sendMessage(
    customMessage?: string,
    fromVoice = false,
  ) {
    const text =
      (customMessage ?? message).trim();

    if (!text || isTyping) {
      return;
    }

    setError("");
    setVoiceError("");

    /*
     * Voice requests keep the conversation active.
     */
    if (fromVoice) {
      setVoiceStage("thinking");
      voiceRequestRef.current = true;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setMessage("");
    setIsTyping(true);

    try {
      const response =
        await api.post(
          "advisor/chat/",
          {
            message: text,
          },
        );

      const rawReply =
        response.data?.reply ||
        "I received your message, but I couldn't generate a response.";

      /*
       * Clean Markdown/table formatting before
       * displaying or speaking the response.
       */
      const reply =
        cleanAssistantResponse(
          rawReply,
        );

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: reply,
        },
      ]);

      /*
       * Voice requests make Remo speak.
       *
       * After speaking, he automatically listens again.
       */
      if (fromVoice) {
        speakResponse(reply);
      } else {
        setVoiceStage("idle");
      }
    } catch (requestError: any) {
      console.error(
        "Career Coach error:",
        requestError,
      );

      /*
       * Keep the voice session alive after
       * a temporary backend error.
       */
      if (
        fromVoice &&
        voiceConversationActiveRef.current
      ) {
        setVoiceStage("idle");
      } else {
        voiceRequestRef.current = false;
        setVoiceStage("idle");
      }

      const status =
        requestError?.response?.status;

      const backendError =
        requestError?.response?.data?.error;

      if (status === 401) {
        setError(
          "Your session has expired. Please log in again.",
        );
      } else {
        setError(
          backendError ||
            "I couldn't connect to Remo. Please try again.",
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          text:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);

      /*
       * If voice mode is still active, return to listening
       * after a short delay.
       */
      if (
        fromVoice &&
        voiceConversationActiveRef.current
      ) {
        setTimeout(() => {
          startListeningAutomatically();
        }, 1200);
      }
    } finally {
      setIsTyping(false);
    }
  }

  /* =============================================================
     CLEAR
  ============================================================= */

  function clearConversation() {
    voiceConversationActiveRef.current = false;
    setVoiceConversationActive(false);

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    try {
      recognitionRef.current?.abort();
    } catch {
      // Ignore.
    }

    setVoiceStage("idle");
    voiceRequestRef.current = false;
    voiceTranscriptRef.current = "";

    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text:
          `Conversation cleared. What would you like to work on, ${firstName}?`,
      },
    ]);

    setError("");
    setVoiceError("");
    setMessage("");
  }

  /* =============================================================
     RETRY
  ============================================================= */

  function retryLastMessage() {
    const lastUserMessage =
      [...messages]
        .reverse()
        .find(
          (item) =>
            item.role === "user",
        );

    if (lastUserMessage) {
      sendMessage(
        lastUserMessage.text,
      );
    }
  }

  /* =============================================================
     RENDER
  ============================================================= */

  return (
    <>
      {voiceConversationActive && (
        <VoiceModal
          stage={voiceStage}
          transcript={message}
          onStopListening={stopVoiceConversation}
          onStopSpeaking={stopSpeaking}
        />
      )}

      <main className="min-h-screen w-full bg-[#f4f7f5] text-[#10251b]">
        <div className="w-full px-3 py-3 sm:px-5 lg:px-8 lg:py-5">
          {/* TOP BAR */}
          <header className="mb-4 flex flex-col gap-3 rounded-[26px] border border-[#dce6df] bg-white/90 px-4 py-4 shadow-[0_12px_40px_rgba(16,61,46,0.06)] backdrop-blur-xl sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#103d2e] shadow-lg shadow-[#103d2e]/15">
                <Bot className="h-5 w-5 text-[#19d38f]" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#19d38f]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-[#103d2e] sm:text-xl">Remo</h1>
                  <span className="rounded-full bg-[#19d38f]/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#19d38f]">AI Career Coach</span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {isLoadingProfile ? "Personalizing your workspace..." : `Guidance for ${targetRole}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-[#e1e8e3] bg-[#f8faf8] px-3 py-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-[#19d38f] shadow-[0_0_9px_rgba(25,211,143,0.65)]" />
                <span className="text-[11px] font-bold text-[#315244]">Remo online</span>
              </div>
              {voiceStage === "speaking" && (
                <button type="button" onClick={stopSpeaking} title="Stop Remo speaking" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce6df] bg-white text-[#103d2e] transition hover:border-[#19d38f]/75 hover:bg-[#19d38f]/10">
                  <VolumeX className="h-4 w-4" />
                </button>
              )}
              <button type="button" onClick={clearConversation} title="Clear conversation" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce6df] bg-white text-neutral-500 transition hover:border-[#19d38f]/75 hover:bg-[#19d38f]/10 hover:text-[#103d2e]">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* COMMAND CENTER */}
          <section className="mb-4 overflow-hidden rounded-[28px] bg-[#0b3327] text-white shadow-[0_22px_60px_rgba(11,51,39,0.16)]">
            <div className="relative p-5 sm:p-6 lg:p-7">
              <div className="pointer-events-none absolute -right-28 -top-36 h-96 w-96 rounded-full bg-[#19d38f]/10 blur-3xl" />
              <div className="pointer-events-none absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-[#f4b740]/10 blur-3xl" />

              <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full border border-[#19d38f]/15 bg-[#19d38f]/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#19d38f]">Career command center</span>
                    <span className="hidden h-1 w-1 rounded-full bg-white/25 sm:block" />
                    <span className="hidden text-[10px] font-medium text-white/40 sm:block">Built around your profile</span>
                  </div>
                  <h2 className="max-w-3xl text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                    {isLoadingProfile ? "Analysing your career" : `Move closer to ${targetRole}.`}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-[15px]">
                    {isLoadingProfile ? "We're checking your profile, skills, experience and career information." : readinessDescription}
                  </p>
                </div>

                <div className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-sm sm:min-w-[290px]">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#19d38f]/15 bg-[#19d38f]/5">
                    <div className="absolute inset-2 rounded-full border border-[#19d38f]/10" />
                    <div className="text-center">
                      <span className="block text-2xl font-black tracking-tight text-white">{isLoadingProfile ? "—" : readiness}</span>
                      {!isLoadingProfile && <span className="text-[10px] font-bold text-[#19d38f]">READINESS</span>}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">Current position</p>
                    <p className="mt-1 text-sm font-extrabold text-white">{isLoadingProfile ? "Calculating..." : readinessLabel}</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-linear-to-r from-[#19d38f] to-[#f4b740] transition-all duration-700" style={{ width: `${readiness}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PROFILE SIGNALS */}
          <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ProfileStat label="Target role" value={isLoadingProfile ? "Loading..." : targetRole} icon={Target} />
            <ProfileStat label="Skills" value={isLoadingProfile ? "—" : `${skills.length}`} icon={Sparkles} />
            <ProfileStat label="Experience" value={isLoadingProfile ? "—" : `${experiences.length}`} icon={BriefcaseBusiness} />
            <ProfileStat label="Projects" value={isLoadingProfile ? "—" : `${projects.length}`} icon={TrendingUp} />
          </section>

          {/* MAIN WORKSPACE */}
          <section className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
            {/* LEFT: GUIDANCE */}
            <aside className="space-y-4">
              <div className="rounded-[24px] border border-[#dce6df] bg-white p-5 shadow-[0_12px_40px_rgba(16,61,46,0.05)]">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#19d38f]">Recommended</p>
                    <h3 className="mt-1 text-xl font-black tracking-tight text-[#103d2e]">Your next moves</h3>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#19d38f]/10 text-[#19d38f]"><Target className="h-4 w-4" /></div>
                </div>
                <div className="space-y-2">
                  {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button key={action.title} type="button" disabled={isTyping} onClick={() => sendMessage(action.prompt)} className="group flex w-full items-center gap-3 rounded-2xl border border-[#e7ede8] bg-[#fafcfb] p-3 text-left transition hover:-translate-y-0.5 hover:border-[#19d38f]/35 hover:bg-[#19d38f]/60 disabled:opacity-50">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${index === 1 ? "bg-amber-50 text-amber-600" : "bg-[#19d38f]/10 text-[#19d38f]"}`}><Icon className="h-4 w-4" /></div>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-extrabold text-[#173c2d]">{action.title}</span>
                          <span className="mt-0.5 block truncate text-[10px] text-neutral-400">{action.button}</span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-[#19d38f]" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] bg-[#103d2e] p-5 text-white shadow-[0_16px_45px_rgba(16,61,46,0.13)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Sparkles className="h-4 w-4 text-[#19d38f]" /></div>
                  <div><p className="text-xs font-extrabold">Your profile signals</p><p className="text-[10px] text-white/40">What Remo is using</p></div>
                </div>
                <div className="mt-5 space-y-3">
                  <SignalRow label="Skills identified" value={`${skills.length}`} />
                  <SignalRow label="Experience entries" value={`${experiences.length}`} />
                  <SignalRow label="Projects" value={`${projects.length}`} />
                  <SignalRow label="CV uploaded" value={profile?.resume_uploaded ? "Yes" : "Not yet"} />
                </div>
              </div>
            </aside>

            {/* RIGHT: CHAT */}
            <div className="flex min-h-[calc(100vh-250px)] min-w-0 flex-col overflow-hidden rounded-[28px] border border-[#dce6df] bg-white shadow-[0_18px_55px_rgba(16,61,46,0.07)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8ede9] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#103d2e] shadow-sm">
                    <Bot className="h-5 w-5 text-[#19d38f]" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#19d38f]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#103d2e]">Talk to Remo</h3>
                    <p className="mt-0.5 text-[10px] text-neutral-400">Personalized guidance based on your career profile</p>
                  </div>
                </div>
                <div className="rounded-full bg-[#f5f8f5] px-3 py-1.5 text-[10px] font-bold text-neutral-500">
                  {profile?.target_role ? `Focused on ${profile.target_role}` : "Career guidance"}
                </div>
              </div>

              <div className="border-b border-[#e8ede9] bg-[#fbfcfb] px-5 py-3 sm:px-6">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#4e665b]">
                  <Sparkles className="h-3.5 w-3.5 text-[#19d38f]" />
                  {profile?.target_role ? `What would you like to work on for your ${profile.target_role} career?` : "What would you like to work on today?"}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8faf8] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-4xl space-y-5">
                  {messages.map((item) => <ChatMessage key={item.id} message={item} />)}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {error && (
                <div className="border-t border-[#e8ede9] bg-white px-4 py-3 sm:px-6">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    <span>{error}</span>
                    <button type="button" onClick={retryLastMessage} className="font-extrabold hover:underline">Retry</button>
                  </div>
                </div>
              )}

              {voiceError && voiceStage === "idle" && (
                <div className="border-t border-[#e8ede9] bg-white px-4 py-3 sm:px-6">
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{voiceError}</div>
                </div>
              )}

              <div className="border-t border-[#e8ede9] bg-white px-5 py-4 sm:px-6">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-neutral-400">Quick start</span>
                  <span className="h-px flex-1 bg-[#edf1ed]" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <QuickPrompt text="Improve my CV" onClick={() => sendMessage(`How can I improve my CV for ${targetRole}?`)} disabled={isTyping} />
                  <QuickPrompt text="Find my skill gaps" onClick={() => sendMessage(`What are my biggest skill gaps for becoming a ${targetRole}, and what should I learn next?`)} disabled={isTyping} />
                  <QuickPrompt text="Career advice" onClick={() => sendMessage(`What should I focus on right now to improve my chances of getting a ${targetRole} role?`)} disabled={isTyping} />
                  <QuickPrompt text="Interview prep" onClick={() => sendMessage(`Help me prepare for my next ${targetRole} technical interview.`)} disabled={isTyping} />
                </div>
              </div>

              <div className="border-t border-[#e8ede9] bg-[#fbfcfb] p-4 sm:p-5">
                <div className="mx-auto w-full max-w-4xl">
                  <div className="flex items-end gap-2 rounded-[20px] border border-[#dce6df] bg-white p-2 shadow-sm transition focus-within:border-[#19d38f]/75 focus-within:ring-4 focus-within:ring-[#19d38f]/5">
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                      rows={2}
                      disabled={isTyping || voiceConversationActive}
                      placeholder={voiceStage === "listening" ? "Listening to you..." : voiceStage === "thinking" ? "Remo is thinking..." : voiceStage === "speaking" ? "Remo is speaking..." : "Ask Remo anything about your career..."}
                      className="min-h-14 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-[#173c2d] outline-none placeholder:text-neutral-400"
                    />
                    <button type="button" onClick={toggleListening} disabled={isTyping && !voiceConversationActive} title={!voiceSupported ? "Voice input is not supported" : voiceConversationActive ? "End voice conversation" : "Talk to Remo"} className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${voiceConversationActive ? "border-[#19d38f]/75 bg-[#19d38f] text-[#103d2e] shadow-[0_0_18px_rgba(25,211,143,0.25)]" : "border-[#dce6df] bg-[#f7faf7] text-[#315244] hover:border-[#19d38f]/75 hover:bg-[#19d38f]/10"} disabled:cursor-not-allowed disabled:opacity-30`}>
                      {voiceConversationActive ? <><span className="absolute inset-0 animate-ping rounded-xl bg-[#19d38f]/15" /><MicOff className="relative h-4 w-4" /></> : <Mic className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={() => sendMessage()} disabled={!message.trim() || isTyping || voiceConversationActive} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#103d2e] text-white shadow-sm transition hover:bg-[#0c2f23] disabled:cursor-not-allowed disabled:opacity-30">
                      {isTyping ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between px-1">
                    <p className="text-[9px] text-neutral-400">{voiceConversationActive ? "Voice conversation active · press the microphone to end" : "Enter to send · Shift + Enter for a new line"}</p>
                    <div className="hidden items-center gap-3 sm:flex">
                      <span className="flex items-center gap-1 text-[9px] text-neutral-400"><Sparkles className="h-3 w-3 text-[#19d38f]" />AI-powered</span>
                      {voiceSupported && <span className="flex items-center gap-1 text-[9px] text-neutral-400"><Mic className="h-3 w-3 text-[#19d38f]" />Voice enabled</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-4 flex items-center justify-center gap-2 pb-1 text-[10px] text-neutral-400">
            <BriefcaseBusiness className="h-3 w-3" />
            <span>Remo is here to help you take the next step.</span>
          </div>
        </div>
      </main>
    </>
  );
}

/* ===============================================================
   VOICE MODAL
=============================================================== */

function VoiceModal({
  stage,
  transcript,
  onStopListening,
  onStopSpeaking,
}: {
  stage: VoiceStage;
  transcript: string;
  onStopListening: () => void;
  onStopSpeaking: () => void;
}) {
  const isListening = stage === "listening";
  const isThinking = stage === "thinking";
  const isSpeaking = stage === "speaking";

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-[#06150f]/75 px-4 backdrop-blur-xl">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-[#0b241a] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:p-8">
        <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[#19d38f]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-28 h-80 w-80 rounded-full bg-[#f4b740]/10 blur-3xl" />

        <div className="relative">
          <div className="mb-7 flex justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              {(isListening || isSpeaking) && <span className="absolute inset-0 animate-ping rounded-full bg-[#19d38f]/10" />}
              <span className="absolute inset-4 rounded-full border border-[#19d38f]/15" />
              <span className="absolute inset-8 rounded-full bg-[#19d38f]/10" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#19d38f] text-[#0b241a] shadow-[0_0_55px_rgba(25,211,143,0.35)]">
                {isListening && <Mic className="h-8 w-8" />}
                {isThinking && <Brain className="h-8 w-8 animate-pulse" />}
                {isSpeaking && <Volume2 className="h-8 w-8 animate-pulse" />}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#19d38f]/75" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#19d38f]">{isListening ? "Voice conversation" : isThinking ? "Processing" : "Voice response"}</p>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{isListening ? "Remo is listening" : isThinking ? "Remo is thinking" : "Remo is speaking"}</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">{isListening ? "Speak naturally. When you finish, I'll respond and continue listening." : isThinking ? "Give me a moment while I work on your answer." : "I'm answering you. When I finish, I'll listen for your next message."}</p>
          </div>

          <div className="mt-7 min-h-25 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.15em] text-white/30">{isSpeaking ? "Remo" : "Your message"}</p>
            {isListening && <p className="text-sm leading-6 text-white/85">{transcript || <span className="text-white/30">Start speaking...</span>}</p>}
            {isThinking && <div className="flex items-center gap-2 pt-2"><span className="h-2 w-2 animate-bounce rounded-full bg-[#19d38f]/75" /><span className="h-2 w-2 animate-bounce rounded-full bg-[#19d38f]/75" style={{ animationDelay: "120ms" }} /><span className="h-2 w-2 animate-bounce rounded-full bg-[#19d38f]/75" style={{ animationDelay: "240ms" }} /><span className="ml-2 text-xs text-white/40">Generating your answer...</span></div>}
            {isSpeaking && <div className="flex items-center gap-3"><div className="flex items-end gap-1"><span className="h-3 w-1 animate-pulse rounded-full bg-[#19d38f]/75" /><span className="h-6 w-1 animate-pulse rounded-full bg-[#19d38f]/75" style={{ animationDelay: "100ms" }} /><span className="h-4 w-1 animate-pulse rounded-full bg-[#19d38f]/75" style={{ animationDelay: "200ms" }} /><span className="h-7 w-1 animate-pulse rounded-full bg-[#19d38f]/75" style={{ animationDelay: "300ms" }} /><span className="h-4 w-1 animate-pulse rounded-full bg-[#19d38f]/75" style={{ animationDelay: "400ms" }} /></div><span className="text-sm text-white/65">Playing Remo's response...</span></div>}
          </div>

          {isListening && <button type="button" onClick={onStopListening} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#103d2e] transition hover:bg-[#19d38f]/10"><MicOff className="h-4 w-4" />End voice conversation</button>}
          {isThinking && <button type="button" onClick={onStopListening} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"><MicOff className="h-4 w-4" />End voice conversation</button>}
          {isSpeaking && <div className="mt-7 flex gap-2"><button type="button" onClick={onStopSpeaking} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#103d2e] transition hover:bg-[#19d38f]/10"><VolumeX className="h-4 w-4" />Stop speaking</button><button type="button" onClick={onStopListening} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white/70 transition hover:bg-white/10 hover:text-white" title="End voice conversation"><MicOff className="h-4 w-4" /></button></div>}
          <p className="mt-4 text-center text-[10px] text-white/25">{isListening ? "Remo will keep listening after each response" : isThinking ? "Your conversation will continue automatically" : "Remo will listen again when the response finishes"}</p>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   CAREER READINESS
=============================================================== */

function getCareerReadiness(
  profile: Profile | null,
): number {
  if (!profile) {
    return 0;
  }

  if (
    typeof profile.career_score ===
      "number" &&
    profile.career_score > 0
  ) {
    return clamp(
      profile.career_score,
    );
  }

  const values: number[] = [];

  if (
    typeof profile.profile_completion ===
      "number"
  ) {
    values.push(
      clamp(
        profile.profile_completion,
      ),
    );
  }

  if (
    typeof profile.resume_score ===
      "number" &&
    profile.resume_uploaded
  ) {
    values.push(
      clamp(profile.resume_score),
    );
  }

  if (
    typeof profile.ats_score ===
      "number" &&
    profile.resume_analyzed
  ) {
    values.push(
      clamp(profile.ats_score),
    );
  }

  if (values.length === 0) {
    const checks = [
      Boolean(profile.full_name),
      Boolean(profile.bio),
      Boolean(profile.career_goal),
      Boolean(profile.target_role),
      Boolean(profile.work_preference),
      Boolean(profile.country),
      Boolean(profile.city),
      Boolean(profile.linkedin),
      Boolean(profile.github),
      Boolean(profile.portfolio),
      Boolean(profile.resume_uploaded),
      (profile.skills?.length ?? 0) > 0,
      (profile.experiences?.length ?? 0) > 0,
      (profile.education?.length ?? 0) > 0,
      (profile.projects?.length ?? 0) > 0,
    ];

    const completed =
      checks.filter(Boolean).length;

    return checks.length > 0
      ? Math.round(
          (completed /
            checks.length) *
            100,
        )
      : 0;
  }

  return Math.round(
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / values.length,
  );
}

function clamp(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(
      Math.round(value),
      100,
    ),
  );
}

/* ===============================================================
   PROFILE STAT
=============================================================== */

function ProfileStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Target;
}) {
  return (
    <div className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[#dce6df] bg-white px-4 py-3.5 shadow-[0_8px_25px_rgba(16,61,46,0.04)] transition hover:-translate-y-0.5 hover:border-[#19d38f]/35 hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#19d38f]/10 text-[#19d38f] transition group-hover:bg-[#103d2e] group-hover:text-[#19d38f]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-neutral-400">{label}</p>
        <p className="mt-1 truncate text-sm font-black text-[#173c2d]">{value}</p>
      </div>
    </div>
  );
}

function SignalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <span className="text-[10px] font-medium text-white/45">{label}</span>
      <span className="text-xs font-extrabold text-white">{value}</span>
    </div>
  );
}

/* ===============================================================
   CHAT MESSAGE
=============================================================== */

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mr-3 mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#103d2e] shadow-sm sm:flex">
          <Bot className="h-4 w-4 text-[#19d38f]" />
        </div>
      )}
      <div className={`max-w-[92%] sm:max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {!isUser && <p className="mb-1.5 ml-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#19d38f]">Remo</p>}
        <div className={`rounded-[20px] px-4 py-3.5 text-sm leading-6 shadow-sm ${isUser ? "rounded-br-md bg-[#103d2e] text-white" : "rounded-bl-md border border-[#e1e9e3] bg-white text-[#40564c]"}`}>
          <div className="whitespace-pre-line">{message.text}</div>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   TYPING
=============================================================== */

function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div className="mr-3 hidden h-9 w-9 items-center justify-center rounded-xl bg-[#103d2e] sm:flex">
        <Bot className="h-4 w-4 text-[#19d38f]" />
      </div>
      <div className="rounded-[20px] rounded-bl-md border border-[#e1e9e3] bg-white px-4 py-3.5 shadow-sm">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#19d38f]/100" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#19d38f]/100" style={{ animationDelay: "120ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#19d38f]/100" style={{ animationDelay: "240ms" }} />
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   QUICK PROMPT
=============================================================== */

function QuickPrompt({
  text,
  onClick,
  disabled,
}: {
  text: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="group inline-flex items-center gap-1.5 rounded-full border border-[#dce6df] bg-white px-3.5 py-2 text-[10px] font-extrabold text-[#315244] shadow-sm transition hover:-translate-y-0.5 hover:border-[#19d38f]/75 hover:bg-[#19d38f]/10 hover:text-[#19d38f] disabled:opacity-50">
      {text}
      <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
