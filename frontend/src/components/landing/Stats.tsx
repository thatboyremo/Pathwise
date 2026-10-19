import { motion } from "framer-motion";
import { TrendingUp, Users, Star, Target } from "lucide-react";

const stats = [
  {
    value: "50K+",
    label: "Active Users",
    icon: Users,
    accent: "green",
  },
  {
    value: "85%",
    label: "Interview Success Rate",
    icon: Target,
    accent: "green",
  },
  {
    value: "2.3x",
    label: "Avg. Salary Increase",
    icon: TrendingUp,
    accent: "orange",
  },
  {
    value: "4.9",
    label: "User Rating",
    icon: Star,
    accent: "green",
  },
];

const particles = Array.from({ length: 12 });

export function Stats() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#07110d] py-12 lg:py-14">
      {/* Main green glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]"
      />

      {/* Subtle orange glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[12%] top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-orange-500/5 blur-[90px]"
      />

      {/* Left green glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-primary/10 blur-[90px]"
      />

      {/* Subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "45px 45px",
        }}
      />

      {/* Floating particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {particles.map((_, i) => (
          <motion.span
            key={i}
            className={`absolute h-1 w-1 rounded-full ${
              i % 5 === 0 ? "bg-orange-400" : "bg-primary"
            }`}
            initial={{
              opacity: 0,
              y: 20,
              x: `${(i * 23) % 100}%`,
            }}
            animate={{
              opacity: [0, 0.3, 0],
              y: [-10, -70],
              x: [
                `${(i * 23) % 100}%`,
                `${((i * 23 + 7) % 100)}%`,
              ],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Compact intro */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mb-7 text-center"
        >
          <div className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(25,211,143,0.7)]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
              Pathwise by the numbers
            </span>

            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.6)]" />
          </div>

          <p className="mx-auto mt-2 max-w-lg text-xs font-medium leading-5 text-white/45 sm:text-sm">
            Helping professionals build stronger careers with intelligent,
            AI-powered guidance.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            const isOrange = stat.accent === "orange";

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -3,
                  transition: { duration: 0.2 },
                }}
                className="group relative overflow-hidden border-b border-r border-white/10 px-4 py-6 text-center transition-colors duration-300 hover:bg-white/[0.035] sm:px-6 sm:py-7 lg:border-b-0 lg:last:border-r-0"
              >
                {/* Hover glow */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-500 ${
                    isOrange
                      ? "bg-orange-500/15 opacity-0 group-hover:opacity-100"
                      : "bg-primary/15 opacity-0 group-hover:opacity-100"
                  }`}
                />

                {/* Top accent */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "32%" }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.08 + 0.2,
                  }}
                  className={`absolute left-1/2 top-0 h-px -translate-x-1/2 ${
                    isOrange ? "bg-orange-400" : "bg-primary"
                  }`}
                />

                <div className="relative">
                  {/* Icon */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      delay: i * 0.08 + 0.1,
                    }}
                    className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300 ${
                      isOrange
                        ? "border-orange-400/20 bg-orange-400/10 text-orange-400 group-hover:border-orange-400/40 group-hover:bg-orange-400 group-hover:text-[#07110d]"
                        : "border-primary/20 bg-primary/10 text-primary group-hover:border-primary/40 group-hover:bg-primary group-hover:text-[#07110d]"
                    }`}
                  >
                    <Icon className="h-4 w-4 stroke-[2.5]" />
                  </motion.div>

                  {/* Number */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.45,
                      delay: i * 0.08 + 0.18,
                    }}
                    className="text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <span
                      className={`bg-clip-text text-transparent transition-all duration-300 ${
                        isOrange
                          ? "bg-gradient-to-b from-white to-white/70 group-hover:from-orange-300 group-hover:to-orange-500"
                          : "bg-gradient-to-b from-white to-white/70 group-hover:from-primary group-hover:to-primary/70"
                      }`}
                    >
                      {stat.value}
                    </span>
                  </motion.div>

                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.08 + 0.3,
                    }}
                    className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40 transition-colors duration-300 group-hover:text-white/65 sm:text-xs"
                  >
                    {stat.label}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Small bottom accent */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mx-auto mt-7 h-px max-w-[180px] origin-center bg-gradient-to-r from-transparent via-primary/35 to-transparent"
        />
      </div>
    </section>
  );
}