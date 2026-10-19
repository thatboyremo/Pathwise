import { motion } from "framer-motion";
import {
  UserRound,
  Sparkles,
  Target,
  ArrowUpRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserRound,
    eyebrow: "BUILD YOUR PROFILE",
    title: "Tell Pathwise where you are",
    description:
      "Upload your resume, add your experience, skills, education, and career goals. Pathwise turns everything into one intelligent career profile.",
  },
  {
    number: "02",
    icon: Sparkles,
    eyebrow: "GET AI-POWERED INSIGHTS",
    title: "Understand your next move",
    description:
      "Pathwise analyzes your profile, identifies skill gaps, evaluates your positioning, and gives you a clearer picture of where you stand.",
  },
  {
    number: "03",
    icon: Target,
    eyebrow: "MOVE WITH PURPOSE",
    title: "Turn insight into opportunity",
    description:
      "Discover relevant opportunities, optimize your applications, prepare for interviews, and move toward your career goals with confidence.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-white py-24 lg:py-32"
    >
      {/* =====================================================
          SUBTLE GREEN BACKGROUND GLOW
      ====================================================== */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            SECTION HEADER
        ====================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
            How Pathwise Works
          </span>

          {/* Heading */}
          <h2
            className="mt-5 text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            From potential to{" "}
            <span className="font-extrabold text-primary">progress</span>
          </h2>

          {/* Description */}
          <p className="mt-5 text-base font-medium leading-7 text-muted-foreground sm:text-lg">
            Pathwise turns your experience, goals, and the job market into a
            clear career strategy — so you spend less time guessing and more
            time moving forward.
          </p>
        </motion.div>

        {/* =====================================================
            STEPS GRID
        ====================================================== */}
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.08,
                }}
                className="group relative"
              >
                <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-background p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 lg:p-9">

                  {/* =================================================
                      HOVER GLOW
                  ================================================== */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/* =================================================
                      TOP
                  ================================================== */}
                  <div className="relative flex items-start justify-between">

                    {/* Icon */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20">
                      <Icon className="h-6 w-6 stroke-[2.5]" />
                    </div>

                    {/* Step Number */}
                    <span
                      className="text-6xl font-extrabold tracking-[-0.04em] text-primary/10"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* =================================================
                      TAG
                  ================================================== */}
                  <div className="relative mt-7">
                    <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-primary">
                      {step.eyebrow}
                    </span>
                  </div>

                  {/* =================================================
                      TITLE
                  ================================================== */}
                  <h3
                    className="relative mt-2 text-2xl font-bold tracking-[-0.02em] text-foreground"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {step.title}
                  </h3>

                  {/* =================================================
                      DESCRIPTION
                  ================================================== */}
                  <p className="relative mt-3 max-w-xl text-[15px] font-medium leading-6.5 text-muted-foreground">
                    {step.description}
                  </p>

                  {/* =================================================
                      BOTTOM
                  ================================================== */}
                  <div className="relative mt-7 flex items-center justify-between border-t border-border pt-5">
                    <span className="text-xs font-bold text-muted-foreground">
                      Step {step.number}
                    </span>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary">
                      <ArrowUpRight className="h-4.5 w-4.5 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  {/* =================================================
                      GREEN ACCENT
                  ================================================== */}
                  <div className="relative mt-5 h-1 w-full overflow-hidden rounded-full bg-border">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "35%" }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.08 + 0.3,
                      }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* =====================================================
            BOTTOM STATEMENT
        ====================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-14 max-w-3xl text-center"
        >
          <p className="text-sm font-medium text-muted-foreground">
            One profile.{" "}
            <span className="font-bold text-foreground">
              A clearer path forward.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}