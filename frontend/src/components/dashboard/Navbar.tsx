import { useEffect, useRef, useState } from "react";

import {
  Search,
  X,
  ChevronDown,
  BriefcaseBusiness,
  Sparkles,
  MapPin,
  LayoutDashboard,
  Activity,
  Bookmark,
  FileText,
  ScanText,
  FolderKanban,
  Target,
  BrainCircuit,
  Mic,
  BarChart3,
  FileCheck2,
  Globe2,
  ClipboardList,
  GraduationCap,
  Award,
  Bot,
  Route,
  MessageCircle,
  UserRound,
  UserRoundCheck,
  Crown,
  Zap,
  Trophy,
} from "lucide-react";

import { Link } from "@tanstack/react-router";

import {
  globalSearch,
  type SearchResult,
} from "@/api/search";

// ============================================================
// TYPES
// ============================================================

type MenuItem = {
  label: string;
  description: string;
  icon: React.ElementType;
  to: string;
  premium?: boolean;
};

// ============================================================
// DASHBOARD
// ============================================================

const dashboardMenu: MenuItem[] = [
  {
    label: "Overview",
    description: "View your complete career dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
  },
  {
    label: "Recent Activity",
    description: "See your latest career activity",
    icon: Activity,
    to: "/dashboard",
  },
  {
    label: "Saved Jobs",
    description: "View jobs you've saved",
    icon: Bookmark,
    to: "/jobs",
  },
  {
    label: "Career Progress",
    description: "Track your professional growth",
    icon: Activity,
    to: "/payment",
    premium: true,
  },
  {
    label: "Application Tracker",
    description: "Track and manage your applications",
    icon: ClipboardList,
    to: "/payment",
    premium: true,
  },
  {
    label: "Career Insights",
    description: "Get AI-powered insights about your career",
    icon: BrainCircuit,
    to: "/payment",
    premium: true,
  },
];

// ============================================================
// CAREER TOOLS
// ============================================================

const careerToolsMenu: MenuItem[] = [
  {
    label: "CV Studio",
    description: "Build and improve your professional CV",
    icon: FileText,
    to: "/dashboard/resume",
  },
  {
    label: "Profile",
    description: "Manage your professional profile",
    icon: UserRound,
    to: "/profile",
  },
  {
    label: "Resume Analyzer",
    description: "Get detailed AI-powered CV feedback",
    icon: ScanText,
    to: "/payment",
    premium: true,
  },
  {
    label: "Portfolio Builder",
    description: "Create a professional portfolio",
    icon: FolderKanban,
    to: "/payment",
    premium: true,
  },
  {
    label: "Career Roadmap",
    description: "Get a personalized career learning path",
    icon: Route,
    to: "/payment",
    premium: true,
  },
  {
    label: "Skill Gap Analyzer",
    description: "Discover the skills you need to develop",
    icon: BrainCircuit,
    to: "/payment",
    premium: true,
  },
  {
    label: "Profile Optimizer",
    description: "Optimize your profile for better opportunities",
    icon: UserRoundCheck,
    to: "/payment",
    premium: true,
  },
];

// ============================================================
// INTERVIEWS
// ============================================================

const interviewsMenu: MenuItem[] = [
  {
    label: "Mock Interview",
    description: "Practice realistic AI-powered interviews",
    icon: Mic,
    to: "/dashboard/interview",
  },
  {
    label: "Interview Practice",
    description: "Practice and improve your interview answers",
    icon: MessageCircle,
    to: "/dashboard/interview",
  },
  {
    label: "AI Interview Coach",
    description: "Get personalized interview coaching",
    icon: Bot,
    to: "/payment",
    premium: true,
  },
  {
    label: "Interview Analytics",
    description: "Analyze your interview performance",
    icon: BarChart3,
    to: "/payment",
    premium: true,
  },
  {
    label: "Interview Reports",
    description: "Get detailed interview performance reports",
    icon: FileCheck2,
    to: "/payment",
    premium: true,
  },
  {
    label: "Interview Insights",
    description: "Discover your strengths and weaknesses",
    icon: Target,
    to: "/payment",
    premium: true,
  },
];

