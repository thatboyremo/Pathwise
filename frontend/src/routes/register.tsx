import { useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { ArrowRight, Chrome, Loader2 } from "lucide-react";

import { register } from "@/api/auth";
import {
  AuthShell,
  Field,
  SubmitButton,
  Divider,
} from "@/components/auth/AuthShell";

export const Route = createFileRoute("/register")({
  component: RegisterPage,

  head: () => ({
    meta: [
      {
        title: "Create Account · Pathwise",
      },
      {
        name: "description",
        content:
          "Create your Pathwise account and start building your career.",
      },
    ],
  }),
});

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    // -----------------------------
    // Frontend validation
    // -----------------------------

    if (
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirm_password
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await register(
        form.username.trim(),
        form.first_name.trim(),
        form.last_name.trim(),
        form.email.trim().toLowerCase(),
        form.password,
        form.confirm_password,
      );

      console.log("REGISTER RESPONSE:", data);

      /*
       * Store the newly-created user's basic information.
       *
       * This allows the profile/settings pages to immediately
       * know what information was entered during registration.
       */
      const registeredUser = {
        id: null,
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
      };

      localStorage.setItem(
        "user",
        JSON.stringify(registeredUser)
      );

      localStorage.setItem(
        "username",
        registeredUser.username
      );

      localStorage.setItem(
        "email",
        registeredUser.email
      );

      localStorage.setItem(
        "first_name",
        registeredUser.first_name
      );

      localStorage.setItem(
        "last_name",
        registeredUser.last_name
      );

      /*
       * Tell AuthContext / other components that
       * authentication information changed.
       */
      window.dispatchEvent(
        new Event("auth-change")
      );

      /*
       * Registration is successful.
       *
       * We send the user to login because your current
       * backend registration endpoint does not appear
       * to automatically authenticate the new account.
       */
      navigate({
        to: "/login",
        search: {
          registered: "true",
        },
      });
    } catch (err: any) {
      console.error(
        "REGISTRATION ERROR:",
        err
      );

      const backendError =
        err?.response?.data;

      if (backendError) {
        /*
         * Django REST Framework often returns:
         *
         * {
         *   "username": ["This username already exists."]
         * }
         */

        if (
          typeof backendError === "string"
        ) {
          setError(backendError);
        } else if (
          backendError.detail
        ) {
          setError(
            backendError.detail
          );
        } else {
          const messages: string[] = [];

          Object.entries(
            backendError
          ).forEach(
            ([field, value]) => {
              if (Array.isArray(value)) {
                messages.push(
                  `${field}: ${value.join(", ")}`
                );
              } else if (
                typeof value === "string"
              ) {
                messages.push(
                  `${field}: ${value}`
                );
              }
            }
          );

          setError(
            messages.length
              ? messages.join(" ")
              : "Unable to create your account."
          );
        }
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    /*
     * Google OAuth will be connected here later.
     *
     * Do NOT put fake authentication logic here.
     */
    alert(
      "Google sign-up will be connected when Google OAuth is configured."
    );
  };

  return (
    <AuthShell
      eyebrow="create account"
      title={
        <>
          Launch your
          <br />
          <span className="text-[#4ade80]">
            career OS.
          </span>
        </>
      }
      subtitle="Free forever plan. No credit card. Your first resume in under 90 seconds."
      footer={
        <>
          Already a member?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#4ade80] hover:underline"
          >
            Sign in →
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        {/* -----------------------------
            Error message
        ------------------------------ */}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300">
            {error}
          </div>
        )}

        {/* -----------------------------
            Name
        ------------------------------ */}

        <div className="grid grid-cols-2 gap-3">
          <Field
            id="first_name"
            label="First name"
            placeholder="Ada"
            autoComplete="given-name"
            value={form.first_name}
            onChange={handleChange}
          />

          <Field
            id="last_name"
            label="Last name"
            placeholder="Lovelace"
            autoComplete="family-name"
            value={form.last_name}
            onChange={handleChange}
          />
        </div>

        {/* -----------------------------
            Username
        ------------------------------ */}

        <Field
          id="username"
          label="Username"
          type="text"
          placeholder="Remo"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
        />

        {/* -----------------------------
            Email
        ------------------------------ */}

        <Field
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
        />

        {/* -----------------------------
            Password
        ------------------------------ */}

        <Field
          id="password"
          label="Create password"
          type="password"
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
        />

        <Field
          id="confirm_password"
          label="Confirm password"
          type="password"
          placeholder="Confirm password"
          autoComplete="new-password"
          value={form.confirm_password}
          onChange={handleChange}
        />

        {/* -----------------------------
            Bonus card
        ------------------------------ */}

        <div className="rounded-xl border border-[#4ade80]/20 bg-[#4ade80]/5 p-3 text-[11px] leading-relaxed text-white/60">
          <span className="font-semibold text-[#4ade80]">
            Bonus:
          </span>{" "}
          The first 500 signups this week unlock the
          Interview Coach add-on — free for life.
        </div>

        {/* -----------------------------
            Terms
        ------------------------------ */}

        <label className="flex items-start gap-2 text-[11px] leading-relaxed text-white/60">
          <input
            type="checkbox"
            defaultChecked
            required
            className="mt-0.5 h-3.5 w-3.5 accent-[#4ade80]"
          />

          <span>
            I agree to the{" "}
            <a
              href="#"
              className="text-[#4ade80] hover:underline"
            >
              Terms
            </a>{" "}
            &{" "}
            <a
              href="#"
              className="text-[#4ade80] hover:underline"
            >
              Privacy Policy
            </a>
            .
          </span>
        </label>

        {/* -----------------------------
            Create account
        ------------------------------ */}

        <SubmitButton>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </SubmitButton>


      </form>
    </AuthShell>
  );
}