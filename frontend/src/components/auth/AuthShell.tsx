import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
interface AuthShellProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}
export function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505] text-white">
      {/* Grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%)",
        }}
      />
      {/* Green plasma */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 -left-32 h-130 w-130 rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.55), transparent 70%)" }}
      />
      {/* Orange plasma */}
      <motion.div
        aria-hidden
        animate={{ x: [0, -50, 30, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-40 -right-24 h-140 w-140 rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(249,115,22,0.5), transparent 70%)" }}
      />
      {/* Floating ticker strips */}
      <div className="pointer-events-none absolute inset-y-0 left-8 hidden lg:flex flex-col justify-center gap-6">
        {["01 // AUTH", "02 // SECURE", "03 // CAREER OS"].map((t) => (
          <span
            key={t}
            className="rotate-180 text-[10px] font-semibold tracking-[0.4em] text-white/30 [writing-mode:vertical-rl]"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* Left Side */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between pl-8 pr-14 py-14">

        {/* Top */}
        <div>
            <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#4ade80] to-[#f97316] shadow-lg">
                <Sparkles className="h-6 w-6 text-black" />
            </div>

            <div>
                <h2
                className="text-3xl font-extrabold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
                >
                Pathwise
                </h2>

                <p className="text-sm text-white/50">
                AI Career Operating System
                </p>
            </div>
            </Link>
        </div>

        {/* Center */}
        <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
        >

            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#4ade80] font-semibold">
            {eyebrow}
            </p>

            <h1
            className="text-6xl font-black leading-none tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
            >
            Build the career
            <br />

            <span className="bg-linear-to-r from-[#4ade80] via-[#86efac] to-[#f97316] bg-clip-text text-transparent">
                you've always wanted.
            </span>
            </h1>

            <p className="mt-8 text-xl leading-9 text-white/70">
            Pathwise helps you create ATS-friendly resumes,
            optimize LinkedIn, prepare for interviews,
            discover jobs, and accelerate your career using AI.
            </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Professionals */}
            <motion.div
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#090d0b] p-6 shadow-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5"
            >
              {/* Green glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-emerald-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="relative">
                <h3 className="text-4xl font-black tracking-tight text-emerald-400">
                  50K+
                </h3>

                <p className="mt-2 text-sm text-white/50">
                  Professionals
                </p>

                <div className="mt-5 h-px w-full bg-white/10">
                  <div className="h-full w-1/3 bg-emerald-400" />
                </div>
              </div>
            </motion.div>

            {/* Interview Success */}
            <motion.div
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#090d0b] p-6 shadow-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5"
            >
              {/* Green glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-emerald-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="relative">
                <h3 className="text-4xl font-black tracking-tight text-emerald-400">
                  96%
                </h3>

                <p className="mt-2 text-sm text-white/50">
                  Interview Success
                </p>

                <div className="mt-5 h-px w-full bg-white/10">
                  <div className="h-full w-[96%] bg-emerald-400" />
                </div>
              </div>
            </motion.div>

            {/* AI Assistance */}
            <motion.div
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#090d0b] p-6 shadow-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5"
            >
              {/* Green glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-emerald-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="relative">
                <h3 className="text-4xl font-black tracking-tight text-emerald-400">
                  24/7
                </h3>

                <p className="mt-2 text-sm text-white/50">
                  AI Assistance
                </p>

                <div className="mt-5 h-px w-full bg-white/10">
                  <div className="h-full w-1/3 bg-emerald-400" />
                </div>
              </div>
            </motion.div>

          </div>

        </motion.div>

        {/* Bottom */}
        <div className="space-y-40 ">

            <div className="rounded-3xl border border-[#4ade80]/20 bg-linear-to-r from-[#4ade80]/10 to-[#f97316]/10 p-6">

            <p className="text-lg italic leading-8 text-white/80">

                “Pathwise completely changed how I approached job hunting.
                I landed interviews at companies I never imagined.”

            </p>

            <div className="mt-5 flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4ade80] font-bold text-black">
                TO
                </div>

                <div>

                <h4 className="font-bold">
                    Toluwase Overcomer Oluwademilade
                </h4>

                <p className="text-sm text-white/50">
                    MSc Artificial Intelligence and Machine Learning Candidate
                </p>

                </div>

            </div>

            </div>

            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/40">
                <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
                Powered by Artificial Intelligence
            </div>

        </div>

        </div>
        {/* Right: form panel */}
        <div className="relative flex items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full max-w-xl"
          >
            {/* Orange tag */}
            <div className="absolute -top-4 left-6 z-10 -rotate-3 rounded-md bg-[#f97316] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black shadow-[0_10px_30px_-10px_rgba(249,115,22,0.8)]">
              // {eyebrow}
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-8 backdrop-blur-2xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]">
              {/* Green corner accent */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full blur-3xl"
                style={{ background: "rgba(34,197,94,0.35)" }}
              />
              {/* Orange bottom seam */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #f97316 40%, #4ade80 70%, transparent)",
                }}
              />
              <div className="relative">
                <h2
                className="text-5xl font-extrabold tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h2>
                <p className="mt-3 text-base leading-7 text-white/80">{subtitle}</p>
                <div className="mt-8">{children}</div>
                <div className="mt-6 text-center text-sm text-white/60">{footer}</div>
              </div>
            </div>
            {/* Sticky note */}
            <div className="absolute -bottom-6 -right-4 rotate-6 rounded-lg border border-[#f97316]/40 bg-[#f97316]/10 px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-[#fdba74] backdrop-blur">
              ★ join 12k+ pros
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
interface FieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  id: string;
  autoComplete?: string;

  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}
export function Field({
  label,
  type = "text",
  placeholder,
  id,
  autoComplete,
  value,
  onChange,
}: FieldProps) {

  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-bold uppercase tracking-[0.2em] text-white/70">
        {label}
        <span className="h-0.75 w-6 rounded-full bg-linear-to-r from-[#4ade80] to-[#f97316]" />
      </span>
    <input
    id={id}
    type={type}
    placeholder={placeholder}
    autoComplete={autoComplete}
    value={value}
    onChange={onChange}
    className="w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-base font-medium text-white placeholder:text-white/40 outline-none transition-all focus:border-[#f97316]/60 focus:ring-2 focus:ring-[#f97316]/30"
    />
    </label>
  );
}
export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="relative flex w-full items-center justify-center gap-2 rounded-[11px] bg-black px-8 py-4 text-base font-bold text-white transition-all group-hover:bg-black/70"
    >
      <span className="relative flex w-full items-center justify-center gap-2 rounded-[11px] bg-black px-6 py-3.5 text-sm font-semibold text-white transition-all group-hover:bg-black/70">
        {children}
        <span className="h-1.5 w-1.5 rounded-full bg-[#f97316] shadow-[0_0_10px_#f97316]" />
      </span>
    </button>
  );
}
export function SocialRow() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {["Google", "GitHub", "Apple"].map((p) => (
        <button
          key={p}
          type="button"
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-10 backdrop-blur-2xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
export function Divider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
      <span className="h-px flex-1 bg-white/10" />
      {label}
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}