// ============================================================
// JOBS
// ============================================================

const jobsMenu: MenuItem[] = [
  {
    label: "Find Jobs",
    description: "Discover jobs matched to your interests",
    icon: BriefcaseBusiness,
    to: "/jobs",
  },
  {
    label: "Saved Jobs",
    description: "View and manage your saved opportunities",
    icon: Bookmark,
    to: "/jobs",
  },
  {
    label: "Remote Jobs",
    description: "Find remote career opportunities",
    icon: Globe2,
    to: "/jobs",
  },
  {
    label: "Recommended Jobs",
    description: "Get AI-recommended opportunities",
    icon: Target,
    to: "/payment",
    premium: true,
  },
  {
    label: "Job Matching",
    description: "See how well your profile matches a job",
    icon: BrainCircuit,
    to: "/payment",
    premium: true,
  },
  {
    label: "Application Tracker",
    description: "Manage and track your job applications",
    icon: ClipboardList,
    to: "/payment",
    premium: true,
  },
];

// ============================================================
// SCHOLARSHIPS
// ============================================================

const scholarshipsMenu: MenuItem[] = [
  {
    label: "Find Scholarships",
    description: "Browse available scholarships",
    icon: GraduationCap,
    to: "/dashboard/scholarships",
  },
  {
    label: "Funding Opportunities",
    description: "Explore education funding opportunities",
    icon: Award,
    to: "/dashboard/scholarships",
  },
  {
    label: "Recommended Scholarships",
    description: "Get scholarships matched to your profile",
    icon: Target,
    to: "/payment",
    premium: true,
  },
  {
    label: "Scholarship Matcher",
    description: "Find scholarships you're most eligible for",
    icon: BrainCircuit,
    to: "/payment",
    premium: true,
  },
  {
    label: "Scholarship Tracker",
    description: "Track your scholarship applications",
    icon: ClipboardList,
    to: "/payment",
    premium: true,
  },
  {
    label: "Scholarship Insights",
    description: "Get AI-powered scholarship guidance",
    icon: Sparkles,
    to: "/payment",
    premium: true,
  },
];

// ============================================================
// CHALLENGES
// ============================================================

const challengesMenu: MenuItem[] = [
  {
    label: "Daily Challenges",
    description: "Complete challenges and earn XP",
    icon: Zap,
    to: "/challenges",
  },
  {
    label: "Leaderboard",
    description: "See how you rank against other users",
    icon: Trophy,
    to: "/challenges/leaderboard",
  },
];

// ============================================================
// ADVISOR
// ============================================================

const advisorMenu: MenuItem[] = [
  {
    label: "AI Career Advisor",
    description: "Get personalized career guidance",
    icon: Bot,
    to: "/dashboard/coach",
  },
  {
    label: "Career Q&A",
    description: "Ask questions about your career",
    icon: MessageCircle,
    to: "/dashboard/coach",
  },
  {
    label: "Career Planning",
    description: "Build a personalized career strategy",
    icon: Route,
    to: "/payment",
    premium: true,
  },
  {
    label: "Learning Roadmap",
    description: "Build your personalized learning path",
    icon: GraduationCap,
    to: "/payment",
    premium: true,
  },
  {
    label: "Personalized Recommendations",
    description: "Receive AI-powered recommendations",
    icon: Sparkles,
    to: "/payment",
    premium: true,
  },
  {
    label: "Career Strategy",
    description: "Plan your next professional move",
    icon: Target,
    to: "/payment",
    premium: true,
  },
];

// ============================================================
// MEGA MENU
// ============================================================

