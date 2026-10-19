import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { login } from "@/api/auth";
import { useState } from "react";

import {
  AuthShell,
  Field,
  SubmitButton,
  Divider,
} from "@/components/auth/AuthShell";

export const Route = createFileRoute("/login")({
  component: LoginPage,

  head: () => ({
    meta: [
      {
        title: "Sign in · Pathwise",
      },
      {
        name: "description",
        content:
          "Sign in to Pathwise and continue building your career OS.",
      },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value.trim(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("LOGIN FORM:", form);

    try {
      const data = await login(form.identifier, form.password);

      console.log("LOGIN RESPONSE:", data);

      navigate({
        to: "/dashboard",
      });
    } catch (error) {
      console.error("LOGIN ERROR:", error);
    }
  };

  /**
   * Google authentication
   *
   * This is currently just the UI button.
   * We can connect this to your Django Google OAuth endpoint next.
   */
  const handleGoogleLogin = () => {
    console.log("Continue with Google");
  };

  return (
    <AuthShell
      eyebrow="sign in"
      title={
        <>
          Welcome back,
          <br />
          <span className="text-[#f97316]">builder.</span>
        </>
      }
      subtitle="Pick up where you left off — your resume, interviews and roadmap are waiting."
      footer={
        <>
          New here?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#4ade80] hover:underline"
          >
            Create an account →
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Username / Email */}
        <Field
          id="identifier"
          label="Username"
          placeholder="username"
          type="text"
          autoComplete="username"
          value={form.identifier}
          onChange={handleChange}
        />

        {/* Password */}
        <Field
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
        />

        {/* Remember / Forgot password */}
        <div className="flex items-center justify-between text-xs">
          <label className="inline-flex cursor-pointer items-center gap-2 text-white/60">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-[#f97316]"
            />

            Remember me
          </label>

          <Link
            to="/forgot-password"
            className="font-medium text-[#f97316] transition hover:text-[#fb923c] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Normal login */}
        <SubmitButton>
          <>
            Enter the platform
            <ArrowRight className="h-4 w-4" />
          </>
        </SubmitButton>

        {/* Divider */}
        <Divider label="or continue with" />

        {/* =====================================================
            GOOGLE LOGIN
        ====================================================== */}

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/8 hover:shadow-lg"
        >
          {/* Google logo */}
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.92v2.43h3.14c1.84-1.69 2.93-4.18 2.93-7.38Z"
            />

            <path
              fill="#34A853"
              d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.51A9.74 9.74 0 0 0 12 21.5Z"
            />

            <path
              fill="#FBBC05"
              d="M6.54 13.6a5.84 5.84 0 0 1 0-3.7V7.39H3.3a9.74 9.74 0 0 0 0 8.72l3.24-2.51Z"
            />

            <path
              fill="#EA4335"
              d="M12 5.87c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 2.97 14.63 2 12 2a9.74 9.74 0 0 0-8.7 5.39l3.24 2.51C7.31 7.59 9.46 5.87 12 5.87Z"
            />
          </svg>

          <span>Continue with Google</span>
        </button>
      </form>
    </AuthShell>
  );
}