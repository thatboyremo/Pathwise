import { motion } from "framer-motion";
import {
  Check,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
} from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description:
      "Everything you need to start exploring and improving your career.",
    features: [
      "Basic resume builder",
      "3 AI resume optimizations/month",
      "LinkedIn profile analysis",
      "Career assessment",
      "Basic job matching",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description:
      "Powerful AI tools for serious job seekers ready to accelerate their career.",
    features: [
      "Unlimited AI resume optimizations",
      "Full AI interview coach",
      "Advanced skill gap analysis",
      "Smart job matching",
      "Salary intelligence",
      "Application tracker",
      "Personalized career roadmap",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description:
      "A complete career intelligence solution for teams and organizations.",
    features: [
      "Everything in Pro",
      "Team dashboard & analytics",
      "Custom onboarding",
      "Dedicated account manager",
      "API access",
      "SSO & advanced security",
      "Custom integrations",
      "Enterprise support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-secondary/20 py-24 lg:py-32"
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/6 blur-3xl"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-primary/4 blur-3xl"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-primary/4 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
            Pricing
          </span>

          <h2
            className="mt-4 text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Invest in your{" "}
            <span className="font-extrabold text-primary">
              next opportunity
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-muted-foreground sm:text-lg">
            Start for free and upgrade when you're ready. Simple pricing,
            powerful AI, and no unnecessary commitments.
          </p>
        </motion.div>

        {/* =====================================================
            PRICING CARDS
        ====================================================== */}

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: "easeOut",
              }}
              whileHover={{
                y: plan.popular ? -8 : -5,
              }}
              className="relative"
            >
              {/* Popular glow */}

              {plan.popular && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-1 rounded-[1.1rem] bg-primary/25 opacity-70 blur-xl"
                />
              )}

              {/* Card */}

              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-300 ${
                  plan.popular
                    ? "border-primary/50 bg-gradient-to-b from-primary/[0.07] via-card to-card shadow-2xl shadow-primary/10"
                    : "border-border/80 bg-gradient-to-b from-white to-secondary/20 shadow-lg shadow-black/[0.03] hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8"
                }`}
              >
                {/* Subtle card highlight */}

                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-x-0 top-0 h-px ${
                    plan.popular ? "bg-primary/60" : "bg-border/70"
                  }`}
                />

                {/* Popular badge */}

                {plan.popular && (
                  <div className="absolute right-5 top-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary-foreground shadow-lg shadow-primary/20">
                      <Sparkles className="h-3 w-3 stroke-[2.5]" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan heading */}

                <div className="min-h-36.25">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        plan.popular
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {plan.name === "Pro" ? (
                        <Zap className="h-5 w-5 stroke-[2.5]" />
                      ) : (
                        <Sparkles className="h-5 w-5 stroke-[2.5]" />
                      )}
                    </div>

                    <h3
                      className="text-xl font-extrabold tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {plan.name}
                    </h3>
                  </div>

                  {/* Price */}

                  <div className="mt-6 flex items-baseline gap-1">
                    <span
                      className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {plan.price}
                    </span>

                    {plan.period && (
                      <span className="text-sm font-semibold text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                {/* Divider */}

                <div className="my-6 h-px bg-border/80" />

                {/* Features heading */}

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary stroke-[2.5]" />

                  <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-foreground">
                    What's included
                  </span>
                </div>

                {/* Features */}

                <ul className="mt-5 flex-1 space-y-3.5">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.12 + featureIndex * 0.04,
                      }}
                      className="flex items-start gap-3 text-sm font-medium"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
                      </span>

                      <span className="leading-5 text-muted-foreground">
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA */}

                <a
                  href="#"
                  className={`group mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-all duration-300 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                      : "border border-border bg-background font-bold text-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  {plan.cta}

                  <ArrowRight className="h-4 w-4 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1" />
                </a>

                {/* Small note */}

                <p className="mt-3 text-center text-[10px] font-medium text-muted-foreground/70">
                  {plan.name === "Starter"
                    ? "No credit card required"
                    : plan.name === "Pro"
                      ? "Cancel anytime"
                      : "Built for your organization"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* =====================================================
            BOTTOM TRUST AREA
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
            delay: 0.2,
          }}
          className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
            No hidden fees
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />

          <span className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
            Cancel anytime
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />

          <span className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
            Secure & private
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />

          <span className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />
            AI-powered
          </span>
        </motion.div>
      </div>
    </section>
  );
}