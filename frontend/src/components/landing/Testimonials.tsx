import { motion } from "framer-motion";
import { Quote, Star, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    company: "Google",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    quote:
      "Pathwise completely changed how I approached my job search. The CV analysis helped me identify gaps I didn't even know I had, and the recommendations made my applications much stronger.",
  },
  {
    name: "Marcus Johnson",
    role: "Software Engineer",
    company: "Netflix",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    quote:
      "The AI interview preparation is incredibly useful. It helped me practice with realistic questions, improve my answers, and walk into interviews with much more confidence.",
  },
  {
    name: "Elena Rodriguez",
    role: "Marketing Director",
    company: "Spotify",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    quote:
      "What I love about Pathwise is that everything is connected. From understanding my skills to finding opportunities and preparing for interviews, it gives me a clear path forward.",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-white py-24 lg:py-32"
    >
      {/* =====================================================
          SUBTLE GREEN BACKGROUND GLOW
      ====================================================== */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            SECTION HEADER
        ====================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
            <Quote className="h-3.5 w-3.5 stroke-[2.5]" />
            What people are saying
          </span>

          {/* Heading */}
          <h2
            className="mt-5 text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built to help you{" "}
            <span className="font-extrabold text-primary">
              move forward.
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-muted-foreground sm:text-lg">
            See how professionals are using Pathwise to build stronger
            profiles, discover better opportunities, and take control of
            their careers.
          </p>
        </motion.div>

        {/* =====================================================
            TESTIMONIAL CARDS
        ====================================================== */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.55,
                delay: index * 0.1,
              }}
              className="group relative"
            >
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">

                {/* Hover glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                />

                {/* =================================================
                    TOP ROW
                ================================================== */}
                <div className="relative flex items-center justify-between">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="h-4.5 w-4.5 fill-primary text-primary stroke-[2.5]"
                      />
                    ))}
                  </div>

                  {/* Quote icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                    <Quote className="h-4.5 w-4.5 stroke-[2.5]" />
                  </div>
                </div>

                {/* =================================================
                    QUOTE
                ================================================== */}
                <p className="relative mt-6 flex-1 text-[15px] font-medium leading-7 text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* =================================================
                    DIVIDER
                ================================================== */}
                <div className="relative mt-7 h-1 w-full overflow-hidden rounded-full bg-border">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "30%" }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1 + 0.3,
                    }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>

                {/* =================================================
                    PROFILE
                ================================================== */}
                <div className="relative mt-6 flex items-center gap-3">
                  {/* Profile image */}
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/15">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Profile details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-bold text-foreground">
                        {testimonial.name}
                      </p>

                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 stroke-[2.5] text-primary" />
                    </div>

                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                      {testimonial.role} · {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* =====================================================
            BOTTOM STATEMENT
        ====================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-14 max-w-3xl text-center"
        >
          <p className="text-sm font-medium text-muted-foreground">
            Your next opportunity starts with{" "}
            <span className="font-bold text-foreground">
              knowing what to do next.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}