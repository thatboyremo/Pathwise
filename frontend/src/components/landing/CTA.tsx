import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Check } from "lucide-react";

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Background glow */}

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] bg-foreground px-6 py-16 shadow-2xl shadow-black/10 sm:px-12 sm:py-20 lg:px-16 lg:py-24"
        >
          {/* =====================================================
              BACKGROUND EFFECTS
          ====================================================== */}

          <motion.div
            aria-hidden
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.35, 0.5, 0.35],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
          />

          <motion.div
            aria-hidden
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
          />

          {/* Decorative grid */}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Floating decorative circles */}

          <motion.div
            aria-hidden
            animate={{
              y: [0, -12, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute right-[12%] top-[18%] hidden h-3 w-3 rounded-full bg-primary/70 shadow-lg shadow-primary/50 sm:block"
          />

          <motion.div
            aria-hidden
            animate={{
              y: [0, 10, 0],
              rotate: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="pointer-events-none absolute bottom-[22%] right-[25%] hidden h-2 w-2 rounded-full bg-primary/50 sm:block"
          />

          {/* =====================================================
              CONTENT
          ====================================================== */}

          <div className="relative z-10 max-w-3xl">
            {/* Badge */}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary"
            >
              <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
              Your next career move starts here
            </motion.div>

            {/* Heading */}

            <h2
              className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] text-background sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to{" "}
              <span className="text-primary">accelerate</span> your career?
            </h2>

            {/* Description */}

            <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-background/70 sm:text-lg">
              Join 50,000+ professionals who have transformed their careers
              with Pathwise. Start your free trial today — no credit card
              required.
            </p>

            {/* Buttons */}

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="group inline-flex h-13 items-center gap-2 rounded-xl bg-primary px-7 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
              >
                Start Free Trial

                <ArrowRight className="h-4.5 w-4.5 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex h-13 items-center gap-2 rounded-xl border border-background/20 bg-background/10 px-7 text-base font-bold text-background backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-background/30 hover:bg-background/15"
              >
                See How It Works
              </a>
            </div>

            {/* Trust points */}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-background/55">
              <span className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
                No credit card required
              </span>

              <span className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
                AI-powered career tools
              </span>

              <span className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
                Built for your career
              </span>
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE VISUAL
          ====================================================== */}

          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 bottom-[-120px] hidden h-[420px] w-[420px] lg:block"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 rounded-full border border-primary/10"
            />

            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-10 rounded-full border border-primary/15 border-dashed"
            />

            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-2xl"
            />

            <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-primary/30 bg-primary/10 shadow-2xl shadow-primary/20 backdrop-blur-md">
              <Sparkles className="h-10 w-10 text-primary stroke-[1.8]" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}