import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/payment")({
  component: PaymentPage,
  head: () => ({
    meta: [
      {
        title: "Secure Payment — Pathwise",
      },
      {
        name: "description",
        content:
          "Complete your Pathwise Pro subscription through our secure checkout.",
      },
    ],
  }),
});

type PaymentMethod = "card" | "bank" | "transfer";

function PaymentPage() {
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("card");

  const [showDetails, setShowDetails] = useState(false);

  const [form, setForm] = useState({
    email: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  const [processing, setProcessing] = useState(false);

  function updateForm(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handlePayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setProcessing(true);

    /*
      PLACEHOLDER PAYMENT FLOW

      Later, replace this section with your real
      Paystack / Flutterwave / Stripe integration.

      Example:

      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          plan: "pro",
        }),
      });

      Then redirect the user to the provider checkout.
    */

    setTimeout(() => {
      setProcessing(false);

      alert(
        "Payment integration is ready to be connected to your payment provider.",
      );
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-[#f6f8f5] text-[#10251b]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-[#e2e8e1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/upgrade"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#103d2e] transition hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to plans
          </Link>

          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#103d2e]">
              <Sparkles className="h-4 w-4 text-[#f4b740]" />
            </div>

            <span className="text-lg font-extrabold tracking-tight text-[#103d2e]">
              Pathwise
            </span>
          </div>

          <div className="hidden items-center gap-2 text-xs font-semibold text-neutral-500 sm:flex">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            Secure checkout
          </div>
        </div>
      </header>

      {/* =====================================================
          PAGE
      ===================================================== */}

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        {/* ===================================================
            TOP BANNER
        =================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-[#08291e] via-[#103d2e] to-[#18533e] p-7 text-white shadow-[0_25px_70px_-30px_rgba(8,41,30,0.6)] sm:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#f4b740]/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                Secure checkout
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Upgrade to Pathwise{" "}
                <span className="text-[#f4b740]">
                  Pro
                </span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-100/70">
                You're one step away from unlocking unlimited AI career
                tools, advanced job matching and personalized coaching.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                Selected plan
              </p>

              <div className="mt-1 flex items-end gap-2">
                <span className="text-3xl font-extrabold">
                  $9.99
                </span>

                <span className="pb-1 text-xs text-emerald-100/60">
                  / month
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-200">
                <Check className="h-3 w-3" />
                Pro membership
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            CHECKOUT GRID
        =================================================== */}

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_370px]">
          {/* =================================================
              PAYMENT FORM
          ================================================= */}

          <section className="rounded-[1.75rem] border border-[#dfe8df] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <CreditCard className="h-5 w-5 text-emerald-700" />
              </div>

              <div>
                <h2 className="text-base font-extrabold text-[#103d2e]">
                  Payment details
                </h2>

                <p className="mt-1 text-xs text-neutral-400">
                  Choose your preferred payment method and complete
                  your subscription.
                </p>
              </div>
            </div>

            {/* PAYMENT METHODS */}

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <PaymentMethodButton
                active={paymentMethod === "card"}
                icon={CreditCard}
                title="Card"
                description="Visa / Mastercard"
                onClick={() => setPaymentMethod("card")}
              />

              <PaymentMethodButton
                active={paymentMethod === "bank"}
                icon={WalletCards}
                title="Bank"
                description="Bank payment"
                onClick={() => setPaymentMethod("bank")}
              />

              <PaymentMethodButton
                active={paymentMethod === "transfer"}
                icon={Zap}
                title="Transfer"
                description="Instant transfer"
                onClick={() => setPaymentMethod("transfer")}
              />
            </div>

            {/* FORM */}

            <form
              onSubmit={handlePayment}
              className="mt-7 space-y-5"
            >
              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-xs font-bold text-[#103d2e]">
                  Email address
                </label>

                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) =>
                    updateForm(
                      "email",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-[#dfe8df] bg-[#fafcf9] px-4 py-3 text-sm text-neutral-700 outline-none transition placeholder:text-neutral-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />

                <p className="mt-1.5 text-[10px] text-neutral-400">
                  Your payment receipt and subscription information
                  will be sent here.
                </p>
              </div>

              {/* CARD FORM */}

              {paymentMethod === "card" && (
                <>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-[#103d2e]">
                      Cardholder name
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="Name on card"
                      value={form.cardName}
                      onChange={(event) =>
                        updateForm(
                          "cardName",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-[#dfe8df] bg-[#fafcf9] px-4 py-3 text-sm text-neutral-700 outline-none transition placeholder:text-neutral-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-[#103d2e]">
                      Card number
                    </label>

                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        placeholder="1234 5678 9012 3456"
                        value={form.cardNumber}
                        onChange={(event) =>
                          updateForm(
                            "cardNumber",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-[#dfe8df] bg-[#fafcf9] py-3 pl-11 pr-4 text-sm text-neutral-700 outline-none transition placeholder:text-neutral-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-[#103d2e]">
                        Expiry date
                      </label>

                      <input
                        type="text"
                        required
                        placeholder="MM / YY"
                        value={form.expiry}
                        onChange={(event) =>
                          updateForm(
                            "expiry",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-[#dfe8df] bg-[#fafcf9] px-4 py-3 text-sm text-neutral-700 outline-none transition placeholder:text-neutral-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-[#103d2e]">
                        CVV
                      </label>

                      <input
                        type="password"
                        required
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="•••"
                        value={form.cvv}
                        onChange={(event) =>
                          updateForm(
                            "cvv",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-[#dfe8df] bg-[#fafcf9] px-4 py-3 text-sm text-neutral-700 outline-none transition placeholder:text-neutral-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* BANK */}

              {paymentMethod === "bank" && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                      <WalletCards className="h-4 w-4 text-emerald-700" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#103d2e]">
                        Bank payment
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-neutral-500">
                        You'll be redirected to our secure payment
                        provider where you can select your bank and
                        complete the transaction.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TRANSFER */}

              {paymentMethod === "transfer" && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                      <Zap className="h-4 w-4 text-amber-600" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-amber-800">
                        Bank transfer
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-amber-700">
                        Your payment provider will generate secure
                        transfer instructions after you continue.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TERMS */}

              <div className="flex items-start gap-3 rounded-xl bg-[#fafcf9] p-4">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-emerald-300 bg-emerald-50">
                  <Check className="h-3 w-3 text-emerald-600" />
                </div>

                <p className="text-[10px] leading-5 text-neutral-500">
                  By continuing, you agree to Pathwise's subscription
                  terms and authorize the selected payment provider
                  to process your payment.
                </p>
              </div>

              {/* BUTTON */}

              <button
                type="submit"
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f4b740] px-5 py-4 text-sm font-extrabold text-[#211700] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#efab2f] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#211700]/30 border-t-[#211700]" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Continue securely
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Your payment information is securely processed.
              </div>
            </form>
          </section>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <aside className="h-fit space-y-5">
            <section className="rounded-[1.75rem] border border-[#dfe8df] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-[#103d2e]">
                    Pro subscription
                  </p>

                  <p className="text-[10px] text-neutral-400">
                    Monthly membership
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <SummaryRow
                  label="Pro plan"
                  value="$9.99"
                />

                <SummaryRow
                  label="Discount"
                  value="-$0.00"
                  positive
                />

                <div className="border-t border-[#edf1ed]" />

                <SummaryRow
                  label="Total"
                  value="$9.99"
                  total
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDetails((previous) => !previous)
                }
                className="mt-5 flex w-full items-center justify-between rounded-xl bg-[#fafcf9] px-3 py-3 text-[10px] font-bold text-[#103d2e]"
              >
                <span>What's included?</span>

                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showDetails
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {showDetails && (
                <div className="mt-3 space-y-2 rounded-xl bg-[#fafcf9] p-4">
                  {[
                    "Unlimited AI career coaching",
                    "Unlimited mock interviews",
                    "Premium CV reviews",
                    "Advanced job matching",
                    "Personalized career roadmap",
                    "Advanced scholarship matching",
                    "AI skill-gap analysis",
                    "Priority recommendations",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

                      <span className="text-[10px] leading-4 text-neutral-500">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* TRUST CARD */}

            <section className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/60 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                </div>

                <div>
                  <p className="text-xs font-bold text-[#103d2e]">
                    Safe & secure
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-neutral-500">
                    Payments are processed securely through our
                    payment provider. Pathwise does not store your
                    complete card details.
                  </p>
                </div>
              </div>
            </section>

            {/* CANCEL ANYTIME */}

            <section className="rounded-[1.5rem] border border-[#dfe8df] bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                  <Zap className="h-4 w-4 text-amber-600" />
                </div>

                <div>
                  <p className="text-xs font-bold text-[#103d2e]">
                    Cancel anytime
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-neutral-500">
                    You can manage or cancel your subscription from
                    your Pathwise settings.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="mt-10 border-t border-[#e2e8e1] pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-[10px] text-neutral-400 sm:flex-row">
            <p>
              © {new Date().getFullYear()} Pathwise. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Secure checkout
              </span>

              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                Protected payment
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* =========================================================
   PAYMENT METHOD BUTTON
========================================================= */

function PaymentMethodButton({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: typeof CreditCard;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-emerald-400 bg-emerald-50 shadow-sm"
          : "border-[#e5ebe5] bg-[#fafcf9] hover:border-emerald-200 hover:bg-white"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          active
            ? "bg-[#103d2e] text-emerald-200"
            : "bg-white text-neutral-500 shadow-sm"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-3 text-xs font-bold text-[#103d2e]">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-neutral-400">
        {description}
      </p>

      {active && (
        <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-emerald-600">
          <Check className="h-3 w-3" />
          Selected
        </div>
      )}
    </button>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
  positive = false,
  total = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
  total?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`text-xs ${
          total
            ? "font-extrabold text-[#103d2e]"
            : "text-neutral-500"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-xs ${
          total
            ? "font-extrabold text-[#103d2e]"
            : positive
              ? "font-bold text-emerald-600"
              : "font-semibold text-neutral-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}