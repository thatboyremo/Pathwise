import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUp,
  Bot,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  Lightbulb,
  Loader2,
  MessageCircle,
  Sparkles,
  Target,
  User,
} from "lucide-react";

export const Route = createFileRoute("/advisor")({
  component: AdvisorPage,
});

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  {
    label: "Career Advice",
    prompt: "What should I focus on to grow my career?",
    icon: Target,
  },
  {
    label: "Improve My CV",
    prompt: "How can I improve my CV?",
    icon: FileText,
  },
  {
    label: "Job Fit",
    prompt: "How can I improve my chances of getting a job?",
    icon: BriefcaseBusiness,
  },
  {
    label: "Learning Path",
    prompt: "What should I learn next based on my career goals?",
    icon: GraduationCap,
  },
  {
    label: "Interview Prep",
    prompt: "Help me prepare for a technical interview.",
    icon: MessageCircle,
  },
  {
    label: "Project Ideas",
    prompt: "Suggest some projects that would strengthen my portfolio.",
    icon: Lightbulb,
  },
];

function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hey! I'm Remo, your AI Career Advisor. 👋\n\nI can help you with your career, CV, jobs, interviews, learning roadmap, projects, and more.\n\nWhat would you like to work on today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message?: string) => {
    const text = (message ?? input).trim();

    if (!text || loading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/advisor/chat/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            message: text,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to connect to Remo.",
        );
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          data?.reply ||
          "Sorry, I couldn't generate a response right now.",
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Remo error:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please check that the Pathwise backend is running and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="min-h-screen bg-[#f6f8f5] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f3d2e] shadow-sm">
                <Sparkles className="h-6 w-6 text-[#f4b740]" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#0f3d2e] md:text-3xl">
                  Remo
                </h1>

                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-neutral-500">
                    AI Career Advisor
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm text-neutral-500 shadow-sm md:block">
            Your personal career copilot
          </div>
        </div>

        {/* Main */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Chat */}
          <div className="flex min-h-170 flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f3d2e]">
                  <Bot className="h-5 w-5 text-white" />
                </div>

                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div>
                <h2 className="font-semibold text-[#0f3d2e]">
                  Remo
                </h2>
                <p className="text-xs text-neutral-400">
                  Career guidance powered by AI
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-7">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f3d2e]">
                        <Bot className="h-4 w-4 text-[#f4b740]" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 md:max-w-[75%] ${
                        isUser
                          ? "rounded-br-md bg-[#0f3d2e] text-white"
                          : "rounded-bl-md bg-[#f4f7f3] text-neutral-700"
                      }`}
                    >
                      {message.content}
                    </div>

                    {isUser && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f4b740]">
                        <User className="h-4 w-4 text-[#0f3d2e]" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading */}
              {loading && (
                <div className="flex gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f3d2e]">
                    <Bot className="h-4 w-4 text-[#f4b740]" />
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-[#f4f7f3] px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0f3d2e]" />
                    <span className="text-sm text-neutral-500">
                      Remo is thinking...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-neutral-100 bg-white p-4 md:p-5">
              <form
                onSubmit={handleSubmit}
                className="flex items-end gap-3 rounded-2xl border border-neutral-200 bg-[#f8faf7] p-2 transition focus-within:border-[#0f3d2e] focus-within:ring-2 focus-within:ring-emerald-50"
              >
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask Remo anything about your career..."
                  rows={1}
                  disabled={loading}
                  className="max-h-32 min-h-11 flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0f3d2e] text-white transition hover:bg-[#0b3024] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              </form>

              <p className="mt-2 text-center text-[11px] text-neutral-400">
                Remo can make mistakes. Verify important career information.
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <aside className="h-fit rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#d59c25]" />

                <h2 className="font-semibold text-[#0f3d2e]">
                  Quick Start
                </h2>
              </div>

              <p className="text-sm leading-5 text-neutral-500">
                Not sure what to ask? Start with one of these.
              </p>
            </div>

            <div className="space-y-2">
              {quickPrompts.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => sendMessage(item.prompt)}
                    disabled={loading}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-neutral-100 bg-[#fafcf9] p-3 text-left transition hover:border-emerald-100 hover:bg-[#f4f8f3] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff7df] text-[#d59c25] transition group-hover:bg-[#f4b740] group-hover:text-[#0f3d2e]">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[#0f3d2e]">
                        {item.label}
                      </p>

                      <p className="mt-0.5 line-clamp-1 text-xs text-neutral-400">
                        {item.prompt}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tip */}
            <div className="mt-5 rounded-2xl bg-[#0f3d2e] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-[#f4b740]" />

                <span className="text-sm font-semibold text-white">
                  Pro tip
                </span>
              </div>

              <p className="text-xs leading-5 text-emerald-50/80">
                The more specific your question is, the more useful Remo's
                advice will be.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
