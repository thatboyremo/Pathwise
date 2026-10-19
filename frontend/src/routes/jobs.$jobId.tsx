import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Building2, BriefcaseBusiness } from "lucide-react";

export const Route = createFileRoute("/jobs/$jobId")({
  component: JobDetailsPage,
});

function JobDetailsPage() {
  const { jobId } = Route.useParams();

  return (
    <div className="min-h-screen bg-[#f6f8f5] px-6 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          to="/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#0f3d2e] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Jobs
        </Link>

        {/* Job Card */}
        <div className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm">

          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-[#f4b740]">
              Job ID: {jobId}
            </p>

            <h1 className="text-3xl font-bold text-[#0f3d2e]">
              Job Details
            </h1>

            <p className="mt-2 text-gray-500">
              Loading job information...
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl bg-[#f6f8f5] p-4">
              <Building2
                className="mb-2 text-[#0f3d2e]"
                size={22}
              />

              <p className="text-sm text-gray-500">
                Company
              </p>

              <p className="font-semibold text-[#0f3d2e]">
                —
              </p>
            </div>

            <div className="rounded-2xl bg-[#f6f8f5] p-4">
              <MapPin
                className="mb-2 text-[#0f3d2e]"
                size={22}
              />

              <p className="text-sm text-gray-500">
                Location
              </p>

              <p className="font-semibold text-[#0f3d2e]">
                —
              </p>
            </div>

            <div className="rounded-2xl bg-[#f6f8f5] p-4">
              <BriefcaseBusiness
                className="mb-2 text-[#0f3d2e]"
                size={22}
              />

              <p className="text-sm text-gray-500">
                Job ID
              </p>

              <p className="font-semibold text-[#0f3d2e]">
                {jobId}
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
