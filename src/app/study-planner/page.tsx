
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/theme-toggle";

type StudyTask = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  due_date: string | null;
  priority: "Low" | "Medium" | "High";
  completed: boolean;
  created_at: string;
};

const subjects = [
  "Programming",
  "Networking",
  "Cybersecurity",
  "Technology",
  "Financial Literacy",
  "Other",
];

export default function StudyPlannerPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("All");
  const [today, setToday] = useState("");

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Programming");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");

  useEffect(() => {
    const date = new Date();

    const localDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    setToday(localDate);
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    setError("");

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError("Please log in to access your study planner.");
      setLoading(false);
      return;
    }

    const { data, error: taskError } = await supabase
      .from("study_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (taskError) {
      setError(taskError.message);
    } else {
      setTasks(data || []);
    }

    setLoading(false);
  }

  async function addTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError("Your session has expired. Please log in again.");
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("study_tasks")
      .insert({
        user_id: userData.user.id,
        title: title.trim(),
        subject,
        description: description.trim() || null,
        due_date: dueDate || null,
        priority,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
    } else {
      setTasks((current) => [data, ...current]);
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("Medium");
      setSuccess("Your study task has been saved!");
    }

    setSaving(false);
  }

  async function toggleTask(task: StudyTask) {
    setError("");
    setSuccess("");

    const { data, error: updateError } = await supabase
      .from("study_tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? data : item))
    );
  }

  async function deleteTask(id: string) {
    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("study_tasks")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== id));
    setSuccess("Task deleted.");
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;

  const completionRate =
    tasks.length === 0
      ? 0
      : Math.round((completedCount / tasks.length) * 100);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "Pending") return !task.completed;
    if (filter === "Completed") return task.completed;
    return true;
  });

  function formatDate(date: string | null) {
    if (!date) return "No deadline";

    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl p-5 md:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.push("/")}
              className="mb-3 text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              ← Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold">Study Planner</h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Plan your learning, stay consistent, and achieve your goals.
            </p>
          </div>

          <ThemeToggle />
        </header>

        {error && (
          <div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
            {success}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Tasks
            </p>
            <h2 className="mt-2 text-3xl font-bold">{tasks.length}</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pending
            </p>
            <h2 className="mt-2 text-3xl font-bold text-orange-500">
              {pendingCount}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Completed
            </p>
            <h2 className="mt-2 text-3xl font-bold text-green-500">
              {completedCount}
            </h2>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Learning Progress</h2>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {completionRate}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Keep going. Every completed task moves you forward.
          </p>
        </section>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h2 className="mb-5 text-xl font-semibold">
              Create a Study Task
            </h2>

            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Task Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Study JavaScript functions"
                  className="w-full rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-blue-500 dark:border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Subject
                </label>

                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-700"
                >
                  {subjects.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="text-black"
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What do you want to accomplish?"
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-blue-500 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Deadline
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={today || undefined}
                  className="w-full rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value as "Low" | "Medium" | "High"
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-700"
                >
                  <option value="Low" className="text-black">
                    Low
                  </option>
                  <option value="Medium" className="text-black">
                    Medium
                  </option>
                  <option value="High" className="text-black">
                    High
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "+ Add Study Task"}
              </button>
            </form>
          </section>

          <section className="lg:col-span-3">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Your Study Tasks</h2>

              <div className="flex gap-2">
                {["All", "Pending", "Completed"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      filter === item
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                Loading your study tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-3 text-4xl">📚</div>

                <h3 className="font-semibold">No study tasks yet</h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Create your first task and start organizing your learning.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task)}
                        className="mt-1 h-5 w-5 accent-blue-600"
                        aria-label={`Mark ${task.title} as completed`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`font-semibold ${
                              task.completed
                                ? "text-slate-400 line-through"
                                : ""
                            }`}
                          >
                            {task.title}
                          </h3>

                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {task.subject}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              task.priority === "High"
                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                : task.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                                : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                        </div>

                        {task.description && (
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {task.description}
                          </p>
                        )}

                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          📅 Deadline: {formatDate(task.due_date)}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        aria-label={`Delete ${task.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
