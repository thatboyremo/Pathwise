import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  Crown,
  CreditCard,
  FileText,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/upgrade")({
  component: UpgradePage,

  head: () => ({
    meta: [
      {
        title: "Upgrade to Pro — Pathwise",
      },
      {
        name: "description",
        content:
          "Upgrade your Pathwise account and unlock premium AI career tools.",
      },
    ],
  }),
});

type PlanName = "Free" | "Pro";

type Plan = {
  name: PlanName;
  price: string;
  period: string;
  description: string;
  popular?: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description:
      "Essential tools to help you start and manage your career journey.",
    features: [
      "Basic career profile",
      "Limited CV analysis",
      "Limited AI career advice",
      "Basic job matching",
      "Scholarship discovery",
      "Limited mock interviews",
    ],
  },

  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description:
      "Everything you need to accelerate your career with powerful AI tools.",
    popular: true,
    features: [
      "Unlimited AI career coaching",
      "Unlimited mock interviews",
      "Premium CV reviews",
      "Advanced job matching",
      "Personalized career roadmap",
      "Advanced scholarship matching",
      "AI skill-gap analysis",
      "Priority recommendations",
      "Premium career insights",
    ],
  },
];

function UpgradePage() {
  const [selectedPlan, setSelectedPlan] =
    useState<PlanName>("Pro");

  const selected = plans.find(
    (plan) => plan.name === selectedPlan,
  );

  /*
   * Payment route.
   *
   * This sends the selected plan to:
   *
   * /payment?plan=pro
   *
   * Your payment page can then read the "plan"
   * search parameter and know which plan was selected.
   */
  const paymentUrl =
    selectedPlan === "Pro"
      ? "/payment?plan=pro"
      : "/payment?plan=free";

  return (
    <div className="min-h-screen bg-[#f6f8f5] text-[#10251b]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[#e2e8e1] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#103d2e] transition hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">

            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#103d2e]">
              <Sparkles className="h-4 w-4 text-[#f4b740]" />
            </div>

            <span className="text-lg font-extrabold tracking-tight text-[#103d2e]">
              Pathwise
            </span>

          </div>

          <div className="hidden items-center gap-2 text-xs font-semibold text-neutral-400 sm:flex">

            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />

            Secure checkout

          </div>

        </div>
      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-[#08291e] via-[#103d2e] to-[#18533e] px-6 py-10 text-white shadow-[0_30px_80px_-30px_rgba(8,41,30,0.6)] sm:px-10 lg:px-14 lg:py-14">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#f4b740]/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">

            {/* Badge */}

            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-emerald-100">

              <Crown className="h-4 w-4 text-[#f4b740]" />

              Pathwise Pro

            </div>


            {/* Heading */}

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">

              Invest in the career

              <span className="text-[#f4b740]">
                {" "}you want.
              </span>

            </h1>


            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-emerald-100/75 sm:text-base">

              Unlock powerful AI career tools designed to help you
              build a stronger CV, prepare for interviews, discover
              better jobs and make smarter career decisions.

            </p>


            {/* Hero benefits */}

            <div className="mt-7 flex flex-wrap justify-center gap-3">

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold">

                <Zap className="h-3.5 w-3.5 text-[#f4b740]" />

                Unlimited AI tools

              </div>


              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold">

                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />

                Secure payments

              </div>


              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold">

                <Check className="h-3.5 w-3.5 text-emerald-300" />

                Cancel anytime

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            PRICING
        =================================================== */}

        <section className="mt-10 grid gap-6 lg:grid-cols-2">

          {plans.map((plan) => {

            const isSelected =
              selectedPlan === plan.name;

            return (
              <button
                key={plan.name}
                type="button"
                onClick={() =>
                  setSelectedPlan(plan.name)
                }
                className={`relative rounded-[1.75rem] border p-6 text-left transition-all sm:p-8 ${
                  plan.popular
                    ? "border-[#f4b740] bg-[#103d2e] text-white shadow-[0_25px_60px_-25px_rgba(16,61,46,0.55)]"
                    : isSelected
                      ? "border-emerald-300 bg-white shadow-lg"
                      : "border-[#dfe8df] bg-white hover:border-emerald-200 hover:shadow-md"
                }`}
              >

                {/* Popular badge */}

                {plan.popular && (
                  <div className="absolute right-5 top-5 rounded-full bg-[#f4b740] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#211700]">
                    Most Popular
                  </div>
                )}


                {/* Icon */}

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    plan.popular
                      ? "bg-[#f4b740]"
                      : "bg-emerald-50"
                  }`}
                >

                  <Crown
                    className={`h-5 w-5 ${
                      plan.popular
                        ? "text-[#211700]"
                        : "text-emerald-700"
                    }`}
                  />

                </div>


                {/* Name */}

                <h2
                  className={`mt-5 text-xl font-extrabold ${
                    plan.popular
                      ? "text-white"
                      : "text-[#103d2e]"
                  }`}
                >
                  {plan.name}
                </h2>


                {/* Description */}

                <p
                  className={`mt-2 max-w-md text-xs leading-5 ${
                    plan.popular
                      ? "text-emerald-100/70"
                      : "text-neutral-500"
                  }`}
                >
                  {plan.description}
                </p>


                {/* Price */}

                <div className="mt-7 flex items-end gap-2">

                  <span
                    className={`text-4xl font-extrabold ${
                      plan.popular
                        ? "text-white"
                        : "text-[#103d2e]"
                    }`}
                  >
                    {plan.price}
                  </span>

                  <span
                    className={`pb-1 text-xs ${
                      plan.popular
                        ? "text-emerald-100/60"
                        : "text-neutral-400"
                    }`}
                  >
                    / {plan.period}
                  </span>

                </div>


                {/* Divider */}

                <div className="my-7 h-px bg-current opacity-10" />


                {/* Features */}

                <div className="space-y-3">

                  {plan.features.map((feature) => (

                    <div
                      key={feature}
                      className="flex items-start gap-3"
                    >

                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.popular
                            ? "bg-[#f4b740] text-[#211700]"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >

                        <Check className="h-3 w-3" />

                      </div>


                      <span
                        className={`text-xs leading-5 ${
                          plan.popular
                            ? "text-emerald-50"
                            : "text-neutral-600"
                        }`}
                      >
                        {feature}
                      </span>

                    </div>

                  ))}

                </div>

              </button>
            );

          })}

        </section>


        {/* ===================================================
            CHECKOUT CARD
        =================================================== */}

        <section className="mx-auto mt-8 max-w-3xl rounded-[1.75rem] border border-[#dfe8df] bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* Icon */}

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">

              <CreditCard className="h-5 w-5 text-emerald-700" />

            </div>


            {/* Information */}

            <div className="flex-1">

              <p className="text-sm font-extrabold text-[#103d2e]">

                {selected?.name} plan selected

              </p>

              <p className="mt-1 text-xs leading-5 text-neutral-500">

                {selectedPlan === "Pro"
                  ? "Continue to secure payment to activate Pathwise Pro."
                  : "The Free plan does not require payment."}

              </p>

            </div>


            {/* PAYMENT */}

            {selectedPlan === "Pro" ? (

              <Link
                to="/payment"
                search={{
                  plan: "pro",
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f4b740] px-6 py-3 text-xs font-extrabold text-[#211700] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#efab2f] hover:shadow-md"
              >

                <CreditCard className="h-4 w-4" />

                Continue to payment

              </Link>

            ) : (

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe8df] bg-white px-6 py-3 text-xs font-extrabold text-[#103d2e] shadow-sm transition hover:bg-emerald-50"
              >

                <ArrowLeft className="h-4 w-4" />

                Back to Dashboard

              </Link>

            )}

          </div>

        </section>


        {/* ===================================================
            PRO BENEFITS
        =================================================== */}

        <section className="mx-auto mt-10 max-w-5xl">

          <div className="text-center">

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
              Why Pathwise Pro?
            </p>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#103d2e] sm:text-3xl">
              More tools. Better opportunities.
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-neutral-400">
              Pro gives you deeper AI-powered career support throughout
              your job search and professional development journey.
            </p>

          </div>


          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <BenefitCard
              icon={Sparkles}
              title="AI Career Coach"
              description="Get personalized career guidance based on your goals, skills and experience."
            />

            <BenefitCard
              icon={FileText}
              title="Premium CV Reviews"
              description="Get deeper feedback and actionable improvements for your CV."
            />

            <BenefitCard
              icon={MessageCircle}
              title="Unlimited Interviews"
              description="Practice interviews repeatedly and improve your confidence."
            />

            <BenefitCard
              icon={BriefcaseBusiness}
              title="Advanced Job Matching"
              description="Find opportunities that better match your skills and preferences."
            />

            <BenefitCard
              icon={GraduationCap}
              title="Scholarship Matching"
              description="Discover scholarships that align with your academic and career goals."
            />

            <BenefitCard
              icon={Target}
              title="Skill Gap Analysis"
              description="Identify missing skills and receive recommendations for improvement."
            />

          </div>

        </section>


        {/* ===================================================
            TRUST
        =================================================== */}

        <section className="mt-10 text-center">

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[10px] font-semibold text-neutral-400">

            <span className="inline-flex items-center gap-1.5">

              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />

              Secure checkout

            </span>


            <span className="inline-flex items-center gap-1.5">

              <Check className="h-3.5 w-3.5 text-emerald-600" />

              Cancel anytime

            </span>


            <span className="inline-flex items-center gap-1.5">

              <Zap className="h-3.5 w-3.5 text-emerald-600" />

              Instant Pro access

            </span>

          </div>


          <p className="mt-4 text-[10px] text-neutral-400">

            Prices and availability may vary depending on your location
            and payment provider.

          </p>

        </section>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="mt-12 border-t border-[#e2e8e1] pt-6">

          <div className="flex flex-col items-center justify-between gap-3 text-[10px] text-neutral-400 sm:flex-row">

            <p>
              © {new Date().getFullYear()} Pathwise. All rights reserved.
            </p>

            <div className="flex items-center gap-4">

              <span>Privacy</span>

              <span>Terms</span>

              <span className="inline-flex items-center gap-1">

                <ShieldCheck className="h-3 w-3 text-emerald-600" />

                Secure payments

              </span>

            </div>

          </div>

        </footer>

      </main>

    </div>
  );
}


/* =========================================================
   BENEFIT CARD
========================================================= */

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dfe8df] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">

        <Icon className="h-4.5 w-4.5 text-emerald-700" />

      </div>


      <h3 className="mt-4 text-xs font-extrabold text-[#103d2e]">

        {title}

      </h3>


      <p className="mt-2 text-[10px] leading-5 text-neutral-400">

        {description}

      </p>

    </div>
  );
}