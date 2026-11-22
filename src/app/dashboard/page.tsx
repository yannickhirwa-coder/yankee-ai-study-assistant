
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { createClient } from "@/lib/supabase/client";

const sections = [
  { name: "Dashboard", icon: "⌂", path: "/dashboard" },
  { name: "AI Tutor", icon: "✦", path: "/#tutor" },
  { name: "My Materials", icon: "▤", path: "/materials" },
  { name: "Flashcards", icon: "▣", path: "/flashcards" },
  { name: "Study Planner", icon: "◷", path: "/study-planner" },
  { name: "IT Certifications", icon: "♧", path: "/certifications" },
  { name: "My Progress", icon: "↗", path: "/progress" },
];

type Message = {
  role: "user" | "assistant";
  content: string;
};

type LearningFormat = "tutor" | "flashcards" | "podcast" | "quiz";

type GeneratedFlashcard = {
  question: string;
  answer: string;
  subject?: string;
};

type DashboardStats = {
  tasks: number;
  completedTasks: number;
  flashcards: number;
  masteredCards: number;
  materials: number;
  activities: number;
};

const subjects = [
  "Programming",
  "Networking",
  "Cybersecurity",
  "Technology",
  "Other",
];

function parseFlashcards(answer: string): GeneratedFlashcard[] {
  const cleaned = answer
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error(
      "The AI response did not contain valid flashcard data. Please try again."
    );
  }

  let parsed: { cards?: unknown };

  try {
    parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  } catch {
    throw new Error(
      "The AI returned invalid flashcard data. Please try again."
    );
  }

  if (!Array.isArray(parsed.cards)) {
    throw new Error("No flashcards were found in the AI response.");
  }

  const validCards = parsed.cards
    .filter(
      (card): card is GeneratedFlashcard =>
        typeof card === "object" &&
        card !== null &&
        typeof (card as GeneratedFlashcard).question === "string" &&
        typeof (card as GeneratedFlashcard).answer === "string" &&
        (card as GeneratedFlashcard).question.trim().length > 0 &&
        (card as GeneratedFlashcard).answer.trim().length > 0
    )
    .slice(0, 10);

  if (validCards.length === 0) {
    throw new Error("The AI did not generate any usable flashcards.");
  }

  return validCards;
}

