import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Sparkles,
} from "lucide-react";

import { Link } from "@tanstack/react-router";


// ============================================================
// FOOTER
// ============================================================

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#e6e7e1] bg-[#0d1f17] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">

        {/* ====================================================
            TOP SECTION
        ==================================================== */}

        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* ==================================================
              BRAND
          ================================================== */}

          <div>

            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex w-fit items-center gap-2.5"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0f3d2e] ring-1 ring-white/10">
                <Sparkles className="h-5 w-5 text-[#f4b740]" />
              </div>

              <span
                className="text-xl font-extrabold tracking-tight"
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Pathwise
              </span>
            </Link>


            {/* Description */}
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              Your AI-powered career companion for building
              better CVs, preparing for interviews, finding
              scholarships and making smarter career moves.
            </p>


            {/* =================================================
                SOCIAL LINKS
            ================================================= */}

            <div className="mt-6 flex items-center gap-3">

              {/* GitHub */}
              <ExternalFooterLink
                href="https://github.com"
                ariaLabel="GitHub"
              >
                <Github className="h-4 w-4" />
              </ExternalFooterLink>


              {/* LinkedIn */}
              <ExternalFooterLink
                href="https://linkedin.com"
                ariaLabel="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </ExternalFooterLink>


              {/* Email */}
              <ExternalFooterLink
                href="mailto:support@aiPathwise.com"
                ariaLabel="Email Pathwise"
              >
                <Mail className="h-4 w-4" />
              </ExternalFooterLink>

            </div>

          </div>


          {/* ==================================================
              PRODUCT
          ================================================== */}

          <FooterColumn title="Product">

            <InternalFooterLink to="/dashboard">
              Dashboard
            </InternalFooterLink>

            <InternalFooterLink to="/dashboard/resume">
              CV Studio
            </InternalFooterLink>

            <InternalFooterLink to="/dashboard/interview">
              Mock Interview
            </InternalFooterLink>

            <InternalFooterLink to="/scholarships">
              Scholarships
            </InternalFooterLink>

            <InternalFooterLink to="/dashboard/coach">
              AI Career Advisor
            </InternalFooterLink>

          </FooterColumn>


          {/* ==================================================
              RESOURCES
          ================================================== */}

          <FooterColumn title="Resources">

            <InternalFooterLink to="/career-guides">
              Career Guides
            </InternalFooterLink>

            <InternalFooterLink to="/cv-tips">
              CV Tips
            </InternalFooterLink>

            <InternalFooterLink to="/interview-tips">
              Interview Tips
            </InternalFooterLink>

            <InternalFooterLink to="/scholarship-guide">
              Scholarship Guide4
            </InternalFooterLink>

            <InternalFooterLink to="/blog">
              Blog
            </InternalFooterLink>

          </FooterColumn>


          {/* ==================================================
              COMPANY
          ================================================== */}

          <FooterColumn title="Company">

            <InternalFooterLink to="/about">
              About
            </InternalFooterLink>

            <InternalFooterLink to="/contact">
              Contact
            </InternalFooterLink>

            <InternalFooterLink to="/privacy">
              Privacy
            </InternalFooterLink>

            <InternalFooterLink to="/terms">
              Terms
            </InternalFooterLink>

            <ExternalFooterLink
              href="mailto:support@aiPathwise.com"
              showArrow
            >
              Help Center
            </ExternalFooterLink>

          </FooterColumn>

        </div>


        {/* ====================================================
            CTA
        ==================================================== */}

        <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-6 sm:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f4b740]/10 px-3 py-1.5 text-xs font-semibold text-[#f4b740]">

                <Sparkles className="h-3.5 w-3.5" />

                Build your future

              </div>


              {/* Heading */}
              <h3 className="mt-4 text-xl font-bold sm:text-2xl">
                Ready to level up your career?
              </h3>


              {/* Description */}
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                Analyze your CV, practice interviews and
                discover opportunities designed around your goals.
              </p>

            </div>


            {/* CTA */}
            <InternalFooterLink
              to="/dashboard/resume"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#f4b740] px-6 py-3 text-sm font-bold text-[#0d1f17] transition hover:-translate-y-0.5 hover:bg-[#ffc95c]"
              arrowClassName="h-4 w-4 opacity-100"
            >
              Improve my CV
            </InternalFooterLink>

          </div>

        </div>


        {/* ====================================================
            BOTTOM
        ==================================================== */}

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} Pathwise. All rights reserved.
          </p>


          <div className="flex items-center gap-5">

            <span>
              Built with AI
            </span>

            <span className="h-1 w-1 rounded-full bg-white/30" />

            <span>
              Made for ambitious careers
            </span>

          </div>

        </div>

      </div>
    </footer>
  );
}


// ============================================================
// FOOTER COLUMN
// ============================================================

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>

      <h3 className="text-sm font-semibold text-white">
        {title}
      </h3>


      <div className="mt-5 flex flex-col gap-3">
        {children}
      </div>

    </div>
  );
}


// ============================================================
// INTERNAL ROUTE LINK
// ============================================================

function InternalFooterLink({
  to,
  children,
  className,
  arrowClassName,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  arrowClassName?: string;
}) {
  return (
    <Link
      to={to}
      className={
        className ??
        "group flex w-fit items-center gap-1 text-sm text-white/50 transition hover:text-white"
      }
    >

      {children}

      <ArrowUpRight
        className={
          arrowClassName ??
          "h-3 w-3 translate-y-0.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-70"
        }
      />

    </Link>
  );
}


// ============================================================
// EXTERNAL URL LINK
// ============================================================

function ExternalFooterLink({
  href,
  children,
  ariaLabel,
  showArrow = false,
}: {
  href: string;
  children: React.ReactNode;
  ariaLabel?: string;
  showArrow?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={
        href.startsWith("mailto:")
          ? undefined
          : "_blank"
      }
      rel={
        href.startsWith("mailto:")
          ? undefined
          : "noopener noreferrer"
      }
      className={
        showArrow
          ? "group flex w-fit items-center gap-1 text-sm text-white/50 transition hover:text-white"
          : "grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
      }
    >

      {children}

      {showArrow && (
        <ArrowUpRight
          className="h-3 w-3 translate-y-0.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-70"
        />
      )}

    </a>
  );
}