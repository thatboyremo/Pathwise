import { motion } from "framer-motion";
import { FileText, MessageSquare, Award, Sparkles } from "lucide-react";
const activities = [
  {
    icon: FileText,
    title: "CV score improved by 15%",
    meta: "After applying AI suggestions · 2h ago",
  },
  {
    icon: MessageSquare,
    title: "Mock interview completed",
    meta: "Behavioral round · scored 88% · 5h ago",
  },
  {
    icon: Award,
    title: "New scholarship matched",
    meta: "Chevening Fellowship · deadline Aug 12 · yesterday",
  },
  {
    icon: Sparkles,
    title: "Career advisor session",
    meta: "Discussed transition to product roles · 2d ago",
  },
];
export function ActivityCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-[18px] border border-[#e6e7e1] bg-white p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[1.05rem] font-bold text-[#0d1f17]">Recent Activity</h3>
        <span className="text-[0.82rem] text-[#7d8a83]">Today</span>
      </div>
      <ul>
        {activities.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.5 + i * 0.06 }}
              className="flex items-start gap-3.5 border-b border-dashed border-[#e6e7e1] py-3 last:border-0"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#eef0e9] text-[#0f3d2e]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.9rem] font-semibold text-[#0d1f17]">{a.title}</p>
                <p className="text-[0.78rem] text-[#7d8a83]">{a.meta}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}