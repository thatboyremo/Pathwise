import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Pathwise — AI Career Assistant",
      },
      {
        name: "description",
        content:
          "AI-powered career guidance, CV analysis, job matching, interview preparation and scholarships.",
      },
    ],
  }),

  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main>
        {/* Black Hero + Navbar */}
        <Hero />

        {/* White sections */}
        <section className="bg-white">
          <Features />
        </section>

        <section className="bg-slate-50">
          <HowItWorks />
        </section>

        <section className="bg-white">
          <Stats />
        </section>

        <section className="bg-slate-50">
          <Testimonials />
        </section>

        <section className="bg-white">
          <Pricing />
        </section>

        <section className="bg-slate-50">
          <FAQ />
        </section>

        <section className="bg-white">
          <CTA />
        </section>
      </main>

      <Footer />
    </div>
  );
}