function MegaMenu({
  items,
  onClose,
}: {
  items: MenuItem[];
  onClose?: () => void;
}) {
  const freeItems = items.filter((item) => !item.premium);
  const premiumItems = items.filter((item) => item.premium);

  return (
    <div
      className="
        absolute
        left-1/2
        top-full
        z-50
        w-155
        -translate-x-1/2
        pt-3
      "
    >
      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-[#dfe7e1]
          bg-white
          shadow-[0_20px_60px_rgba(15,61,46,0.14)]
        "
      >
        {/* HEADER */}

        <div className="border-b border-[#edf1ee] px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-[#e9f1ec]
                text-[#0f3d2e]
              "
            >
              <Sparkles className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#17352b]">
                Explore Pathwise
              </p>

              <p className="text-xs text-[#7b8881]">
                Tools designed to help you grow your career
              </p>
            </div>
          </div>
        </div>

        {/* FEATURES */}

        {freeItems.length > 0 && (
          <div className="px-3 pb-2 pt-4">
            <div className="mb-2 flex items-center gap-2 px-2">
              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#7b8881]
                "
              >
                Features
              </span>

              <div className="h-px flex-1 bg-[#edf1ee]" />
            </div>

            <div className="grid grid-cols-2 gap-1">
              {freeItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={onClose}
                    className="
                      group
                      flex
                      items-start
                      gap-3
                      rounded-xl
                      p-3
                      transition-all
                      duration-150
                      hover:bg-[#f3f7f4]
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#e9f1ec]
                        text-[#0f3d2e]
                        transition-all
                        group-hover:bg-[#0f3d2e]
                        group-hover:text-white
                      "
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-[#17352b]
                        "
                      >
                        {item.label}
                      </p>

                      <p
                        className="
                          mt-0.5
                          line-clamp-2
                          text-xs
                          leading-5
                          text-[#7b8881]
                        "
                      >
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* PREMIUM */}

        {premiumItems.length > 0 && (
          <div className="border-t border-[#edf1ee] px-3 pb-3 pt-4">
            <div className="mb-2 flex items-center gap-2 px-2">
              <Crown className="h-3.5 w-3.5 text-[#c48b18]" />

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[#9a741e]
                "
              >
                Premium
              </span>

              <div className="h-px flex-1 bg-[#f0e7d0]" />
            </div>

            <div className="grid grid-cols-2 gap-1">
              {premiumItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={onClose}
                    className="
                      group
                      flex
                      items-start
                      gap-3
                      rounded-xl
                      p-3
                      transition-all
                      duration-150
                      hover:bg-[#fffaf0]
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#fff4d9]
                        text-[#b47b10]
                        transition-all
                        group-hover:bg-[#f4b740]
                        group-hover:text-[#0f3d2e]
                      "
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-[#17352b]
                          "
                        >
                          {item.label}
                        </p>

                        <span
                          className="
                            shrink-0
                            rounded-full
                            bg-[#fff0c7]
                            px-1.5
                            py-0.5
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-[#9a6900]
                          "
                        >
                          PRO
                        </span>
                      </div>

                      <p
                        className="
                          mt-0.5
                          line-clamp-2
                          text-xs
                          leading-5
                          text-[#7b8881]
                        "
                      >
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* PREMIUM CTA */}

        {premiumItems.length > 0 && (
          <Link
            to="/payment"
            onClick={onClose}
            className="
              mx-3
              mb-3
              flex
              items-center
              justify-between
              rounded-xl
              bg-[#0f3d2e]
              px-4
              py-3.5
              transition-all
              hover:bg-[#123f30]
              hover:shadow-lg
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#f4b740]
                "
              >
                <Sparkles className="h-4 w-4 text-[#0f3d2e]" />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  Unlock Pathwise Premium
                </p>

                <p className="mt-0.5 text-xs text-white/65">
                  Unlock advanced AI tools and insights
                </p>
              </div>
            </div>

            <span
              className="
                rounded-lg
                bg-white/10
                px-3
                py-1.5
                text-xs
                font-bold
                text-[#f4b740]
              "
            >
              Upgrade →
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

// ============================================================
// NAV DROPDOWN
// ============================================================

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: MenuItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="
          flex
          items-center
          gap-1.5
          rounded-lg
          px-3
          py-2
          text-sm
          font-medium
          text-[#526159]
          transition-all
          hover:bg-[#f1f5f2]
          hover:text-[#0f3d2e]
        "
      >
        {label}

        <ChevronDown
          className={`
            h-3.5
            w-3.5
            transition-transform
            duration-200
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {open && (
        <MegaMenu
          items={items}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ============================================================
// NAVBAR
// ============================================================

export function Navbar({
  title: _title = "Dashboard",
}: {
  title?: string;
}) {
  // ==========================================================
  // SEARCH STATE
  // ==========================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>(
    []
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // ==========================================================
  // MOBILE MENU
  // ==========================================================

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ==========================================================
  // GLOBAL SEARCH
  // ==========================================================

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchOpen(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchOpen(true);

        const data = await globalSearch(query);

        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Global search error:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  // ==========================================================
  // CLOSE SEARCH OUTSIDE
  // ==========================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node
        )
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==========================================================
  // SEARCH HELPERS
  // ==========================================================

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
  };

  const handleSearchResultClick = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <header
      className="
        sticky
        top-0
        z-40
        w-full
        border-b
        border-[#e4eae5]
        bg-white/95
        backdrop-blur
      "
    >
      <div
        className="
          mx-auto
          flex
          h-16
          w-full
          items-center
          gap-3
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* ====================================================
            LOGO
        ==================================================== */}

        <Link
          to="/dashboard"
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-[#0f3d2e]
            "
          >
            <Sparkles className="h-4 w-4 text-[#f4b740]" />
          </div>

          <span
            className="
              hidden
              text-base
              font-bold
              tracking-tight
              text-[#0f3d2e]
              sm:block
            "
          >
            Pathwise
          </span>
        </Link>

        {/* ====================================================
            DESKTOP NAVIGATION
        ==================================================== */}

        <nav className="hidden items-center gap-1 md:flex">
          <NavDropdown
            label="Dashboard"
            items={dashboardMenu}
          />

          <NavDropdown
            label="Career Tools"
            items={careerToolsMenu}
          />

          <NavDropdown
            label="Interviews"
            items={interviewsMenu}
          />

          <NavDropdown
            label="Jobs"
            items={jobsMenu}
          />

          <NavDropdown
            label="Scholarships"
            items={scholarshipsMenu}
          />

          <NavDropdown
            label="Challenges"
            items={challengesMenu}
          />

          <NavDropdown
            label="Advisor"
            items={advisorMenu}
          />
        </nav>

        {/* ====================================================
            DESKTOP SEARCH
        ==================================================== */}

        <div
          ref={searchRef}
          className="
            relative
            ml-auto
            hidden
            w-full
            max-w-md
            items-center
            md:flex
            lg:w-80
          "
        >
          <div
            className="
              flex
              h-10
              w-full
              items-center
              rounded-xl
              border
              border-[#dfe7e1]
              bg-[#f7f9f6]
              px-3
              transition
              focus-within:border-[#0f3d2e]
              focus-within:bg-white
            "
          >
            <Search
              className="
                mr-2
                h-4
                w-4
                shrink-0
                text-[#6f7d74]
              "
            />

            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (
                  searchQuery.trim().length >= 2
                ) {
                  setSearchOpen(true);
                }
              }}
              placeholder="Search jobs, skills, coaches…"
              className="
                h-full
                min-w-0
                flex-1
                bg-transparent
                text-sm
                text-[#17352b]
                outline-none
                placeholder:text-[#8b9690]
              "
            />

            {searchLoading && (
              <div
                className="
                  mr-2
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-[#dfe7e1]
                  border-t-[#0f3d2e]
                "
              />
            )}

            {searchQuery && !searchLoading && (
              <button
                type="button"
                onClick={clearSearch}
                className="
                  rounded-md
                  p-1
                  text-[#7a8780]
                  transition
                  hover:bg-[#e9eee9]
                  hover:text-[#0f3d2e]
                "
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* ==================================================
              SEARCH RESULTS
          ================================================== */}

          {searchOpen &&
            searchQuery.trim().length >= 2 && (
              <div
                className="
                  absolute
                  left-0
                  top-[calc(100%+8px)]
                  z-50
                  w-full
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#dfe7e1]
                  bg-white
                  shadow-xl
                "
              >
                {searchLoading ? (
                  <div
                    className="
                      px-4
                      py-7
                      text-center
                      text-sm
                      text-[#6f7d74]
                    "
                  >
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-7 text-center">
                    <Search
                      className="
                        mx-auto
                        mb-2
                        h-5
                        w-5
                        text-[#a1aaa5]
                      "
                    />

                    <p className="text-sm font-medium text-[#17352b]">
                      No results found
                    </p>

                    <p className="mt-1 text-xs text-[#7a8780]">
                      Try a job title, company, location, or skill.
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {/* JOB RESULTS */}

                    {searchResults.some(
                      (result) => result.type === "job"
                    ) && (
                      <div>
                        <div
                          className="
                            px-4
                            pb-2
                            pt-2
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-[#8a968f]
                          "
                        >
                          Jobs
                        </div>

                        {searchResults
                          .filter(
                            (result) =>
                              result.type === "job"
                          )
                          .map((result) => (
                            <Link
                              key={`job-${result.id}`}
                              to={result.url}
                              onClick={
                                handleSearchResultClick
                              }
                              className="
                                flex
                                items-start
                                gap-3
                                px-4
                                py-3
                                transition
                                hover:bg-[#f5f8f5]
                              "
                            >
                              <div
                                className="
                                  mt-0.5
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-[#e9f1ec]
                                  text-[#0f3d2e]
                                "
                              >
                                <BriefcaseBusiness className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className="
                                    truncate
                                    text-sm
                                    font-medium
                                    text-[#17352b]
                                  "
                                >
                                  {result.title}
                                </p>

                                {result.subtitle && (
                                  <p
                                    className="
                                      mt-0.5
                                      truncate
                                      text-xs
                                      text-[#6f7d74]
                                    "
                                  >
                                    {result.subtitle}
                                  </p>
                                )}

                                {result.location && (
                                  <div
                                    className="
                                      mt-1
                                      flex
                                      items-center
                                      gap-1
                                      text-xs
                                      text-[#89948e]
                                    "
                                  >
                                    <MapPin className="h-3 w-3" />

                                    <span className="truncate">
                                      {result.location}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
                      </div>
                    )}

                    {/* SKILLS */}

                    {searchResults.some(
                      (result) => result.type === "skill"
                    ) && (
                      <div className="border-t border-[#edf1ee]">
                        <div
                          className="
                            px-4
                            pb-2
                            pt-3
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-[#8a968f]
                          "
                        >
                          Skills
                        </div>

                        {searchResults
                          .filter(
                            (result) =>
                              result.type === "skill"
                          )
                          .map((result) => (
                            <Link
                              key={`skill-${result.id}`}
                              to={result.url}
                              onClick={
                                handleSearchResultClick
                              }
                              className="
                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                transition
                                hover:bg-[#f5f8f5]
                              "
                            >
                              <div
                                className="
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-[#fff5dc]
                                  text-[#c48b18]
                                "
                              >
                                <Sparkles className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className="
                                    truncate
                                    text-sm
                                    font-medium
                                    text-[#17352b]
                                  "
                                >
                                  {result.title}
                                </p>

                                <p
                                  className="
                                    mt-0.5
                                    text-xs
                                    text-[#6f7d74]
                                  "
                                >
                                  Find jobs requiring this skill
                                </p>
                              </div>
                            </Link>
                          ))}
                      </div>
                    )}

                    {/* SEARCH FOOTER */}

                    <div
                      className="
                        border-t
                        border-[#edf1ee]
                        px-4
                        py-3
                      "
                    >
                      <Link
                        to="/jobs"
                        onClick={
                          handleSearchResultClick
                        }
                        className="
                          text-xs
                          font-semibold
                          text-[#0f3d2e]
                          hover:underline
                        "
                      >
                        Browse all jobs →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* ====================================================
            RIGHT SIDE
        ==================================================== */}

        <div className="flex items-center gap-2.5">
          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (value) => !value
              )
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-[#526159]
              transition
              hover:bg-[#f1f5f2]
              hover:text-[#0f3d2e]
              md:hidden
            "
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <MenuIcon />
            )}
          </button>
        </div>
      </div>

      {/* ======================================================
          MOBILE NAVIGATION
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="
            border-t
            border-[#e4eae5]
            bg-white
            px-4
            py-3
            md:hidden
          "
        >
          <div className="space-y-1">
            <MobileNavLink
              to="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            />

            <MobileNavLink
              to="/dashboard/resume"
              icon={FileText}
              label="CV Studio"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            />

            <MobileNavLink
              to="/dashboard/interview"
              icon={MessageCircle}
              label="Interviews"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            />

            <MobileNavLink
              to="/jobs"
              icon={BriefcaseBusiness}
              label="Jobs"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            />

            <MobileNavLink
              to="/dashboard/scholarships"
              icon={GraduationCap}
              label="Scholarships"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            />

            <MobileNavLink
              to="/challenges"
              icon={Trophy}
              label="Challenges"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            />

            <MobileNavLink
              to="/dashboard/coach"
              icon={Bot}
              label="AI Career Advisor"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            />

            <MobileNavLink
              to="/profile"
              icon={UserRound}
              label="Profile"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            />

            <MobileNavLink
              to="/settings"
              icon={UserRoundCheck}
              label="Settings"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            />
          </div>

          {/* MOBILE SEARCH */}

          <div
            className="
              mt-3
              border-t
              border-[#edf1ee]
              pt-3
            "
          >
            <div
              className="
                flex
                h-10
                items-center
                rounded-xl
                border
                border-[#dfe7e1]
                bg-[#f7f9f6]
                px-3
              "
            >
              <Search
                className="
                  mr-2
                  h-4
                  w-4
                  text-[#6f7d74]
                "
              />

              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search jobs, skills..."
                className="
                  h-full
                  min-w-0
                  flex-1
                  bg-transparent
                  text-sm
                  text-[#17352b]
                  outline-none
                  placeholder:text-[#8b9690]
                "
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="
                    rounded-md
                    p-1
                    text-[#7a8780]
                  "
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* MOBILE RESULTS */}

            {searchOpen &&
              searchQuery.trim().length >= 2 &&
              searchResults.length > 0 && (
                <div
                  className="
                    mt-2
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[#dfe7e1]
                    bg-white
                  "
                >
                  {searchResults.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={result.url}
                      onClick={() => {
                        handleSearchResultClick();
                        setMobileMenuOpen(false);
                      }}
                      className="
                        flex
                        items-center
                        gap-3
                        border-b
                        border-[#edf1ee]
                        px-3
                        py-3
                        last:border-b-0
                        hover:bg-[#f5f8f5]
                      "
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-[#e9f1ec]
                          text-[#0f3d2e]
                        "
                      >
                        {result.type === "job" ? (
                          <BriefcaseBusiness className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            truncate
                            text-sm
                            font-medium
                            text-[#17352b]
                          "
                        >
                          {result.title}
                        </p>

                        {result.subtitle && (
                          <p
                            className="
                              truncate
                              text-xs
                              text-[#78857e]
                            "
                          >
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
          </div>
        </div>
      )}
    </header>
  );
}

// ============================================================
// MOBILE NAV LINK
// ============================================================

function MobileNavLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="
        flex
        items-center
        gap-3
        rounded-xl
        px-3
        py-3
        text-sm
        font-medium
        text-[#526159]
        transition
        hover:bg-[#f4f8f5]
        hover:text-[#0f3d2e]
      "
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

// ============================================================
// MENU ICON
// ============================================================

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
