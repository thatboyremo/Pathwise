import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Globe2,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import ScholarshipCard from "@/components/scholarships/ScholarshipCard";
import api from "@/api/axios";

export const Route = createFileRoute("/dashboard/scholarships")({
  component: ScholarshipsPage,
});

type Scholarship = {
  id: number;
  title: string;
  university: string;
  country: string;
  funding: string;
  study_level: string;
  deadline: string | null; 
  description: string;
  website: string;
  featured: boolean;
};

async function getScholarships(): Promise<Scholarship[]> {
  const response = await api.get("scholarships/");
  return response.data;
}

function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [fundingFilter, setFundingFilter] = useState("All");

  useEffect(() => {
    async function loadScholarships() {
      try {
        const data = await getScholarships();
        setScholarships(data);
      } catch (error) {
        console.error("Failed to load scholarships:", error);
      } finally {
        setLoading(false);
      }
    }

    loadScholarships();
  }, []);

  const countries = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          scholarships
            .map((scholarship) => scholarship.country)
            .filter(Boolean),
        ),
      ).sort(),
    ];
  }, [scholarships]);

  const filteredScholarships = useMemo(() => {
    const value = search.toLowerCase().trim();

    return scholarships.filter((scholarship) => {
      const matchesSearch =
        !value ||
        scholarship.title.toLowerCase().includes(value) ||
        scholarship.university.toLowerCase().includes(value) ||
        scholarship.country.toLowerCase().includes(value) ||
        scholarship.description.toLowerCase().includes(value);

      const matchesCountry =
        countryFilter === "All" ||
        scholarship.country === countryFilter;

      const matchesLevel =
        levelFilter === "All" ||
        scholarship.study_level === levelFilter;

      const matchesFunding =
        fundingFilter === "All" ||
        scholarship.funding === fundingFilter;

      return (
        matchesSearch &&
        matchesCountry &&
        matchesLevel &&
        matchesFunding
      );
    });
  }, [
    scholarships,
    search,
    countryFilter,
    levelFilter,
    fundingFilter,
  ]);

  const featuredScholarships = useMemo(() => {
    return scholarships.filter((scholarship) => scholarship.featured);
  }, [scholarships]);

  const upcomingDeadlines = useMemo(() => {
    return scholarships.filter((scholarship) => {
      if (!scholarship.deadline) {
        return false;
      }

      const deadline = new Date(
        scholarship.deadline
      );

      const today = new Date();

      const difference =
        deadline.getTime() -
        today.getTime();

      const days =
        difference /
        (1000 * 60 * 60 * 24);

      return (
        days >= 0 &&
        days <= 30
      );
    }).length;
  }, [scholarships]);

  const clearFilters = () => {
    setSearch("");
    setCountryFilter("All");
    setLevelFilter("All");
    setFundingFilter("All");
  };

  const hasFilters =
    search ||
    countryFilter !== "All" ||
    levelFilter !== "All" ||
    fundingFilter !== "All";

  return (
    <div className="space-y-8 pb-10">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-[#0f3d2e] px-7 py-8 text-white shadow-sm md:px-10 md:py-10">

        {/* Decorative shapes */}

        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#f4b740]/10" />

        <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative max-w-3xl">

          <div className="mb-4 flex items-center gap-2 text-[#f4b740]">
            <Sparkles size={18} />

            <span className="text-sm font-semibold">
              Pathwise Opportunities
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Find scholarships that
            <span className="text-[#f4b740]"> move your career forward.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
            Explore funding opportunities from universities,
            organizations, and scholarship providers to help
            support your education and career goals.
          </p>

          {/* Search */}

          <div className="relative mt-7 max-w-2xl">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search scholarships, universities, or countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 w-full rounded-2xl border border-white/10 bg-white pl-12 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#f4b740]"
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          QUICK STATS
      ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f3d2e]/10 text-[#0f3d2e]">
            <Award size={21} />
          </div>

          <div>
            <p className="text-2xl font-bold text-[#0f3d2e]">
              {scholarships.length}
            </p>

            <p className="text-sm text-gray-500">
              Scholarships available
            </p>
          </div>

        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4b740]/15 text-[#b27b0d]">
            <CalendarDays size={21} />
          </div>

          <div>
            <p className="text-2xl font-bold text-[#0f3d2e]">
              {upcomingDeadlines}
            </p>

            <p className="text-sm text-gray-500">
              Deadlines within 30 days
            </p>
          </div>

        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f3d2e]/10 text-[#0f3d2e]">
            <Globe2 size={21} />
          </div>

          <div>
            <p className="text-2xl font-bold text-[#0f3d2e]">
              {countries.length - 1}
            </p>

            <p className="text-sm text-gray-500">
              Countries represented
            </p>
          </div>

        </div>

      </section>

      {/* =====================================================
          FEATURED
      ===================================================== */}

      {!loading && featuredScholarships.length > 0 && !hasFilters && (
        <section className="space-y-4">

          <div className="flex items-end justify-between">

            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  size={18}
                  className="text-[#f4b740]"
                />

                <h2 className="text-xl font-bold text-[#0f3d2e]">
                  Featured opportunities
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Opportunities worth taking a closer look at.
              </p>
            </div>

          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {featuredScholarships.slice(0, 2).map((scholarship) => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
              />
            ))}
          </div>

        </section>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f3d2e]/10 text-[#0f3d2e]">
              <SlidersHorizontal size={17} />
            </div>

            <div>
              <p className="font-semibold text-[#0f3d2e]">
                Filter opportunities
              </p>

              <p className="text-xs text-gray-500">
                Narrow your scholarship search
              </p>
            </div>

          </div>

          <div className="grid gap-3 sm:grid-cols-3">

            {/* Country */}

            <div className="relative">

              <select
                value={countryFilter}
                onChange={(e) =>
                  setCountryFilter(e.target.value)
                }
                className="h-11 min-w-[170px] appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-sm text-gray-700 outline-none transition focus:border-[#0f3d2e] focus:bg-white"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country === "All"
                      ? "All countries"
                      : country}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

            </div>

            {/* Study level */}

            <div className="relative">

              <select
                value={levelFilter}
                onChange={(e) =>
                  setLevelFilter(e.target.value)
                }
                className="h-11 min-w-[160px] appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-sm text-gray-700 outline-none transition focus:border-[#0f3d2e] focus:bg-white"
              >
                <option value="All">
                  All study levels
                </option>

                <option value="bachelor">
                  Bachelor
                </option>

                <option value="masters">
                  Masters
                </option>

                <option value="phd">
                  PhD
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

            </div>

            {/* Funding */}

            <div className="relative">

              <select
                value={fundingFilter}
                onChange={(e) =>
                  setFundingFilter(e.target.value)
                }
                className="h-11 min-w-[160px] appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-sm text-gray-700 outline-none transition focus:border-[#0f3d2e] focus:bg-white"
              >
                <option value="All">
                  All funding
                </option>

                <option value="full">
                  Fully funded
                </option>

                <option value="partial">
                  Partially funded
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

            </div>

          </div>

        </div>

        {hasFilters && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">

            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-[#0f3d2e]">
                {filteredScholarships.length}
              </span>{" "}
              matching opportunities
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-[#0f3d2e] transition hover:text-[#f4b740]"
            >
              Clear filters
            </button>

          </div>
        )}

      </section>

      {/* =====================================================
          ALL SCHOLARSHIPS
      ===================================================== */}

      <section className="space-y-5">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="flex items-center gap-2">
              <BookOpen
                size={19}
                className="text-[#0f3d2e]"
              />

              <h2 className="text-xl font-bold text-[#0f3d2e]">
                {hasFilters
                  ? "Search results"
                  : "All scholarships"}
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "Finding opportunities for you..."
                : `${filteredScholarships.length} opportunities available`}
            </p>
          </div>

        </div>

        {/* Loading */}

        {loading && (
          <div className="grid gap-5 lg:grid-cols-2">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-white"
              />
            ))}

          </div>
        )}

        {/* Empty */}

        {!loading &&
          filteredScholarships.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f3d2e]/10 text-[#0f3d2e]">
                <Search size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#0f3d2e]">
                No scholarships found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                We couldn't find any opportunities matching
                your current search and filters. Try changing
                your search criteria.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-[#0f3d2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b3327]"
                >
                  Clear filters
                </button>
              )}

            </div>
          )}

        {/* Results */}

        {!loading &&
          filteredScholarships.length > 0 && (
            <div className="grid gap-5 lg:grid-cols-2">

              {filteredScholarships.map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                />
              ))}

            </div>
          )}

      </section>

      {/* =====================================================
          DATA ATTRIBUTION
      ===================================================== */}

      {!loading && scholarships.length > 0 && (
        <div className="border-t border-gray-200 pt-5 text-center">

          <p className="text-xs text-gray-400">
            Scholarship data provided by Open Scholarships
            and sourced from scholarship providers.
          </p>

        </div>
      )}

    </div>
  );
}
