"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const requiredMessage = "Email and password are required.";

function sanitizeRedirectPath(raw: string | null) {
  if (!raw) {
    return "/dashboard";
  }

  try {
    const url = new URL(raw, "http://localhost");
    if (url.origin !== "http://localhost") {
      return "/dashboard";
    }
  } catch {
    return "/dashboard";
  }

  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }

  return raw;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirectPath(searchParams.get("redirectTo"));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError(requiredMessage);
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { error?: string } | undefined;

      if (!response.ok) {
        setError(payload?.error ?? "Unable to sign in. Please try again.");
        return;
      }

      window.location.href = redirectTo;
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back to NutriTrack
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Log in to continue tracking your nutrition goals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to NutriTrack?{" "}
          <Link
            href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-emerald-600 hover:text-emerald-700"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

