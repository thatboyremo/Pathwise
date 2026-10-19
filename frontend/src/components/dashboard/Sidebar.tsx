import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Sparkles,
  Settings,
  User,
  LogOut,
  Crown,
  X,
  Check,
  ShieldCheck,
  Zap,
  Star,
  ArrowRight,
  CreditCard,
  Target,
  Trophy,
} from "lucide-react";

// ============================================================
// USER TYPE
// ============================================================

type SidebarUser = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role?: string;
  avatar?: string;
};

// ============================================================
// WORKSPACE
// ============================================================

const workspace = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "CV Studio",
    to: "/dashboard/resume",
    icon: FileText,
  },
  {
    label: "Mock Interview",
    to: "/dashboard/interview",
    icon: MessageSquare,
  },
  {
    label: "Scholarships",
    to: "/dashboard/scholarships",
    icon: GraduationCap,
  },
  {
    label: "Job Matches",
    to: "/jobs",
    icon: Briefcase,
  },
  {
    label: "AI Advisor",
    to: "/dashboard/coach",
    icon: Sparkles,
  },
  {
    label: "Daily Challenges",
    to: "/challenges",
    icon: Trophy,
  },
];

// ============================================================
// ACCOUNT
// ============================================================

const account = [
  {
    label: "Profile",
    to: "/profile",
    icon: User,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings,
  },
];

// ============================================================
// BILLING
// ============================================================

type BillingPeriod = "monthly" | "yearly";

// ============================================================
// SIDEBAR
// ============================================================

