
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  function getEmailRedirectUrl() {
    return `${window.location.origin}/login`;
  }

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");
    setPendingEmail("");

    try {
      const supabase = createClient();

      const normalizedEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: getEmailRedirectUrl(),
        },
      });

      if (error) throw error;

      if (data.user?.identities?.length === 0) {
        setError(
          "An account may already exist with this email. Try signing in instead."
        );
        return;
      }

      if (data.session) {
        setMessage(
          "Your account has been created and you are signed in."
        );
      } else {
        setPendingEmail(normalizedEmail);
        setMessage(
          "Your registration was received. Please check your inbox and spam folder for a verification email before signing in."
        );
      }

      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendEmail() {
    if (!pendingEmail) return;

    setResending(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
        options: {
          emailRedirectTo: getEmailRedirectUrl(),
        },
      });

      if (error) throw error;

      setMessage(
        "Your verification email request was submitted. Check your inbox and spam folder."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend verification email."
      );
    } finally {
      setResending(false);
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl transition-colors dark:border-slate-800 dark:bg-slate-900">

        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold">
            Yankee<span className="text-violet-500">AI</span>
          </Link>

          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Create your student account
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full name
            </label>

            <input
              id="name"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email address
            </label>

            <input
              id="email"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>

            <input
              id="password"
              required
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={inputClasses}
            />
          </div>

          {message && (
            <p
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-950/40 dark:text-green-300"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}

          {pendingEmail && (
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full rounded-xl border border-blue-300 p-3 font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50 dark:border-blue-500/40 dark:text-blue-400 dark:hover:bg-blue-950/40"
            >
              {resending
                ? "Sending..."
                : "Resend verification email"}
            </button>
          )}

          <button
            disabled={loading || resending}
            type="submit"
            className="w-full rounded-xl bg-blue-600 p-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Log in
          </Link>
        </p>

        <p className="mt-5 text-center text-sm text-slate-500">
          <Link
            href="/"
            className="transition hover:text-violet-600 dark:hover:text-violet-400"
          >
            ← Back to home
          </Link>
        </p>

      </div>
    </main>
  );
}
