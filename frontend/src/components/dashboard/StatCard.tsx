import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
type Accent = "green" | "black" | "orange";
interface Props {
  label: string;
  value: string | number;
  suffix?: string;
  delta?: string;
  icon: LucideIcon;
  accent?: Accent;
  progress?: number; // 0-100
  delay?: number;
}
const accents: Record<Accent, { bg: string; fg: string; bar: string }> = {
  green: { bg: "bg-[#4ade80]/15", fg: "text-[#16a34a]", bar: "bg-[#4ade80]" },
  black: { bg: "bg-black/5", fg: "text-black", bar: "bg-black" },
  orange: { bg: "bg-[#f97316]/15", fg: "text-[#ea580c]", bar: "bg-[#f97316]" },
};
export function StatCard({
  label,
  value,
  suffix,
  delta,
  icon: Icon,
  accent = "green",
  progress,
  delay = 0,
}: Props) {
  const a = accents[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.15)]"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.bg}`}>
          <Icon className={`h-5 w-5 ${a.fg}`} />
        </div>
        {delta && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#4ade80]/15 px-2 py-0.5 text-[11px] font-semibold text-[#16a34a]">
            <TrendingUp className="h-3 w-3" />
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-black/50">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className="text-3xl font-bold tracking-tight text-black"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </span>
        {suffix && <span className="text-sm font-semibold text-black/40">{suffix}</span>}
      </div>
      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, delay: delay + 0.2, ease: "easeOut" }}
            className={`h-full rounded-full ${a.bar}`}
          />
        </div>
      )}
    </motion.div>
  );
}