export function Sidebar({
  user,
}: {
  user?: SidebarUser | null;
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const [showUpgradeModal, setShowUpgradeModal] =
    useState(false);

  const [billingPeriod, setBillingPeriod] =
    useState<BillingPeriod>("yearly");

  // ==========================================================
  // DYNAMIC USER INFORMATION
  // ==========================================================

  const firstName = user?.firstName?.trim() || "";
  const lastName = user?.lastName?.trim() || "";
  const username = user?.username?.trim() || "";
  const email = user?.email?.trim() || "";
  const role = user?.role?.trim() || "";

  const fullName = `${firstName} ${lastName}`.trim();

  const displayName =
    fullName ||
    username ||
    email ||
    "Account";

  // ==========================================================
  // DYNAMIC INITIALS
  // ==========================================================

  const initials = (() => {
    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`
        .toUpperCase();
    }

    if (username) {
      return username.charAt(0).toUpperCase();
    }

    if (email) {
      return email.charAt(0).toUpperCase();
    }

    return "A";
  })();

  // ==========================================================
  // CLOSE MODAL WITH ESCAPE
  // ==========================================================

  useEffect(() => {
    if (!showUpgradeModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowUpgradeModal(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [showUpgradeModal]);

  // ==========================================================
  // PREVENT BACKGROUND SCROLL
  // ==========================================================

  useEffect(() => {
    if (!showUpgradeModal) return;

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [showUpgradeModal]);

  // ==========================================================
  // RENDER NAVIGATION ITEM
  // ==========================================================

  const renderItem = (item: {
    label: string;
    to: string;
    icon: typeof LayoutDashboard;
    badge?: string;
  }) => {
    const Icon = item.icon;

    const isExternal = item.to.startsWith("http");

    const active =
      !isExternal &&
      (pathname === item.to ||
        (item.to !== "/dashboard" &&
          pathname.startsWith(item.to)));

    const content = (
      <>
        <Icon
          className={`h-5 w-5 ${
            active
              ? "text-[#f4b740]"
              : "text-[#8b978f] group-hover:text-[#0f3d2e]"
          }`}
        />

        <span className="flex-1 text-sm font-medium">
          {item.label}
        </span>

        {item.badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              active
                ? "bg-white/20 text-white"
                : "bg-[#eef2ec] text-[#0f3d2e]"
            }`}
          >
            {item.badge}
          </span>
        )}
      </>
    );

    return (
      <li key={item.to}>
        {isExternal ? (
          <a
            href={item.to}
            className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-[#59655d]
              transition-all
              duration-200
              hover:bg-[#eef2ec]
              hover:text-[#0f3d2e]
            "
          >
            {content}
          </a>
        ) : (
          <Link
            to={item.to}
            className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
              active
                ? "bg-[#0f3d2e] text-white shadow-md"
                : "text-[#59655d] hover:bg-[#eef2ec] hover:text-[#0f3d2e]"
            }`}
          >
            {content}
          </Link>
        )}
      </li>
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className="
          sticky
          top-16
          hidden
          h-[calc(100vh-64px)]
          w-64
          shrink-0
          flex-col
          border-r
          border-[#e6e7e1]
          bg-white
          lg:flex
        "
      >
        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {/* =================================================
              WORKSPACE
          ================================================= */}

          <h4
            className="
              mb-3
              px-2
              text-xs
              font-bold
              uppercase
              tracking-widest
              text-[#8b978f]
            "
          >
            Workspace
          </h4>

          <ul className="space-y-1">
            {workspace.map(renderItem)}
          </ul>

          {/* =================================================
              ACCOUNT
          ================================================= */}

          <h4
            className="
              mb-3
              mt-8
              px-2
              text-xs
              font-bold
              uppercase
              tracking-widest
              text-[#8b978f]
            "
          >
            Account
          </h4>

          <ul className="space-y-1">
            {account.map(renderItem)}
          </ul>
        </div>

        {/* ===================================================
            PRO UPGRADE CARD
        =================================================== */}

        <div
          className="
            mx-5
            mb-5
            overflow-hidden
            rounded-2xl
            bg-linear-to-br
            from-emerald-950
            via-emerald-900
            to-emerald-800
            p-5
            text-white
            shadow-[0_15px_35px_-15px_rgba(6,78,59,0.45)]
          "
        >
          <div className="mb-3 flex items-center justify-between">
            <div
              className="
                inline-flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-[#f4b740]
                shadow-lg
                shadow-amber-500/20
              "
            >
              <Crown className="h-5 w-5 text-[#1b1300]" />
            </div>

            <span
              className="
                rounded-full
                border
                border-amber-300/20
                bg-amber-300/10
                px-2.5
                py-1
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-amber-200
              "
            >
              Premium
            </span>
          </div>

          <h3 className="font-bold">
            Upgrade to Pro
          </h3>

          <p
            className="
              mt-2
              text-sm
              leading-relaxed
              text-white/70
            "
          >
            Unlock powerful AI tools designed to
            accelerate your career.
          </p>

          <button
            type="button"
            onClick={() =>
              setShowUpgradeModal(true)
            }
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#f4b740]
              py-3
              text-sm
              font-bold
              text-[#1b1300]
              shadow-lg
              shadow-amber-900/20
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-[#efab2f]
              hover:shadow-xl
            "
          >
            <Crown className="h-4 w-4" />

            Upgrade Now

            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ===================================================
            USER ACCOUNT
        =================================================== */}

        <div
          className="
            border-t
            border-[#eef2ec]
            p-5
          "
        >
          <Link
            to="/profile"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              p-1.5
              transition-colors
              hover:bg-[#f3f5ef]
            "
          >
            {/* Avatar */}

            <div
              className="
                grid
                h-10
                w-10
                shrink-0
                place-items-center
                overflow-hidden
                rounded-full
                bg-emerald-950
                text-sm
                font-bold
                text-amber-300
              "
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${displayName} profile`}
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              ) : (
                initials
              )}
            </div>

            {/* User information */}

            <div className="min-w-0">
              <p
                className="
                  max-w-36
                  truncate
                  text-sm
                  font-semibold
                  text-neutral-900
                "
              >
                {displayName}
              </p>

              {role && (
                <p
                  className="
                    max-w-36
                    truncate
                    text-xs
                    text-neutral-500
                  "
                >
                  {role}
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <div className="px-5 pb-5">
          <Link
            to="/login"
            className="
              group
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              border
              border-transparent
              px-3
              py-3
              text-sm
              font-medium
              text-[#59655d]
              transition-all
              duration-200
              hover:border-[#d8e8df]
              hover:bg-[#eef7f2]
              hover:text-[#0f3d2e]
            "
          >
            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-[#f3f5ef]
                text-[#59655d]
                transition-all
                duration-200
                group-hover:bg-[#dcefe5]
                group-hover:text-[#0f3d2e]
              "
            >
              <LogOut className="h-4.5 w-4.5" />
            </span>

            <span className="flex-1">
              Logout
            </span>
          </Link>
        </div>
      </aside>

      {/* =====================================================
          UPGRADE MODAL
      ===================================================== */}

      {showUpgradeModal && (
        <UpgradeModal
          billingPeriod={billingPeriod}
          setBillingPeriod={setBillingPeriod}
          onClose={() =>
            setShowUpgradeModal(false)
          }
        />
      )}
    </>
  );
}

// ============================================================
// UPGRADE MODAL
// ============================================================

function UpgradeModal({
  billingPeriod,
  setBillingPeriod,
  onClose,
}: {
  billingPeriod: BillingPeriod;
  setBillingPeriod: (
    period: BillingPeriod
  ) => void;
  onClose: () => void;
}) {
  const isYearly = billingPeriod === "yearly";

  const monthlyPrice = 9.99;
  const yearlyPrice = 95.9;

  return (
    <div
      className="
        fixed
        inset-0
        z-100
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/60
        p-4
        backdrop-blur-md
        sm:p-6
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      {/* ===================================================
          MODAL
      =================================================== */}

      <div
        className="
          relative
          my-auto
          w-full
          max-w-5xl
          overflow-hidden
          rounded-[2rem]
          border
          border-white/20
          bg-[#f7f9f6]
          shadow-[0_35px_100px_-25px_rgba(0,0,0,0.55)]
        "
      >
        {/* =================================================
            TOP HERO
        ================================================= */}

        <div
          className="
            relative
            overflow-hidden
            bg-linear-to-br
            from-emerald-950
            via-emerald-900
            to-[#0f4937]
            px-6
            py-8
            text-white
            sm:px-9
            sm:py-9
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-28
              h-80
              w-80
              rounded-full
              bg-emerald-400/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-28
              left-1/3
              h-72
              w-72
              rounded-full
              bg-amber-300/10
              blur-3xl
            "
          />

          {/* Close */}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close upgrade dialog"
            className="
              absolute
              right-5
              top-5
              z-10
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/5
              text-white/70
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative">
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-amber-300/20
                bg-amber-300/10
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-amber-200
              "
            >
              <Sparkles className="h-3.5 w-3.5" />

              Pathwise Pro
            </div>

            <div
              className="
                mt-5
                grid
                gap-6
                lg:grid-cols-[1fr_auto]
                lg:items-end
              "
            >
              <div>
                <h2
                  className="
                    max-w-2xl
                    text-3xl
                    font-bold
                    tracking-tight
                    sm:text-4xl
                  "
                >
                  Your career deserves
                  <span className="text-amber-300">
                    {" "}more.
                  </span>
                </h2>

                <p
                  className="
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-6
                    text-emerald-100/75
                  "
                >
                  Unlock Pathwise's most powerful
                  AI tools and get personalized support
                  throughout your career journey.
                </p>
              </div>

              {/* Mini benefit */}

              <div
                className="
                  hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  p-4
                  lg:block
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#f4b740]
                    "
                  >
                    <Zap className="h-5 w-5 text-[#1b1300]" />
                  </div>

                  <div>
                    <p className="text-xs font-bold">
                      Career acceleration
                    </p>

                    <p className="mt-1 text-[10px] text-white/50">
                      Smarter tools. Better opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            BILLING SWITCH
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-[#e3e9e3]
            bg-white
            px-6
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-9
          "
        >
          <div>
            <p className="text-sm font-bold text-[#103d2e]">
              Choose your plan
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Start with monthly billing or save with
              annual billing.
            </p>
          </div>

          <div
            className="
              inline-flex
              rounded-xl
              border
              border-[#dfe8df]
              bg-[#f7f9f6]
              p-1
            "
          >
            <button
              type="button"
              onClick={() =>
                setBillingPeriod("monthly")
              }
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                !isYearly
                  ? "bg-white text-[#103d2e] shadow-sm"
                  : "text-neutral-400 hover:text-[#103d2e]"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() =>
                setBillingPeriod("yearly")
              }
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                isYearly
                  ? "bg-[#103d2e] text-white shadow-sm"
                  : "text-neutral-400 hover:text-[#103d2e]"
              }`}
            >
              Yearly

              <span
                className={`rounded-full px-1.5 py-0.5 text-[8px] ${
                  isYearly
                    ? "bg-[#f4b740] text-[#1b1300]"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* =================================================
            PLAN COMPARISON
        ================================================= */}

        <div
          className="
            grid
            gap-5
            bg-[#f7f9f6]
            p-6
            sm:p-9
            lg:grid-cols-2
          "
        >
          {/* FREE */}

          <PlanCard
            name="Free"
            description="Everything you need to get started."
            price="$0"
            period="forever"
            features={[
              "Basic CV analysis",
              "Limited AI career advice",
              "Basic job matching",
              "Scholarship discovery",
              "Basic career dashboard",
              "Limited mock interviews",
            ]}
            icon={Target}
          />

          {/* PRO */}

          <PlanCard
            name="Pro"
            description="For serious career growth."
            price={
              isYearly
                ? `$${yearlyPrice.toFixed(2)}`
                : `$${monthlyPrice.toFixed(2)}`
            }
            period={
              isYearly
                ? "per year"
                : "per month"
            }
            popular
            premium
            features={[
              "Unlimited AI mock interviews",
              "Premium CV & resume reviews",
              "Advanced AI career coaching",
              "AI-powered job matching",
              "Personalized learning recommendations",
              "Scholarship matching & alerts",
              "Advanced profile analysis",
              "Priority career recommendations",
              "Unlimited AI career conversations",
            ]}
            icon={Crown}
          />
        </div>

        {/* =================================================
            CTA AREA
        ================================================= */}

        <div
          className="
            border-t
            border-[#e3e9e3]
            bg-white
            px-6
            py-6
            sm:px-9
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div
              className="
                grid
                gap-3
                sm:grid-cols-3
              "
            >
              <TrustItem
                icon={ShieldCheck}
                text="Secure payment"
              />

              <TrustItem
                icon={CreditCard}
                text="Cancel anytime"
              />

              <TrustItem
                icon={Check}
                text="Instant access"
              />
            </div>

            <Link
              to="/payment"
              onClick={onClose}
              className="
                group
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#103d2e]
                px-7
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-emerald-950/15
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-[#18533e]
                hover:shadow-xl
              "
            >
              <Crown className="h-4 w-4 text-[#f4b740]" />

              Upgrade to Pro

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  group-hover:translate-x-0.5
                "
              />
            </Link>
          </div>

          <p
            className="
              mt-4
              text-center
              text-[10px]
              text-neutral-400
              lg:text-right
            "
          >
            You will be redirected to our secure
            checkout to complete your payment.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PLAN CARD
// ============================================================

function PlanCard({
  name,
  description,
  price,
  period,
  features,
  icon: Icon,
  popular = false,
  premium = false,
}: {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  icon: typeof Crown;
  popular?: boolean;
  premium?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.5rem] border p-6 transition ${
        premium
          ? "border-emerald-600 bg-[#103d2e] text-white shadow-[0_20px_50px_-20px_rgba(6,78,59,0.5)]"
          : "border-[#dfe8df] bg-white text-[#103d2e] shadow-sm"
      }`}
    >
      {popular && (
        <div
          className="
            absolute
            right-4
            top-4
            inline-flex
            items-center
            gap-1
            rounded-full
            bg-[#f4b740]
            px-2.5
            py-1
            text-[8px]
            font-bold
            uppercase
            tracking-wider
            text-[#1b1300]
          "
        >
          <Star className="h-2.5 w-2.5 fill-current" />

          Most Popular
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            premium
              ? "bg-white/10 text-[#f4b740]"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3
            className={`text-lg font-bold ${
              premium
                ? "text-white"
                : "text-[#103d2e]"
            }`}
          >
            {name}
          </h3>

          <p
            className={`mt-1 text-xs ${
              premium
                ? "text-emerald-100/60"
                : "text-neutral-400"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-end gap-2">
        <span
          className={`text-3xl font-bold ${
            premium
              ? "text-white"
              : "text-[#103d2e]"
          }`}
        >
          {price}
        </span>

        <span
          className={`mb-1 text-xs ${
            premium
              ? "text-emerald-100/50"
              : "text-neutral-400"
          }`}
        >
          {period}
        </span>
      </div>

      <div
        className={`my-6 border-t ${
          premium
            ? "border-white/10"
            : "border-[#edf1ed]"
        }`}
      />

      <p
        className={`mb-4 text-[10px] font-bold uppercase tracking-wider ${
          premium
            ? "text-emerald-200"
            : "text-neutral-400"
        }`}
      >
        What's included
      </p>

      <ul className="space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5"
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                premium
                  ? "bg-emerald-400/15 text-emerald-200"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <Check className="h-2.5 w-2.5" />
            </span>

            <span
              className={`text-xs leading-5 ${
                premium
                  ? "text-white/75"
                  : "text-neutral-500"
              }`}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================
// TRUST ITEM
// ============================================================

function TrustItem({
  icon: Icon,
  text,
}: {
  icon: typeof ShieldCheck;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-lg
          bg-emerald-50
        "
      >
        <Icon className="h-3.5 w-3.5 text-emerald-700" />
      </div>

      <span
        className="
          text-[10px]
          font-semibold
          text-neutral-500
        "
      >
        {text}
      </span>
    </div>
  );
}