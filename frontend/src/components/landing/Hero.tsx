import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Briefcase,
  CheckCircle2,
  FileText,
  Menu,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

const GREEN = "#19d38f";

export function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#010302] text-white">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main glow */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-[18%] h-175 w-225 -translate-x-1/2 rounded-full blur-[140px]"
          animate={{
            scale: [0.9, 1.08, 0.92],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "radial-gradient(circle, rgba(25,211,143,0.24), rgba(25,211,143,0.05) 45%, transparent 72%)",
          }}
        />

        {/* Left glow */}
        <motion.div
          aria-hidden
          className="absolute -left-70 top-[35%] h-162.5 w-162.5 rounded-full blur-[120px]"
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
            opacity: [0.08, 0.16, 0.08],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "radial-gradient(circle, rgba(25,211,143,0.18), transparent 68%)",
          }}
        />

        {/* Right glow */}
        <motion.div
          aria-hidden
          className="absolute -right-75 top-[40%] h-162.5 w-162.5 rounded-full blur-[120px]"
          animate={{
            x: [0, -70, 0],
            y: [0, 50, 0],
            opacity: [0.06, 0.15, 0.06],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "radial-gradient(circle, rgba(25,211,143,0.16), transparent 68%)",
          }}
        />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 45%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 45%, transparent 100%)",
          }}
        />

        {/* Top radial fade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 10%, rgba(25,211,143,0.07), transparent 38%)",
          }}
        />

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-75"
          style={{
            background:
              "linear-gradient(to bottom, transparent, #010302 88%)",
          }}
        />
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav className="relative z-50 mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-emerald-400/20 bg-emerald-400/10">
            <motion.div
              className="absolute inset-0 bg-emerald-400/10"
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />

            <Sparkles className="relative h-4 w-4 text-emerald-400" />
          </div>

          <span className="text-lg font-bold tracking-tight">
            Pathwise
          </span>
        </Link>

        {/* Desktop navigation */}
      <div className="hidden items-center gap-8 md:flex">
        <a
          href="#features"
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          Features
        </a>

        <a
          href="#how-it-works"
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          How it works
        </a>

        <a
          href="#pricing"
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          Pricing
        </a>

        <a
          href="#faq"
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          FAQ
        </a>
      </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="group flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_30px_rgba(25,211,143,0.12)] transition-all hover:bg-emerald-300 hover:shadow-[0_0_35px_rgba(25,211,143,0.25)]"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile button */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/3 md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* =========================================================
          MOBILE NAV
      ========================================================= */}

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-50 mx-5 mt-2 rounded-2xl border border-white/10 bg-[#050806]/95 p-4 shadow-2xl backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-1">
            {[
              ["Features", "#features"],
              ["How it works", "#how-it-works"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-white/60 hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            ))}

            <div className="my-2 h-px bg-white/10" />

            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-white/60 hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-1 rounded-xl bg-emerald-400 px-4 py-3 text-center text-sm font-bold text-black"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}

      {/* =========================================================
          HERO CONTENT
      ========================================================= */}

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col items-center px-5 pt-16 sm:px-8 sm:pt-20 lg:px-12 lg:pt-24 xl:px-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-2 shadow-[0_0_30px_rgba(25,211,143,0.05)] backdrop-blur-sm"
        >
          <motion.span
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(25,211,143,0.8)]"
          />

          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
            AI-powered career acceleration
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-7 max-w-5xl text-center text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl md:text-7xl lg:text-[88px] xl:text-[104px]"
        >
          Build Your Career.
          <br />

          <span className="text-white">
            Reach Your{" "}
            <span className="bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 bg-clip-text text-transparent">
              Potential.
            </span>
          </span>

          <br />

          <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
            Smarter. Faster.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.25,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-6 max-w-2xl text-center text-sm leading-7 text-white/45 sm:text-base sm:leading-8 lg:text-lg"
        >
          Pathwise uses AI to help you build a stronger CV, prepare for
          interviews, discover better opportunities, and make smarter career
          decisions — all from one intelligent platform.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.4,
          }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            to="/register"
            className="group flex min-w-[175px] items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-bold text-black shadow-[0_0_40px_rgba(25,211,143,0.15)] transition-all hover:bg-emerald-300 hover:shadow-[0_0_55px_rgba(25,211,143,0.28)]"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/login"
            className="flex min-w-[130px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] px-6 py-3.5 text-sm font-semibold text-white/70 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Trust points */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.6,
          }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          <TrustPoint text="No credit card required" />
          <TrustPoint text="AI-powered" />
          <TrustPoint text="Built for your career" />
        </motion.div>

        {/* =========================================================
            LARGE FULL-WIDTH CAREER VISUAL
        ========================================================= */}

        <CareerIntelligenceVisual />

        {/* =========================================================
            FEATURE CARDS
        ========================================================= */}

        <motion.div
          id="features"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="mt-2 grid w-full max-w-6xl gap-4 pb-20 md:grid-cols-3"
        >
          <FeatureCard
            icon={FileText}
            title="CV Intelligence"
            description="Optimize your resume with AI-powered insights built around your target career."
          />

          <FeatureCard
            icon={Bot}
            title="AI Career Coach"
            description="Get personalized guidance from Remo whenever you need your next career move."
          />

          <FeatureCard
            icon={Briefcase}
            title="Smart Job Matching"
            description="Discover opportunities that better match your skills, experience, and goals."
          />
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================
   TRUST POINT
