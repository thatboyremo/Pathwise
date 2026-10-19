import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Clock3,
  Filter,
  MapPin,
  Search,
  Sparkles,
  X,
  RefreshCw,
  Star,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getJobs, applyToJob } from "@/api/jobs";

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
});

/* =========================================================
   TYPES
========================================================= */

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  experience?: string;
  salary?: string;
  description?: string;
  requirements?: string;
  skills: string[];
  apply_url: string;
  logo?: string;
  source: string;
  featured: boolean;
  posted_at: string;
  expires_at?: string | null;
};

type JobTypeFilter =
  | "all"
  | "full-time"
  | "part-time"
  | "internship"
  | "contract"
  | "remote";

/* =========================================================
   NORMALIZE API RESPONSE
========================================================= */

function normalizeJobsResponse(data: any): Job[] {
  /*
    Supports:

    [...]
    { results: [...] }
    { data: [...] }
    { data: { results: [...] } }

    This prevents the frontend from incorrectly
    displaying "No jobs available" when jobs exist.
  */

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results;
  }

  return [];
}

/* =========================================================
   PAGE
========================================================= */

function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [locationSearch, setLocationSearch] =
    useState("");

  const [jobType, setJobType] =
    useState<JobTypeFilter>("all");

  const [showFilters, setShowFilters] =
    useState(false);

  /* =======================================================
     LOAD JOBS
  ======================================================= */

  async function loadJobs() {
    try {
      setLoading(true);
      setError("");

      const response = await getJobs();

      console.log(
        "JOBS API RAW RESPONSE:",
        response
      );

      const normalizedJobs =
        normalizeJobsResponse(response);

      console.log(
        "NORMALIZED JOBS:",
        normalizedJobs.length
      );

      setJobs(normalizedJobs);

    } catch (error) {
      console.error(
        "FAILED TO LOAD JOBS:",
        error
      );

      setJobs([]);

      setError(
        "Unable to load jobs. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadJobs();
  }, []);

  /* =======================================================
     FILTER JOBS
  ======================================================= */

  const filteredJobs = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const location =
      locationSearch.trim().toLowerCase();

    return jobs.filter((job) => {

      const searchableText = [
        job.title,
        job.company,
        job.location,
        job.type,
        job.experience,
        job.salary,
        job.description,
        job.requirements,
        job.source,
        ...(job.skills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      const matchesLocation =
        !location ||
        job.location
          ?.toLowerCase()
          .includes(location);

      const normalizedType =
        job.type
          ?.toLowerCase()
          .replace(/\s+/g, "-");

      const matchesType =
        jobType === "all" ||
        normalizedType === jobType;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesType
      );
    });
  }, [
    jobs,
    search,
    locationSearch,
    jobType,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const remoteJobs = jobs.filter((job) =>
    job.type
      ?.toLowerCase()
      .includes("remote")
  ).length;

  const companies = new Set(
    jobs
      .map((job) => job.company)
      .filter(Boolean)
  ).size;

  const featuredJobs = jobs.filter(
    (job) => job.featured
  ).length;

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {
    setSearch("");
    setLocationSearch("");
    setJobType("all");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <DashboardLayout title="Jobs">

      <div className="min-h-full space-y-8 pb-12">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-[2rem] bg-[#0b3327] px-7 py-9 text-white shadow-sm sm:px-10 sm:py-11">

          {/* Green glow */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

          {/* GOLD / ORANGE GLOW */}

          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-[#f4b740]/10 blur-3xl" />

          <div className="relative">

            {/* LABEL */}

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-emerald-100 backdrop-blur">

              <Sparkles className="h-3.5 w-3.5 text-[#f4b740]" />

              CAREER OPPORTUNITIES

            </div>

            {/* HEADING */}

            <h1 className="mt-6 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">

              Find your next{" "}

              <span className="font-['Instrument_Serif',ui-serif,Georgia,serif] italic text-[#f4b740]">

                opportunity.

              </span>

            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/70 sm:text-base">

              Search job opportunities from different
              companies and discover roles that match
              what you're looking for.

            </p>

            {/* SEARCH */}

            <div className="mt-8 max-w-4xl">

              <div className="grid gap-3 md:grid-cols-[1fr_0.7fr]">

                {/* JOB SEARCH */}

                <div className="relative">

                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-900/50" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search jobs, companies, skills..."
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white pl-12 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:ring-4 focus:ring-[#f4b740]/20"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                </div>

                {/* LOCATION */}

                <div className="relative">

                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-900/50" />

                  <input
                    value={locationSearch}
                    onChange={(event) =>
                      setLocationSearch(
                        event.target.value
                      )
                    }
                    placeholder="Location..."
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white pl-12 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:ring-4 focus:ring-[#f4b740]/20"
                  />

                </div>

              </div>

            </div>

            {/* STATS */}

            <div className="mt-7 flex flex-wrap gap-3">

              <HeroStat
                icon={Briefcase}
                value={jobs.length}
                label="Jobs available"
              />

              <HeroStat
                icon={Building2}
                value={companies}
                label="Companies"
              />

              <HeroStat
                icon={Star}
                value={featuredJobs}
                label="Featured jobs"
              />

              <HeroStat
                icon={MapPin}
                value={remoteJobs}
                label="Remote jobs"
              />

            </div>

          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadJobs}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#0b3327] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0f4536]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>

          </div>
        )}

        {/* =================================================
            TOOLBAR
        ================================================= */}

        {!loading && jobs.length > 0 && (

          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold text-[#0b3327]">

                {filteredJobs.length.toLocaleString()}{" "}

                {filteredJobs.length === 1
                  ? "opportunity"
                  : "opportunities"}{" "}
                found

              </p>

              <p className="mt-1 text-xs text-neutral-500">

                Search across all available jobs

              </p>

            </div>

            <div className="flex flex-wrap items-center gap-2">

              {/* FILTER BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
                }
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  showFilters
                    ? "border-[#f4b740]/40 bg-[#fff8e7] text-[#9b6d08]"
                    : "border-[#dfe3dd] bg-white text-[#0b3327] hover:border-[#f4b740]/40 hover:bg-[#fffaf0]"
                }`}
              >

                <Filter className="h-4 w-4" />

                Filters

              </button>

              {/* DESKTOP FILTERS */}

              <div className="hidden items-center gap-2 lg:flex">

                <FilterButton
                  active={jobType === "all"}
                  onClick={() =>
                    setJobType("all")
                  }
                >
                  All
                </FilterButton>

                <FilterButton
                  active={
                    jobType === "full-time"
                  }
                  onClick={() =>
                    setJobType("full-time")
                  }
                >
                  Full-time
                </FilterButton>

                <FilterButton
                  active={
                    jobType === "part-time"
                  }
                  onClick={() =>
                    setJobType("part-time")
                  }
                >
                  Part-time
                </FilterButton>

                <FilterButton
                  active={
                    jobType === "contract"
                  }
                  onClick={() =>
                    setJobType("contract")
                  }
                >
                  Contract
                </FilterButton>

                <FilterButton
                  active={
                    jobType === "internship"
                  }
                  onClick={() =>
                    setJobType("internship")
                  }
                >
                  Internship
                </FilterButton>

                <FilterButton
                  active={
                    jobType === "remote"
                  }
                  onClick={() =>
                    setJobType("remote")
                  }
                >
                  Remote
                </FilterButton>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            MOBILE FILTERS
        ================================================= */}

        {showFilters &&
          !loading &&
          jobs.length > 0 && (

            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              className="overflow-hidden"
            >

              <div className="rounded-2xl border border-[#e6e7e1] bg-white p-4">

                <div className="flex flex-wrap gap-2">

                  <FilterButton
                    active={jobType === "all"}
                    onClick={() =>
                      setJobType("all")
                    }
                  >
                    All jobs
                  </FilterButton>

                  <FilterButton
                    active={
                      jobType === "full-time"
                    }
                    onClick={() =>
                      setJobType("full-time")
                    }
                  >
                    Full-time
                  </FilterButton>

                  <FilterButton
                    active={
                      jobType === "part-time"
                    }
                    onClick={() =>
                      setJobType("part-time")
                    }
                  >
                    Part-time
                  </FilterButton>

                  <FilterButton
                    active={
                      jobType === "contract"
                    }
                    onClick={() =>
                      setJobType("contract")
                    }
                  >
                    Contract
                  </FilterButton>

                  <FilterButton
                    active={
                      jobType === "internship"
                    }
                    onClick={() =>
                      setJobType("internship")
                    }
                  >
                    Internship
                  </FilterButton>

                  <FilterButton
                    active={
                      jobType === "remote"
                    }
                    onClick={() =>
                      setJobType("remote")
                    }
                  >
                    Remote
                  </FilterButton>

                </div>

              </div>

            </motion.div>
          )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="space-y-5">

            {[1, 2, 3].map((item) => (
              <JobSkeleton key={item} />
            ))}

          </div>
        )}

        {/* =================================================
            NO JOBS
        ================================================= */}

        {!loading &&
          !error &&
          jobs.length === 0 && (

            <EmptyState
              title="No jobs available yet"
              description="There are currently no jobs in the database. Run the job import command to populate the job board."
              action={
                <button
                  type="button"
                  onClick={loadJobs}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0b3327] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4536]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh jobs
                </button>
              }
            />

          )}

        {/* =================================================
            NO SEARCH RESULTS
        ================================================= */}

        {!loading &&
          jobs.length > 0 &&
          filteredJobs.length === 0 && (

            <EmptyState
              title="No matching jobs"
              description="We couldn't find any jobs matching your current search or filters."
              action={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0b3327] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4536]"
                >
                  Clear search
                </button>
              }
            />

          )}

        {/* =================================================
            JOB LIST
        ================================================= */}

        {!loading &&
          filteredJobs.length > 0 && (

            <div className="space-y-5">

              {filteredJobs.map(
                (job, index) => (

                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                  />

                )
              )}

            </div>

          )}

      </div>

    </DashboardLayout>
  );
}

