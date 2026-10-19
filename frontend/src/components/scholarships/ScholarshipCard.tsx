import {
  GraduationCap,
  Globe,
  Banknote,
  ArrowRight,
} from "lucide-react";

type Props = {
  scholarship: any;
};

export default function ScholarshipCard({ scholarship }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-2xl font-bold text-[#0f3d2e]">
            {scholarship.title}
          </h2>

          <p className="mt-1 text-gray-500">
            {scholarship.university}
          </p>

        </div>

        {scholarship.featured && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            Featured
          </span>
        )}

      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-sm">

        <span className="flex items-center gap-2 text-gray-600">
          <Globe size={16} />
          {scholarship.country}
        </span>

        <span className="flex items-center gap-2 text-gray-600">
          <Banknote size={16} />
          {scholarship.funding}
        </span>

        <span className="flex items-center gap-2 text-gray-600">
          <GraduationCap size={16} />
          {scholarship.study_level}
        </span>

      </div>

      <p className="mt-5 text-gray-600">
        {scholarship.description}
      </p>

      <a
        href={scholarship.website}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-3 text-white transition hover:bg-[#184f3b]"
      >
        View Scholarship

        <ArrowRight size={18} />
      </a>

    </div>
  );
}