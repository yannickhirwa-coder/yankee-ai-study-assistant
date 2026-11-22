
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/navbar";

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  subject: string;
  mastered: boolean;
};

const subjects = [
  "Programming",
  "Networking",
  "Cybersecurity",
  "Technology",
  "Other",
];

export default function FlashcardsPage() {
  const supabase = createClient();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [subject, setSubject] = useState("Programming");
  const [filter, setFilter] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load flashcards from Supabase
  useEffect(() => {
    async function loadCards() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Please log in to access your flashcards.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setCards(data || []);
      setLoading(false);
    }

    loadCards();
  }, []);

  const filteredCards =
    filter === "All"
      ? cards
      : cards.filter((card) => card.subject === filter);

  const currentCard = filteredCards[currentIndex];

  // Create and save a flashcard
  async function addCard(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) return;

    setSaving(true);
    setError("");
    setMessage("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Please log in before creating flashcards.");
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("flashcards")
      .insert({
        user_id: user.id,
        question: question.trim(),
        answer: answer.trim(),
        subject,
        mastered: false,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setCards((previous) => [...previous, data]);
    setQuestion("");
    setAnswer("");
    setShowForm(false);
    setFilter("All");
    setCurrentIndex(cards.length);
    setFlipped(false);
    setMessage("Flashcard saved successfully!");

    setSaving(false);
  }

  // Update mastered status in Supabase
  async function markCard(mastered: boolean) {
    if (!currentCard) return;

    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("flashcards")
      .update({ mastered })
      .eq("id", currentCard.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setCards((previous) =>
      previous.map((card) =>
        card.id === currentCard.id
          ? { ...card, mastered }
          : card
      )
    );

    setFlipped(false);
    setMessage("Your learning progress has been saved.");
  }

  // Delete a flashcard permanently
  async function deleteCard(cardId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this flashcard?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", cardId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    const remainingCards = cards.filter(
      (card) => card.id !== cardId
    );

    setCards(remainingCards);

    const remainingFiltered =
      filter === "All"
        ? remainingCards
        : remainingCards.filter(
            (card) => card.subject === filter
          );

    setCurrentIndex((previous) =>
      Math.max(
        0,
        Math.min(previous, remainingFiltered.length - 1)
      )
    );

    setFlipped(false);
    setMessage("Flashcard deleted successfully.");
  }

  function changeCard(direction: number) {
    setCurrentIndex((previous) =>
      Math.max(
        0,
        Math.min(filteredCards.length - 1, previous + direction)
      )
    );

    setFlipped(false);
  }

  const masteredCount = cards.filter(
    (card) => card.mastered
  ).length;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 p-5 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white md:p-10">
        <div className="mx-auto max-w-5xl space-y-8">

          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                YANKEE AI / LEARNING TOOLS
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                My Flashcards
              </h1>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Learn faster through active recall and repetition.
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              + Create Flashcard
            </button>
          </header>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
              {message}
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total cards
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                {cards.length}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Mastered
              </p>
              <h2 className="mt-2 text-3xl font-bold text-green-600">
                {masteredCount}
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Needs practice
              </p>
              <h2 className="mt-2 text-3xl font-bold text-orange-500">
                {cards.length - masteredCount}
              </h2>
            </div>
          </section>

          {showForm && (
            <form
              onSubmit={addCard}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-xl font-bold">
                Create a new card
              </h2>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Question
                </label>

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Answer
                </label>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the answer..."
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Subject
                </label>

                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {subjects.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Flashcard"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-300 px-5 py-3 dark:border-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <section className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                Study session
              </h2>

              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentIndex(0);
                  setFlipped(false);
                }}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="All">All subjects</option>

                {subjects.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400">
                Loading your flashcards...
              </div>
            ) : currentCard ? (
              <>
                <div
                  onClick={() => setFlipped(!flipped)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setFlipped(!flipped);
                    }
                  }}
                  className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl bg-slate-900 p-8 text-center text-white transition hover:bg-slate-800"
                >
                  <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-blue-300">
                    {flipped ? "Answer" : "Question"}
                  </p>

                  <h3 className="max-w-2xl text-2xl font-bold">
                    {flipped
                      ? currentCard.answer
                      : currentCard.question}
                  </h3>

                  <p className="mt-8 text-sm text-slate-400">
                    Click the card to{" "}
                    {flipped ? "see question" : "reveal answer"}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => changeCard(-1)}
                    disabled={currentIndex === 0}
                    className="rounded-xl border border-slate-200 px-5 py-3 disabled:opacity-30 dark:border-slate-700"
                  >
                    ← Previous
                  </button>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {currentIndex + 1} of {filteredCards.length}
                  </p>

                  <button
                    onClick={() => changeCard(1)}
                    disabled={currentIndex === filteredCards.length - 1}
                    className="rounded-xl border border-slate-200 px-5 py-3 disabled:opacity-30 dark:border-slate-700"
                  >
                    Next →
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => markCard(false)}
                    className="rounded-xl bg-orange-100 px-5 py-3 font-semibold text-orange-700"
                  >
                    Need practice
                  </button>

                  <button
                    onClick={() => markCard(true)}
                    className="rounded-xl bg-green-100 px-5 py-3 font-semibold text-green-700"
                  >
                    ✓ I know this
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Subject: {currentCard.subject} ·{" "}
                    {currentCard.mastered
                      ? "Mastered"
                      : "Needs practice"}
                  </p>

                  <button
                    onClick={() => deleteCard(currentCard.id)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    Delete card
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
                <div className="text-4xl">📚</div>

                <h3 className="mt-4 text-xl font-bold">
                  {cards.length === 0
                    ? "No flashcards yet"
                    : "No cards in this subject"}
                </h3>

                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  Create a flashcard to start learning.
                </p>

                <button
                  onClick={() => setShowForm(true)}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
                >
                  Create your first card
                </button>
              </div>
            )}
          </section>

          <footer className="text-center text-sm text-slate-400">
            Yankee AI · Learn something new every day.
          </footer>

        </div>
      </main>
    </>
  );
}