/* =========================================================
   JOB CARD
========================================================= */

function JobCard({
  job,
  index,
}: {
  job: Job;
  index: number;
}) {
  const [applying, setApplying] =
    useState(false);

  /* =======================================================
     APPLY TO JOB
  ======================================================= */

  async function handleApply() {
    if (applying) {
      return;
    }

    try {
      setApplying(true);

      /*
        Record the application in Django first.
      */
      await applyToJob(job.id);

      console.log(
        "APPLICATION RECORDED:",
        job.id,
        job.title
      );

      /*
        Then open the actual external
        application page.
      */
      if (job.apply_url) {
        window.open(
          job.apply_url,
          "_blank",
          "noopener,noreferrer"
        );
      }

    } catch (error) {
      console.error(
        "FAILED TO RECORD APPLICATION:",
        error
      );

      /*
        Even if recording fails, don't prevent
        the user from applying for the job.
      */
      if (job.apply_url) {
        window.open(
          job.apply_url,
          "_blank",
          "noopener,noreferrer"
        );
      }

    } finally {
      setApplying(false);
    }
  }

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        delay: Math.min(
          index * 0.03,
          0.3
        ),
      }}
      whileHover={{
        y: -3,
      }}
      className={`group relative overflow-hidden rounded-[1.75rem] border bg-white p-6 shadow-sm transition hover:shadow-lg sm:p-7 ${
        job.featured
          ? "border-[#f4b740]/40"
          : "border-[#e6e7e1]"
      }`}
    >

      {/* GOLD ACCENT */}

      {job.featured && (
        <div className="absolute right-0 top-0 flex items-center gap-1.5 rounded-bl-2xl bg-[#fff8e7] px-4 py-2 text-xs font-bold text-[#9b6d08]">

          <Star className="h-3.5 w-3.5 fill-[#f4b740] text-[#f4b740]" />

          Featured

        </div>
      )}

      <div className="flex flex-col gap-7 lg:flex-row">

        {/* LEFT */}

        <div className="min-w-0 flex-1">

          <div className="flex gap-4">

            {/* COMPANY */}

            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#0b3327] text-[#f4b740] shadow-sm">

              {job.logo ? (
                <img
                  src={job.logo}
                  alt={job.company}
                  className="h-10 w-10 rounded-xl object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <Building2 className="h-6 w-6" />
              )}

            </div>

            <div className="min-w-0">

              <h2 className="text-xl font-bold tracking-tight text-[#0b3327] sm:text-2xl">

                {job.title}

              </h2>

              <p className="mt-1 text-sm font-medium text-neutral-500">

                {job.company ||
                  "Company not specified"}

              </p>

              {/* META */}

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500">

                <span className="inline-flex items-center gap-1.5">

                  <MapPin className="h-3.5 w-3.5 text-emerald-700" />

                  {job.location ||
                    "Location not specified"}

                </span>

                <span className="inline-flex items-center gap-1.5">

                  <Briefcase className="h-3.5 w-3.5 text-emerald-700" />

                  {job.type ||
                    "Not specified"}

                </span>

                {job.posted_at && (
                  <span className="inline-flex items-center gap-1.5">

                    <Clock3 className="h-3.5 w-3.5 text-emerald-700" />

                    {formatPostedDate(
                      job.posted_at
                    )}

                  </span>
                )}

              </div>

            </div>

          </div>

          {/* DESCRIPTION */}

          {job.description && (
            <div className="mt-6">

              <p className="line-clamp-4 text-sm leading-7 text-neutral-600">

                {job.description}

              </p>

            </div>
          )}

          {/* SKILLS */}

          {job.skills?.length > 0 && (

            <div className="mt-6">

              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">

                Skills

              </p>

              <div className="flex flex-wrap gap-2">

                {job.skills
                  .filter(Boolean)
                  .slice(0, 10)
                  .map((skill) => (

                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"
                    >

                      {skill}

                    </span>

                  ))}

              </div>

            </div>

          )}

        </div>

        {/* RIGHT */}

        <div className="flex shrink-0 flex-row items-center justify-between gap-5 border-t border-[#edf0eb] pt-5 lg:w-44 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:justify-between lg:pl-7 lg:pt-0">

          <div className="text-left lg:text-right">

            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">

              Source

            </p>

            <p className="mt-1 text-sm font-bold text-[#0b3327]">

              {job.source || "Pathwise"}

            </p>

          </div>

          {/* APPLY */}

          {job.apply_url ? (
            <button
              type="button"
              onClick={handleApply}
              disabled={applying}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0b3327] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#102f25] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >

              {applying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#f4b740]" />
                  Applying...
                </>
              ) : (
                <>
                  Apply / View

                  <ArrowRight className="h-4 w-4 text-[#f4b740] transition-transform group-hover:translate-x-0.5" />
                </>
              )}

            </button>
          ) : (
            <span className="rounded-xl bg-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-400">
              No link
            </span>
          )}

        </div>

      </div>

    </motion.article>
  );
}

