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
} from "lucide-react";

// Fallback for environments where `dashboard` isn't provided globally or via props
const dashboard: any = (globalThis as any).dashboard ?? { user: undefined };

const workspace = [
  {
    label: "Dashboard",
    href: "http://localhost:8080/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "CV Analyzer",
    href: "http://127.0.0.1:8000/analyzer/cv/",
    icon: FileText,
  },
  {
    label: "Mock Interview",
    href: "http://127.0.0.1:8000/interview/",
    icon: MessageSquare,
    active: true,
  },
  {
    label: "Scholarships",
    href: "http://localhost:8080/dashboard/scholarships",
    icon: GraduationCap,
    badge: "12",
  },
  {
    label: "Job Matches",
    href: "http://localhost:8080/jobs",
    icon: Briefcase,
    badge: "12",
  },
  {
    label: "AI Advisor",
    href: "http://localhost:8080/dashboard/coach",
    icon: Sparkles,
    badge: "New",
  },
];

const account = [
  {
    label: "Profile",
    href: "http://localhost:8080/profile",
    icon: User,
  },
  {
    label: "Settings",
    href: "http://localhost:8080/settings",
    icon: Settings,
  },
];

export function DjangoSidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-64 shrink-0 flex-col border-r border-[#e6e7e1] bg-white lg:flex">

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-5 py-6">

        {/* Workspace */}
        <h4 className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-[#8b978f]">
          Workspace
        </h4>

        <ul className="space-y-1">
          {workspace.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                    item.active
                      ? "bg-[#0f3d2e] text-white shadow-md"
                      : "text-[#59655d] hover:bg-[#eef2ec] hover:text-[#0f3d2e]"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      item.active
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
                        item.active
                          ? "bg-white/20 text-white"
                          : "bg-[#eef2ec] text-[#0f3d2e]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Account */}
        <h4 className="mb-3 mt-8 px-2 text-xs font-bold uppercase tracking-widest text-[#8b978f]">
          Account
        </h4>

        <ul className="space-y-1">
          {account.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 text-[#59655d] transition-all duration-200 hover:bg-[#eef2ec] hover:text-[#0f3d2e]"
                >
                  <Icon className="h-5 w-5 text-[#8b978f] group-hover:text-[#0f3d2e]" />

                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

      </div>

      {/* Upgrade Card */}
      <div className="mx-5 mb-5 rounded-2xl bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-5 text-white">

        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4b740]">
          <Crown className="h-5 w-5 text-[#1b1300]" />
        </div>

        <h3 className="font-bold">
          Upgrade to Pro
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-white/80">
          Unlimited AI interviews, premium resume reviews,
          scholarship matching and advanced coaching.
        </p>

        <button className="mt-5 w-full rounded-xl bg-[#f4b740] py-3 text-sm font-bold text-[#1b1300] transition hover:bg-[#efab2f]">
          Upgrade Now
        </button>

      </div>

      {/* User */}
      <div className="flex items-center gap-3">

        {/* Avatar */}
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-950 text-sm font-bold text-amber-300">
          {dashboard?.user?.username
            ? dashboard.user.username.slice(0, 2).toUpperCase()
            : "BR"}
        </div>

        {/* User information */}
        <div className="min-w-0">

          <p className="truncate text-sm font-semibold text-neutral-900">
            {dashboard?.user?.username || "Big Remo"}
          </p>

            <p className="text-xs text-[#7d8a83]">
              AI Engineer
            </p>

        </div>

      </div>

        <a
          href="http://127.0.0.1:8000/login/"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#59655d] transition hover:bg-[#eef2ec] hover:text-[#0f3d2e]"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </a>

    </aside>
  );
}