========================================================= */

function TrustPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/70" />

      <span className="text-[10px] font-medium text-white/35 sm:text-[11px]">
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Bot;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        borderColor: "rgba(25,211,143,0.18)",
      }}
      transition={{
        duration: 0.25,
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-sm"
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-400/[0.04] blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.07]">
          <Icon className="h-4.5 w-4.5 text-emerald-400" />
        </div>

        <h3 className="text-sm font-bold text-white">{title}</h3>

        <p className="mt-2 text-xs leading-6 text-white/35">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   CAREER INTELLIGENCE VISUAL
========================================================= */

function CareerIntelligenceVisual() {
  const signals = [
    {
      label: "CV",
      sub: "94% optimized",
      icon: FileText,
      className:
        "left-[0%] top-[20%] sm:left-[4%] sm:top-[23%] lg:left-[7%] lg:top-[22%] xl:left-[9%]",
      float: {
        x: [0, 24, -12, 0],
        y: [0, -18, 12, 0],
        duration: 7,
      },
    },
    {
      label: "Skills",
      sub: "12 matched",
      icon: Zap,
      className:
        "right-[0%] top-[14%] sm:right-[4%] sm:top-[18%] lg:right-[7%] lg:top-[17%] xl:right-[9%]",
      float: {
        x: [0, -20, 12, 0],
        y: [0, 13, -18, 0],
        duration: 8,
      },
    },
    {
      label: "Jobs",
      sub: "48 matches",
      icon: Briefcase,
      className:
        "left-[0%] bottom-[18%] sm:left-[4%] sm:bottom-[20%] lg:left-[7%] lg:bottom-[20%] xl:left-[9%]",
      float: {
        x: [0, -14, 22, 0],
        y: [0, 15, -10, 0],
        duration: 8.5,
      },
    },
    {
      label: "Growth",
      sub: "+24% signal",
      icon: TrendingUp,
      className:
        "right-[0%] bottom-[17%] sm:right-[4%] sm:bottom-[19%] lg:right-[7%] lg:bottom-[19%] xl:right-[9%]",
      float: {
        x: [0, 18, -16, 0],
        y: [0, -14, 13, 0],
        duration: 7.5,
      },
    },
  ];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 60,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 1.2,
        delay: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative mt-10 h-[440px] w-[calc(100vw-24px)] max-w-[1500px] sm:mt-12 sm:h-[500px] lg:mt-14 lg:h-[560px] xl:h-[600px]"
    >
      {/* =====================================================
          ATMOSPHERIC GLOW
      ===================================================== */}

      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] sm:h-[500px] sm:w-[500px]"
        animate={{
          scale: [0.82, 1.18, 0.88],
          opacity: [0.12, 0.3, 0.12],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(25,211,143,0.34), rgba(25,211,143,0.07) 45%, transparent 72%)",
        }}
      />

      {/* Rotating atmospheric energy */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(25,211,143,0.08) 40deg, transparent 90deg, transparent 170deg, rgba(25,211,143,0.055) 220deg, transparent 280deg)",
          filter: "blur(30px)",
        }}
      />

      {/* Particle field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, transparent 70%)",
        }}
      />

      {/* =====================================================
          ORBITAL RINGS
      ===================================================== */}

      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/[0.08] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(68deg)",
        }}
      >
        <motion.span
          className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-300 shadow-[0_0_22px_rgba(25,211,143,1)]"
          animate={{
            scale: [0.7, 1.5, 0.7],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[220px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-emerald-300/[0.065] sm:h-[320px] sm:w-[560px] lg:h-[390px] lg:w-[700px]"
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 36,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(66deg) rotateY(25deg)",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[420px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-emerald-400/[0.05] sm:h-[560px] sm:w-[300px]"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(65deg)",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-400/[0.055] sm:h-[440px] sm:w-[440px]"
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Inner pulse */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/[0.1] sm:h-[280px] sm:w-[280px]"
        animate={{
          scale: [0.9, 1.08, 0.9],
          opacity: [0.2, 0.65, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Rotating inner energy */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-[300px] sm:w-[300px]"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          borderTop: "1px solid rgba(25,211,143,0.48)",
          borderRight: "1px solid transparent",
          borderBottom: "1px solid rgba(25,211,143,0.08)",
          borderLeft: "1px solid transparent",
        }}
      />

      {/* =====================================================
          CONNECTION BEAMS
      ===================================================== */}

      <ConnectionBeam
        className="left-[10%] top-[30%] w-[35%] rotate-[16deg]"
        delay={0}
      />

      <ConnectionBeam
        className="right-[10%] top-[29%] w-[35%] rotate-[-16deg]"
        delay={1}
      />

      <ConnectionBeam
        className="bottom-[28%] left-[10%] w-[35%] rotate-[-16deg]"
        delay={2}
      />

      <ConnectionBeam
        className="bottom-[28%] right-[10%] w-[35%] rotate-[16deg]"
        delay={3}
      />

      {/* Secondary beams */}
      <ConnectionBeam
        className="left-[22%] top-[48%] w-[24%] rotate-[4deg]"
        delay={1.5}
        subtle
      />

      <ConnectionBeam
        className="right-[22%] top-[48%] w-[24%] rotate-[-4deg]"
        delay={2.5}
        subtle
      />

      {/* =====================================================
          FLOATING SIGNAL CARDS
      ===================================================== */}

      {signals.map((signal, index) => {
        const Icon = signal.icon;

        return (
          <motion.div
            key={signal.label}
            initial={{
              opacity: 0,
              scale: 0.7,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.7,
              delay: 1.1 + index * 0.15,
            }}
            className={`absolute z-30 ${signal.className}`}
          >
            <motion.div
              animate={{
                x: signal.float.x,
                y: signal.float.y,
              }}
              transition={{
                duration: signal.float.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.div
                aria-hidden
                className="absolute -inset-5 rounded-3xl bg-emerald-400/[0.06] blur-2xl"
                animate={{
                  opacity: [0.2, 0.75, 0.2],
                  scale: [0.9, 1.2, 0.9],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.4,
                }}
              />

              <div className="relative flex min-w-[138px] items-center gap-2.5 rounded-2xl border border-white/10 bg-[#050907]/75 px-3 py-2.5 shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:min-w-[170px] sm:px-4 sm:py-3.5">
                <motion.div
                  animate={{
                    rotate: [0, 8, -5, 0],
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-400/10 bg-emerald-400/10 sm:h-10 sm:w-10"
                >
                  <Icon className="h-4 w-4 text-emerald-400" />
                </motion.div>

                <div>
                  <p className="text-[10px] font-bold text-white sm:text-[11px]">
                    {signal.label}
                  </p>

                  <p className="mt-0.5 text-[8px] text-white/35 sm:text-[9px]">
                    {signal.sub}
                  </p>
                </div>

                <motion.span
                  animate={{
                    opacity: [0.25, 1, 0.25],
                    scale: [0.8, 1.25, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.35,
                  }}
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(25,211,143,0.9)]"
                />
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* =====================================================
          CENTRAL REMO CORE
      ===================================================== */}

      <motion.div
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        animate={{
          x: [0, 5, -4, 0],
          y: [-7, 6, -3, -7],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Core outer aura */}
        <motion.div
          aria-hidden
          className="absolute -inset-20 rounded-full sm:-inset-24"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.08, 0.32, 0.08],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "radial-gradient(circle, rgba(25,211,143,0.3), transparent 65%)",
          }}
        />

        {/* Rotating halo */}
        <motion.div
          className="absolute -inset-10 rounded-full border border-emerald-400/10"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="absolute -inset-6 rounded-full border border-dashed border-emerald-400/10"
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Main core */}
        <div
          className="relative grid h-36 w-36 place-items-center rounded-full border border-emerald-300/20 sm:h-48 sm:w-48 lg:h-56 lg:w-56"
          style={{
            background:
              "radial-gradient(circle at 35% 23%, rgba(69,255,180,0.32), rgba(10,35,25,0.92) 38%, #010302 73%)",
            boxShadow:
              "0 0 100px rgba(25,211,143,0.15), inset 0 0 60px rgba(25,211,143,0.1)",
          }}
        >
          {/* Energy rotation */}
          <motion.div
            aria-hidden
            className="absolute inset-5 rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              background:
                "conic-gradient(from 0deg, transparent, rgba(25,211,143,0.2), transparent 25%, rgba(25,211,143,0.12), transparent 55%)",
              filter: "blur(1px)",
            }}
          />

          {/* Inner pulse */}
          <motion.div
            aria-hidden
            className="absolute inset-7 rounded-full border border-emerald-400/10"
            animate={{
              scale: [0.94, 1.05, 0.94],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />

          {/* Bot icon */}
          <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 shadow-[0_0_50px_rgba(25,211,143,0.2)] sm:h-20 sm:w-20">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Bot className="h-8 w-8 text-emerald-300 sm:h-10 sm:w-10" />
            </motion.div>
          </div>

          {/* Highlight */}
          <motion.div
            aria-hidden
            className="absolute left-[21%] top-[12%] h-10 w-20 rotate-[-25deg] rounded-full bg-white/10 blur-xl"
            animate={{
              x: [0, 12, 0],
              opacity: [0.25, 0.65, 0.25],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />

          {/* Label */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center">
            <p className="text-[10px] font-black tracking-[0.35em] text-white sm:text-[11px]">
              REMO
            </p>

            <p className="mt-1 whitespace-nowrap text-[8px] font-medium tracking-[0.2em] text-emerald-400/50">
              CAREER INTELLIGENCE
            </p>
          </div>
        </div>
      </motion.div>

      {/* =====================================================
          FLOATING PARTICLES
      ===================================================== */}

      <FloatingParticles />

      {/* =====================================================
          REMO RECOMMENDATION
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          delay: 2,
        }}
        className="absolute bottom-0 left-1/2 z-40 w-[calc(100%-32px)] max-w-lg -translate-x-1/2"
      >
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex items-center gap-3 rounded-2xl border border-emerald-400/10 bg-[#050906]/75 px-4 py-3.5 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/10">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-emerald-400/60">
              Remo's recommendation
            </p>

            <p className="mt-1 truncate text-[10px] text-white/55 sm:text-[11px]">
              Strengthen your Python + ML skills for your target roles.
            </p>
          </div>

          <motion.div
            animate={{
              x: [0, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="ml-auto"
          >
            <ArrowRight className="h-4 w-4 text-emerald-400" />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   CONNECTION BEAM
========================================================= */

function ConnectionBeam({
  className,
  delay,
  subtle = false,
}: {
  className: string;
  delay: number;
  subtle?: boolean;
}) {
  return (
    <div className={`absolute z-10 h-px ${className}`}>
      <motion.div
        className="absolute inset-0 origin-left"
        style={{
          background: subtle
            ? "linear-gradient(90deg, transparent, rgba(25,211,143,0.12), transparent)"
            : "linear-gradient(90deg, transparent, rgba(25,211,143,0.3), transparent)",
        }}
        animate={{
          scaleX: [0, 1, 0],
          opacity: subtle ? [0, 0.4, 0] : [0, 0.85, 0],
        }}
        transition={{
          duration: 3.5,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(25,211,143,0.9)]"
        animate={{
          left: ["0%", "100%"],
          opacity: [0, subtle ? 0.5 : 1, 0],
        }}
        transition={{
          duration: 3.5,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* =========================================================
   FLOATING PARTICLES
========================================================= */

function FloatingParticles() {
  const particles = [
    { left: 5, top: 14, size: 2, duration: 5, delay: 0 },
    { left: 12, top: 43, size: 1, duration: 6, delay: 1 },
    { left: 18, top: 76, size: 2, duration: 7, delay: 2 },
    { left: 25, top: 11, size: 1, duration: 5.5, delay: 1 },
    { left: 31, top: 35, size: 1, duration: 7, delay: 4 },
    { left: 36, top: 88, size: 2, duration: 6.5, delay: 3 },
    { left: 43, top: 17, size: 1, duration: 5, delay: 2 },
    { left: 48, top: 79, size: 1, duration: 6, delay: 1 },
    { left: 55, top: 9, size: 1, duration: 5, delay: 2 },
    { left: 61, top: 88, size: 2, duration: 7, delay: 1 },
    { left: 67, top: 31, size: 1, duration: 6, delay: 2 },
    { left: 73, top: 13, size: 1, duration: 6, delay: 2 },
    { left: 79, top: 75, size: 2, duration: 6, delay: 2 },
    { left: 86, top: 44, size: 2, duration: 5.5, delay: 0 },
    { left: 93, top: 21, size: 1, duration: 7, delay: 3 },
    { left: 91, top: 78, size: 1, duration: 5, delay: 1 },
  ];

  return (
    <>
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          aria-hidden
          className="absolute rounded-full bg-emerald-300"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            boxShadow: "0 0 10px rgba(25,211,143,0.7)",
          }}
          animate={{
            x: [0, index % 2 === 0 ? 18 : -18, 0],
            y: [0, index % 3 === 0 ? -22 : 22, 0],
            opacity: [0.12, 0.8, 0.12],
            scale: [0.7, 1.5, 0.7],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

export default Hero;