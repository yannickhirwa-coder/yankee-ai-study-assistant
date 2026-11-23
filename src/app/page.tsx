
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const features = [
  {
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=85",
    title: "AI Study Tutor",
    description:
      "Ask questions and get clear explanations to understand difficult topics.",
    alt: "Student learning with a laptop",
  },
  {
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&q=85",
    title: "Study Materials",
    description:
      "Keep your learning resources organized in one convenient place.",
    alt: "Books and study materials",
  },
  {
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=85",
    title: "Flashcards",
    description:
      "Practice important concepts and strengthen your memory.",
    alt: "Student writing and revising notes",
  },
  {
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=900&q=85",
    title: "Study Planner",
    description:
      "Organize your learning activities and build consistent habits.",
    alt: "Planning and organizing a schedule",
  },
  {
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=85",
    title: "Learning Progress",
    description:
      "Monitor your progress and see how far you have come.",
    alt: "People collaborating and reviewing progress",
  },
  {
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=85",
    title: "Certifications",
    description:
      "Prepare for certifications and develop practical knowledge.",
    alt: "Students celebrating their learning journey",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Set up your personal learning space.",
  },
  {
    number: "02",
    title: "Choose what to learn",
    description: "Explore topics and ask your AI tutor questions.",
  },
  {
    number: "03",
    title: "Learn and improve",
    description: "Practice, organize your time, and track progress.",
  },
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [authLoading, setAuthLoading] = useState<
    "google" | "github" | null
  >(null);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("yankee-theme");
    const isDark = savedTheme !== "light";

    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    setThemeLoaded(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  function toggleTheme() {
    const nextMode = !darkMode;

    setDarkMode(nextMode);
    document.documentElement.classList.toggle("dark", nextMode);
    localStorage.setItem("yankee-theme", nextMode ? "dark" : "light");
  }

  async function signInWithProvider(provider: "google" | "github") {
    try {
      setAuthError("");
      setAuthLoading(provider);

      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Unable to start sign-in. Please try again."
      );
      setAuthLoading(null);
    }
  }

  const page = darkMode
    ? "bg-slate-950 text-white"
    : "bg-slate-50 text-slate-900";

  const muted = darkMode ? "text-slate-300" : "text-slate-600";

  const card = darkMode
    ? "border-white/10 bg-slate-900"
    : "border-slate-200 bg-white";

  const secondaryCard = darkMode
    ? "border-white/10 bg-slate-900/80"
    : "border-slate-200 bg-white";

  return (
    <main className={`min-h-screen transition-colors duration-300 ${page}`}>
      {/* Navigation */}
      <header
        className={`border-b ${
          darkMode ? "border-white/10" : "border-slate-200"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-2xl font-bold">
            Yankee<span className="text-violet-500">AI</span>
          </Link>

          <div className="hidden items-center gap-7 text-sm md:flex">
            <a href="#features" className={`${muted} hover:text-violet-500`}>
              Features
            </a>
            <a
              href="#how-it-works"
              className={`${muted} hover:text-violet-500`}
            >
              How it works
            </a>
            <a href="#about" className={`${muted} hover:text-violet-500`}>
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle light and dark mode"
              className={`rounded-xl border px-3 py-2 text-lg transition ${
                darkMode
                  ? "border-white/10 hover:bg-white/10"
                  : "border-slate-200 hover:bg-slate-100"
              }`}
            >
              {themeLoaded ? (darkMode ? "☀️" : "🌙") : "◐"}
            </button>

            <Link
              href="/login"
              className={`hidden rounded-lg px-4 py-2 text-sm font-medium hover:text-violet-500 sm:block ${muted}`}
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2 md:py-32">
          <div>
            <span className="inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-500">
              ✦ Your personal AI study companion
            </span>

            <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Learn smarter.
              <span className="block text-violet-500">
                Grow further.
              </span>
            </h1>

            <p className={`mt-6 max-w-xl text-lg leading-8 ${muted}`}>
              Meet Yankee AI, your personal learning companion. Understand
              difficult topics, organize your studies, practice what you
              learn, and take control of your educational journey.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-violet-600 px-7 py-3.5 font-semibold text-white transition hover:bg-violet-500"
              >
                Start learning for free →
              </Link>

              <Link
                href="/login"
                className={`rounded-xl border px-7 py-3.5 font-semibold transition ${
                  darkMode
                    ? "border-white/20 hover:bg-white/10"
                    : "border-slate-300 hover:bg-slate-100"
                }`}
              >
                Log in
              </Link>
            </div>

            <p className={`mt-5 text-sm ${muted}`}>
              Built for curiosity, consistency, and lifelong learning.
            </p>

            {/* Social Sign In */}
            <div className={`mt-10 max-w-md rounded-2xl border p-5 ${card}`}>
              <h3 className="text-lg font-semibold">
                Start your learning journey
              </h3>

              <p className={`mt-1 text-sm ${muted}`}>
                Sign in using your preferred account.
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => signInWithProvider("google")}
                  disabled={authLoading !== null}
                  className={`flex items-center justify-center gap-3 rounded-xl border px-4 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    darkMode
                      ? "border-white/15 bg-white/5 hover:bg-white/10"
                      : "border-slate-200 bg-white hover:bg-slate-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 48 48"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
                    />
                    <path
                      fill="#4A90E2"
                      d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.8a20 20 0 0 0 0 17.6l6.8-5.3Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9A19.7 19.7 0 0 0 24 4 20 20 0 0 0 5.8 15.2l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"
                    />
                  </svg>
                  {authLoading === "google"
                    ? "Connecting to Google..."
                    : "Continue with Google"}
                </button>

                <button
                  type="button"
                  onClick={() => signInWithProvider("github")}
                  disabled={authLoading !== null}
                  className={`flex items-center justify-center gap-3 rounded-xl border px-4 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    darkMode
                      ? "border-white/15 bg-white/5 hover:bg-white/10"
                      : "border-slate-200 bg-white hover:bg-slate-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.6-1.3-1.6-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.4-5.5-6.1 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.7-2.8 5.8-5.5 6.1.4.4.8 1.1.8 2.1v3.2c0 .3.2.7.8.6A11.1 11.1 0 0 0 12 .9Z" />
                  </svg>
                  {authLoading === "github"
                    ? "Connecting to GitHub..."
                    : "Continue with GitHub"}
                </button>

                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-slate-500/20" />
                  <span className={`text-xs ${muted}`}>OR</span>
                  <div className="h-px flex-1 bg-slate-500/20" />
                </div>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-3 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                  Continue with Email
                </Link>

                {authError && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500"
                  >
                    {authError}
                  </p>
                )}

                <p className={`text-center text-xs ${muted}`}>
                  By continuing, you agree to use Yankee AI responsibly.
                </p>
              </div>
            </div>
          </div>

          {/* AI Preview */}
          <div className={`overflow-hidden rounded-2xl border shadow-xl ${secondaryCard}`}>
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=85"
              alt="Students learning and collaborating together"
              className="h-64 w-full object-cover"
            />

            <div className="p-6">
              <div className="flex items-center justify-between border-b border-slate-500/20 pb-5">
                <div>
                  <p className={`text-sm ${muted}`}>Your learning space</p>
                  <h2 className="mt-1 text-xl font-semibold">
                    Welcome to Yankee AI
                  </h2>
                </div>

                <div className="rounded-xl bg-violet-500/15 p-3 text-2xl">
                  ✨
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/10 p-5">
                <p className="text-sm font-medium text-violet-500">
                  AI STUDY TUTOR
                </p>

                <p className="mt-3 text-lg font-semibold">
                  What would you like to learn today?
                </p>

                <p className={`mt-2 text-sm leading-6 ${muted}`}>
                  Ask questions, explore new ideas, and get explanations
                  that help you understand.
                </p>

                <div
                  className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
                    darkMode
                      ? "border-white/10 bg-slate-950 text-slate-400"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  Ask your AI tutor anything...
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className={`rounded-xl border p-4 ${card}`}>
                  <p className="text-sm font-semibold">Study materials</p>
                  <p className={`mt-1 text-xs ${muted}`}>
                    Learn at your own pace
                  </p>
                </div>

                <div className={`rounded-xl border p-4 ${card}`}>
                  <p className="text-sm font-semibold">Your progress</p>
                  <p className={`mt-1 text-xs ${muted}`}>
                    Celebrate every step
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="font-semibold uppercase tracking-widest text-violet-500">
            Everything you need
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            One platform. Better learning.
          </h2>

          <p className={`mx-auto mt-4 max-w-2xl ${muted}`}>
            Tools designed to make your learning journey more organized,
            effective, and enjoyable.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:border-violet-500/50 ${card}`}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                <span className="absolute bottom-4 left-5 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className={`mt-3 leading-7 ${muted}`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className={`border-y py-20 ${
          darkMode
            ? "border-white/10 bg-slate-900/50"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-semibold uppercase tracking-widest text-violet-500">
              Get started
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Three steps to better learning
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-xl font-bold text-white">
                  {step.number}
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className={`mt-3 leading-7 ${muted}`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-5xl px-6 py-24 text-center">
        <p className="font-semibold uppercase tracking-widest text-violet-500">
          Our purpose
        </p>

        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
          Learning should never stop.
        </h2>

        <p className={`mx-auto mt-6 max-w-3xl text-lg leading-8 ${muted}`}>
          Yankee AI is built around one idea: everyone should have access
          to tools that help them understand, explore, and grow. Whether
          you are learning technology, preparing for an exam, or exploring
          a new skill, your learning journey starts here.
        </p>

        <Link
          href="/signup"
          className="mt-9 inline-block rounded-xl bg-violet-600 px-8 py-4 font-semibold text-white transition hover:bg-violet-500"
        >
          Start your learning journey →
        </Link>
      </section>

      {/* Footer */}
      <footer
        className={`border-t py-8 ${
          darkMode ? "border-white/10" : "border-slate-200"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Link href="/" className="text-xl font-bold">
            Yankee<span className="text-violet-500">AI</span>
          </Link>

          <p className={`text-sm ${muted}`}>
            © {currentYear ?? "2026"} Yankee AI. Keep learning. Keep growing.
          </p>

          <div className="flex gap-5 text-sm">
            <Link href="/login" className="hover:text-violet-500">
              Login
            </Link>

            <Link href="/signup" className="hover:text-violet-500">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
