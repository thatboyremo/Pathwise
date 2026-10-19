import { motion } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the AI resume builder work?",
    answer:
      "Our AI analyzes your experience, skills, and target job descriptions to generate ATS-optimized resumes. It identifies relevant keywords, structures your achievements using strong action verbs, and formats everything to pass through applicant tracking systems while impressing human recruiters.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Absolutely. We use strong encryption to protect your data. Your information is never sold or shared with third parties, and you remain in control of your career information. You can delete your data whenever you choose.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes. You can cancel your subscription at any time. If you cancel, you will retain access to your plan until the end of your current billing period.",
  },
  {
    question: "How realistic are the AI interview simulations?",
    answer:
      "Pathwise's interview coach uses realistic interview questions and adapts them to your role, experience level, and career goals. It provides feedback on your answers and helps you identify areas where you can improve.",
  },
  {
    question: "Does Pathwise work for non-tech roles?",
    answer:
      "Yes. Pathwise is designed for professionals across different industries and career paths, including technology, marketing, finance, healthcare, education, business, and more.",
  },
  {
    question: "What is included in the free plan?",
    answer:
      "The free plan gives you access to essential Pathwise features so you can explore the platform and understand how AI can improve your career journey before deciding whether you need additional capabilities.",
  },
];

export function FAQ() {
  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-white py-24 lg:py-32"
    >
      {/* =====================================================
          SUBTLE BACKGROUND GLOW
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
            <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
            Frequently Asked Questions
          </span>

          {/* Heading */}

          <h2
            className="mt-4 text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Questions?{" "}
            <span className="font-extrabold text-primary">
              We've got answers.
            </span>
          </h2>

          {/* Description */}

          <p className="mt-4 text-base font-medium leading-7 text-muted-foreground sm:text-lg">
            Everything you need to know about Pathwise and how it can help you
            move forward in your career.
          </p>
        </motion.div>

        {/* =====================================================
            FAQ GRID
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="group relative"
              >
                {/* Hover glow */}

                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                />

                {/* FAQ Card */}

                <AccordionItem
                  value={`item-${index}`}
                  className="relative overflow-hidden rounded-2xl border border-border/80 bg-white px-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 sm:px-7"
                >
                  <AccordionTrigger className="py-6 text-left text-base font-bold tracking-tight text-foreground hover:no-underline [&>svg]:h-5 [&>svg]:w-5 [&>svg]:font-bold [&>svg]:text-muted-foreground [&>svg]:transition-colors [&>svg]:duration-300 group-hover:[&>svg]:text-primary">
                    <span className="flex items-center gap-4">
                      {/* Number */}

                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-extrabold text-primary shadow-sm transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/20">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span>{faq.question}</span>
                    </span>
                  </AccordionTrigger>

                  <AccordionContent className="pb-6 pl-13 pr-8 text-sm font-medium leading-6 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>

                  {/* Bottom accent */}

                  <div className="absolute bottom-0 left-6 right-6 h-1 overflow-hidden rounded-full bg-border sm:left-7 sm:right-7">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "35%" }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.08 + 0.3,
                      }}
                      className="h-full bg-primary"
                    />
                  </div>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

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
            Still have questions?{" "}
            <span className="font-bold text-foreground">
              Pathwise is here to help you move forward.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}