import { motion } from "framer-motion";
import {
  FileText,
  Briefcase,
  Brain,
  Mic,
  GraduationCap,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  Trophy,
  Target,
  UserRound,
  BarChart3,
} from "lucide-react";

const featureGroups = [
  {
    icon: UserRound,
    tag: "BUILD YOUR PROFILE",
    title: "Know your career position",
    description:
      "Bring your experience, education, skills, projects, and goals together into one intelligent career profile.",
    features: [
      {
        icon: FileText,
        title: "AI CV Analyzer",
      },
      {
        icon: UserRound,
        title: "Career Profile",
      },
      {
        icon: BarChart3,
        title: "Career Insights & Score",
      },
    ],
  },
  {
    icon: Briefcase,
    tag: "DISCOVER & PREPARE",
    title: "Find and pursue opportunities",
    description:
      "Discover relevant opportunities and get the tools you need to prepare, apply, and move forward with confidence.",
    features: [
      {
        icon: Briefcase,
        title: "Smart Job Matching",
      },
      {
        icon: GraduationCap,
        title: "Scholarship Finder",
      },
      {
        icon: Mic,
        title: "Interview Preparation",
      },
      {
        icon: MessageSquare,
        title: "Career Assistant",
      },
    ],
  },
  {
    icon: Brain,
    tag: "GROW & TAKE ACTION",
    title: "Keep improving every day",
    description:
      "Get personalized guidance, practical challenges, and clear actions that help you continuously build your career.",
    features: [
      {
        icon: Brain,
        title: "AI Career Coach",
      },
      {
        icon: Trophy,
        title: "Daily Career Challenges",
      },
      {
        icon: Target,
        title: "Personalized Career Tasks",
      },
    ],
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-secondary/20 py-24 lg:py-32"
    >
      {/* Background glow */}

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
            Powerful Features
          </span>

          <h2
            className="mt-5 text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything you need to{" "}
            <span className="font-extrabold text-primary">
              move forward
            </span>
          </h2>

          <p className="mt-5 text-base font-medium leading-7 text-muted-foreground sm:text-lg">
            Pathwise brings your entire career journey into one intelligent
            platform — from understanding where you stand to taking your next
            step.
          </p>
        </motion.div>

        {/* =====================================================
            FEATURE GROUPS
        ====================================================== */}

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {featureGroups.map((group, index) => {
            const GroupIcon = group.icon;

            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.1,
                }}
                className="group relative"
              >
                <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-background p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 lg:p-8">
                  {/* Hover glow */}

                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/* Header */}

                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20">
                        <GroupIcon className="h-6 w-6 stroke-[2.5]" />
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary">
                        <ArrowUpRight className="h-4.5 w-4.5 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>

                    <div className="mt-7">
                      <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-primary">
                        {group.tag}
                      </span>

                      <h3
                        className="mt-2 text-2xl font-bold tracking-[-0.02em] text-foreground"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {group.title}
                      </h3>

                      <p className="mt-3 text-[15px] font-medium leading-6.5 text-muted-foreground">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  {/* Feature list */}

                  <div className="relative mt-7 space-y-2.5">
                    {group.features.map((feature, featureIndex) => {
                      const FeatureIcon = feature.icon;

                      return (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.1 + featureIndex * 0.06,
                          }}
                          className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/20 px-3.5 py-3 transition-all duration-300 group-hover:border-primary/10 group-hover:bg-primary/[0.03]"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FeatureIcon className="h-4 w-4 stroke-[2.5]" />
                          </div>

                          <span className="text-sm font-bold text-foreground">
                            {feature.title}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Bottom accent */}

                  <div className="relative mt-7 h-1 w-full overflow-hidden rounded-full bg-border">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "35%" }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.1 + 0.3,
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
            One platform.{" "}
            <span className="font-bold text-foreground">
              Every step of your career journey.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}