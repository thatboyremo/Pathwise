import { MapPin, Building2, ArrowUpRight } from "lucide-react";

type Props = {
    job: any;
};

export default function JobCard({ job }: Props) {
    return (
        <div className="rounded-2xl bg-white border p-6 shadow-sm hover:shadow-lg transition">

            <div className="flex justify-between">

                <div>

                    <h2 className="text-xl font-bold">
                        {job.title}
                    </h2>

                    <div className="mt-2 flex gap-5 text-sm text-gray-500">

                        <span className="flex items-center gap-1">
                            <Building2 size={16}/>
                            {job.company}
                        </span>

                        <span className="flex items-center gap-1">
                            <MapPin size={16}/>
                            {job.location}
                        </span>

                    </div>

                </div>

                <div className="text-right">

                    <div className="text-3xl font-bold text-green-700">

                        {job.match}%

                    </div>

                    <div className="text-sm text-gray-500">

                        Match

                    </div>

                </div>

            </div>

            <div className="mt-5 flex flex-wrap gap-2">

                {job.skills.map((skill: string) => (

                    <span
                        key={skill}
                        className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-700"
                    >
                        {skill}
                    </span>

                ))}

            </div>

            <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-5 py-3 text-white hover:bg-[#184f3b]"
            >

                Apply

                <ArrowUpRight size={18}/>

            </a>

        </div>
    );
}