/* =========================================================
   HERO STAT
========================================================= */

function HeroStat({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: string | number;
  label: string;
}) {

  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">

      <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">

        <Icon className="h-4 w-4 text-[#f4b740]" />

      </div>

      <div>

        <p className="text-sm font-bold text-white">
          {value}
        </p>

        <p className="text-[11px] text-emerald-100/50">
          {label}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
        active
          ? "bg-[#0b3327] text-white"
          : "border border-[#e1e5df] bg-white text-neutral-600 hover:border-[#f4b740]/50 hover:bg-[#fffaf0] hover:text-[#8b650d]"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function JobSkeleton() {

  return (
    <div className="animate-pulse rounded-[1.75rem] border border-[#e6e7e1] bg-white p-7">

      <div className="flex gap-4">

        <div className="h-14 w-14 rounded-2xl bg-neutral-200" />

        <div className="flex-1">

          <div className="h-5 w-2/3 rounded bg-neutral-200" />

          <div className="mt-2 h-4 w-1/3 rounded bg-neutral-100" />

          <div className="mt-4 h-3 w-1/2 rounded bg-neutral-100" />

        </div>

      </div>

      <div className="mt-6 flex gap-2">

        <div className="h-7 w-20 rounded-full bg-neutral-100" />

        <div className="h-7 w-24 rounded-full bg-neutral-100" />

        <div className="h-7 w-16 rounded-full bg-neutral-100" />

      </div>

      <div className="mt-6 h-24 rounded-2xl bg-neutral-100" />

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {

  return (
    <div className="rounded-[2rem] border border-[#e6e7e1] bg-white px-6 py-16 text-center shadow-sm">

      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff8e7]">

        <Briefcase className="h-7 w-7 text-[#d59c25]" />

      </div>

      <h2 className="mt-5 text-xl font-bold text-[#0b3327]">

        {title}

      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">

        {description}

      </p>

      {action && (
        <div className="mt-6">

          {action}

        </div>
      )}

    </div>
  );
}

/* =========================================================
   DATE FORMATTER
========================================================= */

function formatPostedDate(
  date: string
) {

  try {

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "Recently posted";
    }

    const now =
      new Date();

    const difference =
      now.getTime() -
      parsed.getTime();

    const days =
      Math.floor(
        difference /
          (1000 *
            60 *
            60 *
            24)
      );

    if (days <= 0) {
      return "Posted today";
    }

    if (days === 1) {
      return "Posted yesterday";
    }

    if (days < 30) {
      return `Posted ${days} days ago`;
    }

    return parsed.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  } catch {

    return "Recently posted";

  }
}