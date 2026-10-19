import { createFileRoute } from "@tanstack/react-router";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Target,
  Search,
  Zap,
  Loader2,
  X,
  ShieldCheck,
  ArrowUpRight,
  Brain,
  RefreshCw,
  CircleCheck,
  CircleX,
} from "lucide-react";

import {
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import {
  analyzeCV,
  type CVAnalysis,
} from "@/api/cv";

export const Route = createFileRoute("/dashboard/resume")({
  component: CVStudioPage,
});

function CVStudioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function validateFile(selectedFile: File) {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF or DOCX file.");
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Your CV must be smaller than 10 MB.");
      return false;
    }

    setError("");
    return true;
  }

  function handleFile(selectedFile: File) {
    if (!validateFile(selectedFile)) return;

    setFile(selectedFile);
    setAnalysis(null);
    setError("");
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please upload your CV first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await analyzeCV(file);

      console.log("========== CV ANALYSIS RESPONSE ==========");
      console.log(response);
      console.log("========== RESPONSE.ANALYSIS ==========");
      console.log(response.analysis);

      setAnalysis(response.analysis);

    } catch (err: any) {
      console.error("CV analysis error:", err);

      setError(
        err?.response?.data?.error ||
          "Unable to analyze your CV. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function removeFile() {
    setFile(null);
    setAnalysis(null);
    setError("");
  }

  return (
    <div className="min-h-full bg-[#fafbf8] pb-12">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[2rem] bg-[#0b3327] px-7 py-9 text-white shadow-sm sm:px-10 sm:py-11">

        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-emerald-100 backdrop-blur">

            <Sparkles className="h-3.5 w-3.5 text-amber-300" />

            AI CV INTELLIGENCE

          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">

            Turn your CV into an{" "}

            <span className="font-['Instrument_Serif',ui-serif,Georgia,serif] italic text-emerald-300">

              interview magnet.

            </span>

          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/70 sm:text-base">

            Get a complete AI-powered breakdown of your CV — ATS
            compatibility, keywords, impact, structure, skills and
            recruiter-readiness.

          </p>

          <div className="mt-7 flex flex-wrap gap-3">

            <FeaturePill
              icon={ShieldCheck}
              text="ATS Analysis"
            />

            <FeaturePill
              icon={Target}
              text="Keyword Matching"
            />

            <FeaturePill
              icon={Brain}
              text="AI Recommendations"
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

          <span>{error}</span>

        </div>
      )}


      {/* =====================================================
          UPLOAD AREA
      ===================================================== */}

      {!analysis && (

        <section className="mt-7">

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => {
              setDragging(false);
            }}
            onDrop={handleDrop}
            className={`relative overflow-hidden rounded-[2rem] border transition-all ${
              dragging
                ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-900/5"
                : "border-[#e6e7e1] bg-white"
            }`}
          >

            <div className="p-7 sm:p-10">

              {!file ? (

                /* =================================================
                   EMPTY UPLOAD
                ================================================= */

                <div className="text-center">

                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-[#0b3327] shadow-lg shadow-emerald-950/10">

                    <Upload className="h-8 w-8 text-amber-300" />

                  </div>

                  <h2 className="mt-6 text-xl font-bold text-[#0b3327]">

                    Upload your CV

                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">

                    Drag and drop your resume here, or choose a file
                    from your computer.

                  </p>

                  <label className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0b3327] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0f4536]">

                    <Upload className="h-4 w-4" />

                    Choose CV

                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleInput}
                      className="hidden"
                    />

                  </label>

                  <p className="mt-5 text-xs text-neutral-400">

                    PDF or DOCX · Maximum 10 MB

                  </p>

                </div>

              ) : (

                /* =================================================
                   FILE SELECTED
                ================================================= */

                <div>

                  <div className="flex flex-col gap-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 sm:flex-row sm:items-center">

                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#0b3327]">

                      <FileText className="h-6 w-6 text-amber-300" />

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2">

                        <p className="truncate text-sm font-bold text-neutral-900">

                          {file.name}

                        </p>

                        <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600" />

                      </div>

                      <p className="mt-1 text-xs text-neutral-500">

                        {(file.size / 1024 / 1024).toFixed(2)} MB
                        {" · "}
                        Ready for analysis

                      </p>

                    </div>

                    <button
                      onClick={removeFile}
                      type="button"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-neutral-500 transition hover:bg-red-50 hover:text-red-500"
                    >

                      <X className="h-4 w-4" />

                    </button>

                  </div>


                  <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">

                    <div className="flex items-center gap-2 text-xs text-neutral-500">

                      <ShieldCheck className="h-4 w-4 text-emerald-600" />

                      Your CV is processed securely.

                    </div>

                    <button
                      onClick={handleAnalyze}
                      disabled={loading}
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0b3327] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f4536] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >

                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          Analyzing CV...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-amber-300" />

                          Analyze My CV

                          <ArrowUpRight className="h-4 w-4" />
                        </>
                      )}

                    </button>

                  </div>

                </div>

              )}

            </div>


            <div className="border-t border-[#e6e7e1] bg-[#fafbf8] px-7 py-4">

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500">

                <span>✓ ATS compatibility</span>

                <span>✓ Keyword analysis</span>

                <span>✓ Impact scoring</span>

                <span>✓ AI recommendations</span>

              </div>

            </div>

          </div>

        </section>

      )}


      {/* =====================================================
          NEW SECTION — AFTER UPLOAD AREA
      ===================================================== */}

      {!analysis && (

        <section className="mt-8">

          <div className="overflow-hidden rounded-[2rem] border border-[#e6e7e1] bg-white">

            <div className="p-7 sm:p-10">

              <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">

                {/* LEFT */}

                <div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700">

                    <Sparkles className="h-3.5 w-3.5" />

                    Why use CV Studio?

                  </div>

                  <h2 className="mt-5 max-w-xl text-2xl font-bold tracking-tight text-[#0b3327] sm:text-3xl">

                    Your CV should do more than list your experience.

                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">

                    Recruiters often spend only a short amount of time
                    reviewing an application. CV Studio helps you understand
                    how your CV performs before you send it out.

                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">

                    <MiniBenefit
                      icon={ShieldCheck}
                      title="ATS Ready"
                      text="Find issues that could affect automated screening."
                    />

                    <MiniBenefit
                      icon={Target}
                      title="Stronger Keywords"
                      text="Identify skills and keywords recruiters expect."
                    />

                    <MiniBenefit
                      icon={Zap}
                      title="More Impact"
                      text="Improve weak or vague experience descriptions."
                    />

                    <MiniBenefit
                      icon={Brain}
                      title="AI Feedback"
                      text="Get practical recommendations tailored to your CV."
                    />

                  </div>

                </div>


                {/* RIGHT — PROCESS CARD */}

                <div className="rounded-[1.75rem] bg-[#f7faf6] p-6 sm:p-7">

                  <p className="text-sm font-bold text-[#0b3327]">

                    How CV analysis works

                  </p>

                  <div className="mt-6 space-y-5">

                    <ProcessStep
                      number="01"
                      title="Upload your CV"
                      text="Add your PDF or DOCX resume."
                    />

                    <ProcessStep
                      number="02"
                      title="AI reviews your CV"
                      text="We analyze structure, skills, keywords and impact."
                    />

                    <ProcessStep
                      number="03"
                      title="Get your report"
                      text="Receive a clear score and actionable improvements."
                    />

                  </div>

                  <div className="mt-7 flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-xs text-neutral-500">

                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />

                    Secure CV processing

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && !analysis && (

        <div className="mt-7 rounded-[2rem] border border-emerald-900/10 bg-white p-10 text-center">

          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50">

            <Brain className="h-7 w-7 animate-pulse text-emerald-700" />

          </div>

          <h3 className="mt-5 text-lg font-bold text-[#0b3327]">

            AI is reading your CV

          </h3>

          <p className="mt-2 text-sm text-neutral-500">

            Checking structure, keywords, impact and recruiter readiness...

          </p>

          <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-emerald-50">

            <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-700" />

          </div>

        </div>

      )}


      {/* =====================================================
          ANALYSIS DASHBOARD
      ===================================================== */}

      {analysis && (

        <section className="mt-8 space-y-6">

          {/* TOP ROW */}

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                <CircleCheck className="h-3.5 w-3.5" />

                Analysis complete

              </div>

              <h2 className="mt-3 text-2xl font-bold text-[#0b3327]">

                Your CV intelligence report

              </h2>

              <p className="mt-1 text-sm text-neutral-500">

                Here is how your CV currently performs.

              </p>

            </div>

            <button
              onClick={removeFile}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dfe3dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#0b3327] transition hover:bg-emerald-50"
            >

              <RefreshCw className="h-4 w-4" />

              Analyze another CV

            </button>

          </div>


          {/* SCORE CARDS */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <ScoreCard
              icon={Target}
              label="Overall Score"
              value={analysis.overall_score}
              primary
            />

            <ScoreCard
              icon={ShieldCheck}
              label="ATS Score"
              value={analysis.ats_score}
            />

            <ScoreCard
              icon={Zap}
              label="Impact Score"
              value={analysis.impact_score}
            />

            <ScoreCard
              icon={Search}
              label="Keyword Score"
              value={analysis.keyword_score}
            />

          </div>


          {/* CONTACT + SECTIONS */}

          <div className="grid gap-6 lg:grid-cols-2">

            <AnalysisCard title="Contact information">

              <div className="grid gap-3 sm:grid-cols-2">

                <CheckRow
                  label="Email"
                  active={analysis.contact?.email ?? false}
                />

                <CheckRow
                  label="Phone"
                  active={analysis.contact?.phone ?? false}
                />

                <CheckRow
                  label="LinkedIn"
                  active={analysis.contact?.linkedin ?? false}
                />

                <CheckRow
                  label="GitHub"
                  active={analysis.contact?.github ?? false}
                />

              </div>

            </AnalysisCard>


            <AnalysisCard title="CV sections">

              <div className="grid gap-3 sm:grid-cols-2">

                <CheckRow
                  label="Professional Summary"
                  active={analysis.sections?.summary ?? false}
                />

                <CheckRow
                  label="Experience"
                  active={analysis.sections?.experience ?? false}
                />

                <CheckRow
                  label="Education"
                  active={analysis.sections?.education ?? false}
                />

                <CheckRow
                  label="Skills"
                  active={analysis.sections?.skills ?? false}
                />

                <CheckRow
                  label="Projects"
                  active={analysis.sections?.projects ?? false}
                />

                <CheckRow
                  label="Certifications"
                  active={analysis.sections?.certifications ?? false}
                />

              </div>

            </AnalysisCard>

          </div>


          {/* STRENGTHS / WEAKNESSES */}

          <div className="grid gap-6 lg:grid-cols-2">

            <AnalysisList
              title="What's working"
              subtitle="Strong areas detected in your CV."
              items={analysis.strengths}
              positive
            />

            <AnalysisList
              title="What needs improvement"
              subtitle="Areas that may reduce recruiter impact."
              items={analysis.weaknesses}
            />

          </div>


          {/* SKILLS */}

          <AnalysisCard title="Detected skills & technologies">

            <div className="flex flex-wrap gap-2">

              {analysis.technologies.length > 0 ? (

                analysis.technologies.map((technology) => (

                  <span
                    key={technology}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800"
                  >

                    <Zap className="h-3 w-3" />

                    {technology}

                  </span>

                ))

              ) : (

                <p className="text-sm text-neutral-500">

                  No major technologies detected.

                </p>

              )}

            </div>

          </AnalysisCard>


          {/* RECOMMENDATIONS */}

          <div className="overflow-hidden rounded-[2rem] bg-[#0b3327] p-7 text-white sm:p-8">

            <div className="flex items-start gap-4">

              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10">

                <Sparkles className="h-5 w-5 text-amber-300" />

              </div>

              <div>

                <h2 className="text-xl font-bold">

                  AI recommendations

                </h2>

                <p className="mt-1 text-sm text-emerald-100/60">

                  Practical improvements based on your CV analysis.

                </p>

              </div>

            </div>


            <div className="mt-7 grid gap-4 md:grid-cols-2">

              {analysis.recommendations.map(
                (recommendation, index) => (

                  <div
                    key={`${recommendation.title}-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-300/10 text-xs font-bold text-emerald-200">

                        {String(index + 1).padStart(2, "0")}

                      </div>

                      <ArrowUpRight className="h-4 w-4 text-emerald-200/50" />

                    </div>

                    <h3 className="mt-4 text-sm font-semibold">

                      {recommendation.title}

                    </h3>

                    <p className="mt-2 text-sm leading-6 text-emerald-50/60">

                      {recommendation.description}

                    </p>

                  </div>

                )
              )}

            </div>

          </div>


          {/* BOTTOM */}

          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e6e7e1] bg-white px-6 py-5 sm:flex-row">

            <div className="flex items-center gap-3">

              <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50">

                <Sparkles className="h-4 w-4 text-emerald-700" />

              </div>

              <div>

                <p className="text-sm font-semibold text-neutral-900">

                  Want to improve your score?

                </p>

                <p className="text-xs text-neutral-500">

                  Use the recommendations above to strengthen your CV.

                </p>

              </div>

            </div>

            <button
              onClick={removeFile}
              type="button"
              className="rounded-full bg-[#0b3327] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4536]"
            >

              Analyze another CV

            </button>

          </div>

        </section>

      )}

    </div>
  );
}


/* =========================================================
   FEATURE PILL
========================================================= */

function FeaturePill({
  icon: Icon,
  text,
}: {
  icon: any;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-xs font-medium text-emerald-50/80">

      <Icon className="h-3.5 w-3.5 text-emerald-300" />

      {text}

    </div>
  );
}


/* =========================================================
   MINI BENEFIT
========================================================= */

function MiniBenefit({
  icon: Icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e9eee8] bg-[#fafbf8] p-4">

      <div className="flex items-start gap-3">

        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">

          <Icon className="h-4 w-4" />

        </div>

        <div>

          <h3 className="text-sm font-semibold text-[#0b3327]">

            {title}

          </h3>

          <p className="mt-1 text-xs leading-5 text-neutral-500">

            {text}

          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   PROCESS STEP
========================================================= */

function ProcessStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0b3327] text-xs font-bold text-emerald-200">

        {number}

      </div>

      <div>

        <h3 className="text-sm font-semibold text-[#0b3327]">

          {title}

        </h3>

        <p className="mt-1 text-xs leading-5 text-neutral-500">

          {text}

        </p>

      </div>

    </div>
  );
}


/* =========================================================
   SCORE CARD
========================================================= */

function ScoreCard({
  icon: Icon,
  label,
  value,
  primary = false,
}: {
  icon: any;
  label: string;
  value: number;
  primary?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border p-6 transition hover:-translate-y-0.5 hover:shadow-md ${
        primary
          ? "border-emerald-900/10 bg-[#0b3327] text-white"
          : "border-[#e6e7e1] bg-white"
      }`}
    >

      <div className="flex items-start justify-between">

        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${
            primary
              ? "bg-white/10 text-emerald-200"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >

          <Icon className="h-5 w-5" />

        </div>

        <span
          className={`text-xs font-semibold ${
            primary
              ? "text-emerald-100/60"
              : "text-neutral-400"
          }`}
        >
          / 100
        </span>

      </div>

      <p
        className={`mt-5 text-sm ${
          primary
            ? "text-emerald-100/60"
            : "text-neutral-500"
        }`}
      >
        {label}
      </p>

      <div className="mt-1 flex items-end gap-2">

        <p
          className={`text-4xl font-bold ${
            primary
              ? "text-white"
              : "text-[#0b3327]"
          }`}
        >
          {value}
        </p>

        <span
          className={`mb-1 text-xs font-medium ${
            primary
              ? "text-emerald-200"
              : "text-emerald-700"
          }`}
        >
          score
        </span>

      </div>

      <div
        className={`mt-4 h-1.5 overflow-hidden rounded-full ${
          primary
            ? "bg-white/10"
            : "bg-emerald-50"
        }`}
      >

        <div
          className={`h-full rounded-full transition-all ${
            primary
              ? "bg-emerald-300"
              : "bg-emerald-700"
          }`}
          style={{
            width: `${Math.min(Math.max(value, 0), 100)}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   ANALYSIS CARD
========================================================= */

function AnalysisCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-[#e6e7e1] bg-white p-6">

      <div className="flex items-center justify-between">

        <h2 className="text-base font-bold text-[#0b3327]">
          {title}
        </h2>

        <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />

      </div>

      <div className="mt-5">
        {children}
      </div>

    </div>
  );
}


/* =========================================================
   CHECK ROW
========================================================= */

function CheckRow({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#edf0eb] bg-[#fafbf8] px-3.5 py-3">

      <div
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
          active
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-50 text-red-500"
        }`}
      >

        {active ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <CircleX className="h-4 w-4" />
        )}

      </div>

      <span className="text-sm font-medium text-neutral-700">

        {label}

      </span>

    </div>
  );
}


/* =========================================================
   ANALYSIS LIST
========================================================= */

function AnalysisList({
  title,
  subtitle,
  items,
  positive = false,
}: {
  title: string;
  subtitle: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div className="rounded-[1.75rem] border border-[#e6e7e1] bg-white p-6">

      <div>

        <h2 className="text-base font-bold text-[#0b3327]">

          {title}

        </h2>

        <p className="mt-1 text-xs text-neutral-500">

          {subtitle}

        </p>

      </div>

      <div className="mt-5 space-y-3">

        {items.length > 0 ? (

          items.map((item, index) => (

            <div
              key={`${item}-${index}`}
              className={`rounded-2xl border p-4 ${
                positive
                  ? "border-emerald-100 bg-emerald-50/60"
                  : "border-amber-100 bg-amber-50/60"
              }`}
            >

              <div className="flex gap-3">

                {positive ? (

                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                ) : (

                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                )}

                <p className="text-sm leading-6 text-neutral-700">

                  {item}

                </p>

              </div>

            </div>

          ))

        ) : (

          <p className="text-sm text-neutral-500">

            Nothing to report.

          </p>

        )}

      </div>

    </div>
  );
}