export default function Home() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [active, setActive] = useState("Dashboard");
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [showFormatPopup, setShowFormatPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [flashcardNotice, setFlashcardNotice] = useState("");

  const [stats, setStats] = useState<DashboardStats>({
    tasks: 0,
    completedTasks: 0,
    flashcards: 0,
    masteredCards: 0,
    materials: 0,
    activities: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);
  const [studentName, setStudentName] = useState("Student");

  const learningFormats: {
    id: LearningFormat;
    icon: string;
    title: string;
    description: string;
  }[] = [
    {
      id: "tutor",
      icon: "🎓",
      title: "AI Tutor",
      description: "Understand a topic through a step-by-step explanation.",
    },
    {
      id: "flashcards",
      icon: "🗂️",
      title: "Flashcards",
      description: "Turn what you're learning into revision cards.",
    },
    {
      id: "podcast",
      icon: "🎧",
      title: "Simple Podcast",
      description: "Explore a topic through a conversational lesson script.",
    },
    {
      id: "quiz",
      icon: "📝",
      title: "Quiz",
      description: "Check your understanding with questions and explanations.",
    },
  ];

  // Load the student's learning statistics from Supabase.
  useEffect(() => {
    let activeRequest = true;

    async function loadDashboard() {
      setStatsLoading(true);

      const { data: authData } = await supabase.auth.getUser();

      if (!activeRequest) return;

      if (!authData.user) {
        setStatsLoading(false);
        return;
      }

      const user = authData.user;

      setStudentName(
        user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Student"
      );

      const [tasks, cards, materials, activities] = await Promise.all([
        supabase
          .from("study_tasks")
          .select("id,completed", { count: "exact" })
          .eq("user_id", user.id),

        supabase
          .from("flashcards")
          .select("id,mastered", { count: "exact" })
          .eq("user_id", user.id),

        supabase
          .from("materials")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),

        supabase
          .from("skill_progress")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
      ]);

      if (!activeRequest) return;

      setStats({
        tasks: tasks.count ?? tasks.data?.length ?? 0,
        completedTasks:
          tasks.data?.filter((task) => task.completed).length ?? 0,
        flashcards: cards.count ?? cards.data?.length ?? 0,
        masteredCards:
          cards.data?.filter((card) => card.mastered).length ?? 0,
        materials: materials.count ?? materials.data?.length ?? 0,
        activities: activities.count ?? activities.data?.length ?? 0,
      });

      setStatsLoading(false);
    }

    loadDashboard();

    return () => {
      activeRequest = false;
    };
  }, [supabase]);

  function openSection(sectionName: string) {
    const selected = sections.find(
      (section) => section.name === sectionName
    );

    if (!selected) return;

    if (sectionName === "AI Tutor") {
      setActive("AI Tutor");
      setError("");
      setFlashcardNotice("");

      setTimeout(() => {
        document.getElementById("tutor-workspace")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

      return;
    }

    if (sectionName === "Dashboard") {
      setActive("Dashboard");
      router.push("/dashboard");
      return;
    }

    router.push(selected.path);
  }

  function sendMessage() {
    const query = question.trim();

    if (!query || loading) return;

    setPendingQuestion(query);
    setShowFormatPopup(true);
    setError("");
    setFlashcardNotice("");
  }

  async function saveGeneratedFlashcards(answer: string) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(
        "Please log in before saving AI-generated flashcards."
      );
    }

    const generatedCards = parseFlashcards(answer);

    const records = generatedCards.map((card) => ({
      user_id: user.id,
      question: card.question.trim(),
      answer: card.answer.trim(),
      subject: subjects.includes(card.subject || "")
        ? card.subject
        : "Other",
      mastered: false,
    }));

    const { data, error: insertError } = await supabase
      .from("flashcards")
      .insert(records)
      .select();

    if (insertError) {
      throw new Error(
        `Flashcards were generated but could not be saved: ${insertError.message}`
      );
    }

    return data || [];
  }

  async function generateAnswer(format: LearningFormat) {
    const originalQuestion = pendingQuestion.trim();

    if (!originalQuestion || loading) return;

    const instructions: Record<LearningFormat, string> = {
      tutor: `
Act as a patient and expert personal tutor.
Explain the student's question step by step using simple language.
Include clear examples, important points, and a short recap.
Encourage understanding rather than memorization.
`,
      flashcards: `
You are a professional educational flashcard generator.

Create 8 to 10 useful question-and-answer flashcards based on the student's topic.

Return ONLY valid JSON. No Markdown, code fences, or introductory text.

Use exactly this structure:

{
  "cards": [
    {
      "question": "What is computer networking?",
      "answer": "The connection of devices to share data and resources.",
      "subject": "Networking"
    }
  ]
}

RULES:
1. Generate 8 to 10 cards.
2. Every card must have a clear question and accurate answer.
3. Keep answers concise and useful for revision.
4. Do not repeat questions.
5. Use one of these subjects only:
   Programming, Networking, Cybersecurity, Technology, Other.
6. Select the subject that best matches the student's topic.
7. Ensure the JSON is valid.
`,
      podcast: `
Create a short, engaging podcast-style lesson script about the student's topic.
Use a friendly host voice and natural spoken language.
Include an introduction, explanations, relatable examples, and a closing recap.
Label the host's dialogue clearly.
Produce a written script, not an audio recording.
`,
      quiz: `
Create a quiz with 5 multiple-choice questions about the student's topic.
Give each question 4 answer options labelled A, B, C, and D.
Put the answer key and explanations after all the questions
so the student can attempt the quiz first.
`,
    };

    const formattedQuery = `
${instructions[format]}

Student's original question:
${originalQuestion}
`;

    setShowFormatPopup(false);
    setQuestion("");
    setPendingQuestion("");

    setMessages((previous) => [
      ...previous,
      { role: "user", content: originalQuestion },
    ]);

    setError("");
    setFlashcardNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: formattedQuery,
          user: "yankee-student-1",
          ...(conversationId
            ? { conversation_id: conversationId }
            : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to get an answer.");
      }

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      if (format === "flashcards") {
        const savedCards = await saveGeneratedFlashcards(data.answer);

        setFlashcardNotice(
          `Your ${savedCards.length} new flashcards are ready!`
        );

        setMessages((previous) => [
          ...previous,
          {
            role: "assistant",
            content:
              `I've created ${savedCards.length} flashcards and saved them to your account.\n\n` +
              `You can find them in My Flashcards whenever you're ready to revise.`,
          },
        ]);
      } else {
        setMessages((previous) => [
          ...previous,
          {
            role: "assistant",
            content: data.answer,
          },
        ]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    setMessages([]);
    setQuestion("");
    setPendingQuestion("");
    setShowFormatPopup(false);
    setConversationId("");
    setError("");
    setFlashcardNotice("");
  }

  const completionRate =
    stats.tasks > 0
      ? Math.round((stats.completedTasks / stats.tasks) * 100)
      : 0;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 md:flex">

        {/* Sidebar */}
        <aside className="w-full bg-slate-950 p-5 text-white md:min-h-screen md:w-64 md:shrink-0 md:p-6">
          <div className="mb-7">
            <div className="text-2xl font-bold tracking-tight">
              Yankee<span className="text-cyan-400"> AI.</span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Your personal study companion
            </p>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Your workspace
          </p>

          <nav className="flex gap-2 overflow-x-auto pb-2 md:block md:space-y-2 md:overflow-visible">
            {sections.map((section) => (
              <button
                key={section.name}
                onClick={() => openSection(section.name)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition md:w-full ${
                  active === section.name
                    ? "bg-cyan-500 font-semibold text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{section.icon}</span>
                {section.name}
              </button>
            ))}
          </nav>

          <div className="mt-10 hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 md:block">
            <p className="text-sm font-semibold">One step at a time.</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              You don't have to learn everything today. Just keep making progress.
            </p>
          </div>
        </aside>

        {/* Main workspace */}
        <section className="min-w-0 flex-1 p-5 sm:p-6 md:p-10">

          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your learning workspace
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                {active}
              </h1>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
              <span className="mr-2 text-green-500">●</span>
              Learning mode
            </div>
          </header>

          {active === "Dashboard" ? (
            <>
              {/* Welcome banner */}
              <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 p-7 text-white sm:p-9">
                <p className="text-sm font-semibold text-cyan-300">
                  YOUR LEARNING JOURNEY
                </p>

                <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
                  Welcome back, {studentName}.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                  Every question you ask, every concept you practise, and every
                  skill you develop brings you closer to your goals. What shall
                  we learn today?
                </p>

                <button
                  onClick={() => openSection("AI Tutor")}
                  className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  Ask your AI Tutor →
                </button>
              </div>

              {/* Student statistics */}
              <div className="mb-9">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold">
                      Your learning snapshot
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      A quick look at what you've been working on.
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/progress")}
                    className="text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-400"
                  >
                    View full progress →
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon="📅"
                    title="Study tasks"
                    value={statsLoading ? "—" : stats.tasks}
                    detail={
                      statsLoading
                        ? "Loading your activity..."
                        : `${stats.completedTasks} completed`
                    }
                  />

                  <StatCard
                    icon="🧠"
                    title="Flashcards"
                    value={statsLoading ? "—" : stats.flashcards}
                    detail={
                      statsLoading
                        ? "Loading your activity..."
                        : `${stats.masteredCards} mastered`
                    }
                  />

                  <StatCard
                    icon="📚"
                    title="My materials"
                    value={statsLoading ? "—" : stats.materials}
                    detail="Saved learning resources"
                  />

                  <StatCard
                    icon="💻"
                    title="IT activities"
                    value={statsLoading ? "—" : stats.activities}
                    detail="Recorded practice activities"
                  />
                </div>
              </div>

              {/* Study planner progress */}
              <div className="mb-9 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold">Study task progress</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Keep moving forward, one task at a time.
                    </p>
                  </div>

                  <span className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                    {statsLoading ? "—" : `${completionRate}%`}
                  </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                    style={{
                      width: `${statsLoading ? 0 : completionRate}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {statsLoading
                    ? "Loading your study tasks..."
                    : `${stats.completedTasks} of ${stats.tasks} study tasks completed.`}
                </p>
              </div>

              {/* Workspace cards */}
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-bold">
                    Explore your workspace
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Everything you need to learn, practise and stay organized.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    {
                      icon: "✦",
                      title: "AI Tutor",
                      description:
                        "Ask questions, explore difficult concepts and learn at your own pace.",
                    },
                    {
                      icon: "▤",
                      title: "My Materials",
                      description:
                        "Keep your notes, documents and learning resources organized.",
                    },
                    {
                      icon: "▣",
                      title: "Flashcards",
                      description:
                        "Strengthen your memory with question-and-answer practice.",
                    },
                    {
                      icon: "◷",
                      title: "Study Planner",
                      description:
                        "Set learning goals, manage tasks and build consistency.",
                    },
                    {
                      icon: "♧",
                      title: "IT Certifications",
                      description:
                        "Discover learning platforms, courses and practical exercises.",
                    },
                    {
                      icon: "↗",
                      title: "My Progress",
                      description:
                        "See your learning activity and celebrate your achievements.",
                    },
                  ].map((item) => (
                    <button
                      key={item.title}
                      onClick={() => openSection(item.title)}
                      className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-cyan-500"
                    >
                      <span className="text-2xl">{item.icon}</span>

                      <h3 className="mt-4 font-bold">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>

                      <p className="mt-4 text-sm font-semibold text-cyan-700 transition group-hover:translate-x-1 dark:text-cyan-400">
                        Open section →
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div
              id="tutor-workspace"
              className="flex min-h-[500px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
                <div>
                  <h2 className="font-bold">Yankee AI Tutor</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    A patient learning partner, whenever you need one.
                  </p>
                </div>

                <button
                  onClick={startNewChat}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  + New chat
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.length === 0 && (
                  <div className="mx-auto mt-16 max-w-md text-center">
                    <div className="text-5xl">✦</div>

                    <h3 className="mt-5 text-xl font-bold">
                      What would you like to learn today?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      There are no silly questions here. Ask about programming,
                      networking, cybersecurity, databases or anything else
                      you're studying.
                    </p>

                    <button
                      onClick={() =>
                        setQuestion(
                          "Explain computer networking in simple terms."
                        )
                      }
                      className="mt-5 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800 hover:bg-cyan-100 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-300 dark:hover:bg-cyan-900"
                    >
                      Try a sample question
                    </button>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 ${
                        message.role === "user"
                          ? "bg-slate-950 text-white dark:bg-cyan-700"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    Thinking through your question...
                  </div>
                )}

                {flashcardNotice && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
                    <p className="font-semibold">
                      ✓ {flashcardNotice}
                    </p>

                    <button
                      onClick={() => router.push("/flashcards")}
                      className="mt-3 rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
                    >
                      Open My Flashcards →
                    </button>
                  </div>
                )}

                {error && (
                  <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                    {error}
                  </p>
                )}
              </div>

              <form
                className="flex gap-3 border-t border-slate-200 p-4 dark:border-slate-700"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage();
                }}
              >
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask anything you're learning..."
                  disabled={loading}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800"
                />

                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send ↑
                </button>
              </form>
            </div>
          )}

          <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-400 dark:border-slate-800">
            Yankee AI · Learn at your own pace. Keep moving forward.
          </footer>
        </section>

        {/* Learning format selection */}
        {showFormatPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="format-popup-title"
              className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                    YOUR LEARNING, YOUR WAY
                  </p>

                  <h2
                    id="format-popup-title"
                    className="mt-2 text-2xl font-bold text-slate-900 dark:text-white"
                  >
                    How would you like to learn?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Choose the format that suits you. You can always try another
                    approach later.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFormatPopup(false)}
                  aria-label="Close popup"
                  className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ×
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {learningFormats.map((format) => (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => void generateAnswer(format.id)}
                    disabled={loading}
                    className="rounded-2xl border border-slate-200 p-5 text-left transition hover:border-cyan-400 hover:bg-cyan-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <span className="text-3xl">{format.icon}</span>

                    <h3 className="mt-3 font-bold text-slate-900 dark:text-white">
                      {format.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {format.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Your question
                </p>

                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                  {pendingQuestion}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFormatPopup(false)}
                className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function StatCard({
  icon,
  title,
  value,
  detail,
}: {
  icon: string;
  title: string;
  value: number | string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <span className="text-2xl">{icon}</span>
      </div>

      <p className="mt-3 text-3xl font-bold">{value}</p>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {detail}
      </p>
    </div>
  );
}
