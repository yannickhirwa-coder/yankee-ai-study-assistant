
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/navbar";

type StudyTask = {
  id: string;
  title: string;
  subject: string;
  completed: boolean;
  created_at: string;
};

type Flashcard = {
  id: string;
  question: string;
  subject: string;
  mastered: boolean;
  created_at: string;
};

type Material = {
  id: string;
  title: string;
  subject: string | null;
  created_at: string;
};

type SkillActivity = {
  id: string;
  skill_area: string;
  activity_title: string;
  platform_name: string;
  status: string;
  minutes_spent: number;
  created_at: string;
};

export default function ProgressPage() {
  const [supabase] = useState(() => createClient());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("Student");

  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activities, setActivities] = useState<SkillActivity[]>([]);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      setLoading(true);
      setError("");

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (!active) return;

      if (authError || !authData.user) {
        setError("Please log in to view your learning progress.");
        setLoading(false);
        return;
      }

      const user = authData.user;

      setUserName(
        user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Student"
      );

      const [taskResult, flashcardResult, materialResult, skillResult] =
        await Promise.all([
          supabase
            .from("study_tasks")
            .select("id,title,subject,completed,created_at")
            .eq("user_id", user.id),

          supabase
            .from("flashcards")
            .select("id,question,subject,mastered,created_at")
            .eq("user_id", user.id),

          supabase
            .from("materials")
            .select("id,title,subject,created_at")
            .eq("user_id", user.id),

          supabase
            .from("skill_progress")
            .select(
              "id,skill_area,activity_title,platform_name,status,minutes_spent,created_at"
            )
            .eq("user_id", user.id),
        ]);

      if (!active) return;

      const errors = [
        taskResult.error,
        flashcardResult.error,
        materialResult.error,
        skillResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        setError(
          "Some progress data could not be loaded. Please check your Supabase table permissions."
        );
      }

      setTasks(taskResult.data || []);
      setFlashcards(flashcardResult.data || []);
      setMaterials(materialResult.data || []);
      setActivities(skillResult.data || []);

      setLoading(false);
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, [supabase]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const masteredCards = flashcards.filter((card) => card.mastered).length;

  const completedActivities = activities.filter(
    (activity) => activity.status === "completed"
  ).length;

  const totalLearningItems =
    tasks.length + flashcards.length + activities.length;

  const completedLearningItems =
    completedTasks + masteredCards + completedActivities;

  const completionRate =
    totalLearningItems > 0
      ? Math.round(
          (completedLearningItems / totalLearningItems) * 100
        )
      : 0;

  const totalMinutes = activities.reduce(
    (total, activity) => total + (activity.minutes_spent || 0),
    0
  );

  const totalHours = (totalMinutes / 60).toFixed(1);

  const skillGroups = activities.reduce<Record<string, SkillActivity[]>>(
    (groups, activity) => {
      const skill = activity.skill_area || "Other";

      if (!groups[skill]) groups[skill] = [];

      groups[skill].push(activity);

      return groups;
    },
    {}
  );

  const recentActivity = [
    ...tasks.map((item) => ({
      id: `task-${item.id}`,
      title: item.title,
      category: "Study Planner",
      date: item.created_at,
      status: item.completed ? "Completed" : "Pending",
    })),

    ...flashcards.map((item) => ({
      id: `card-${item.id}`,
      title: item.question,
      category: "Flashcards",
      date: item.created_at,
      status: item.mastered ? "Mastered" : "Needs practice",
    })),

    ...materials.map((item) => ({
      id: `material-${item.id}`,
      title: item.title,
      category: "My Materials",
      date: item.created_at,
      status: "Uploaded",
    })),

    ...activities.map((item) => ({
      id: `skill-${item.id}`,
      title: item.activity_title,
      category: item.platform_name,
      date: item.created_at,
      status:
        item.status === "completed"
          ? "Completed"
          : item.status === "in_progress"
          ? "In progress"
          : "Planned",
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 8);

  const styles = {
    page: "min-h-screen bg-gray-50 px-4 py-6 text-gray-900 transition-colors dark:bg-[#10131d] dark:text-white sm:px-8",
    panel:
      "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#191e2c]",
    muted: "text-sm text-gray-500 dark:text-gray-400",
    heading: "text-lg font-bold",
  };

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <div className="mx-auto max-w-7xl space-y-8">
          <header>
            <div>
              <Link
                href="/dashboard"
                className="mb-3 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                ← Back to Dashboard
              </Link>

              <h1 className="text-3xl font-bold">My Progress</h1>

              <p className={styles.muted}>
                Welcome back, {userName}. Track your learning journey.
              </p>
            </div>
          </header>

          {loading ? (
            <div className={styles.panel}>
              Loading your learning progress...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {error}
              <p className="mt-2">
                <Link href="/login" className="underline">
                  Go to login
                </Link>
              </p>
            </div>
          ) : (
            <>
              <section>
                <h2 className="mb-4 text-xl font-bold">
                  Your Learning Overview
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Study Tasks"
                    value={tasks.length}
                    detail={`${completedTasks} completed`}
                    icon="📅"
                  />

                  <StatCard
                    title="Flashcards"
                    value={flashcards.length}
                    detail={`${masteredCards} mastered`}
                    icon="🧠"
                  />

                  <StatCard
                    title="Study Materials"
                    value={materials.length}
                    detail="Resources uploaded"
                    icon="📚"
                  />

                  <StatCard
                    title="IT Activities"
                    value={activities.length}
                    detail={`${completedActivities} completed`}
                    icon="💻"
                  />
                </div>
              </section>

              <section className={styles.panel}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className={styles.heading}>
                      Overall Learning Completion
                    </h2>

                    <p className={styles.muted}>
                      Based on completed tasks, mastered cards and completed
                      IT activities.
                    </p>
                  </div>

                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {completionRate}%
                  </span>
                </div>

                <div className="mt-5 h-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                <p className={`${styles.muted} mt-3`}>
                  {completedLearningItems} completed out of{" "}
                  {totalLearningItems} tracked learning items. Uploaded
                  materials are excluded from this percentage.
                </p>
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <div className={styles.panel}>
                  <h2 className={styles.heading}>Learning Activity</h2>

                  <p className={`${styles.muted} mt-1`}>
                    Time recorded in your IT practice activities.
                  </p>

                  <p className="mt-5 text-4xl font-bold">
                    {totalHours}
                    <span className="ml-2 text-base font-medium text-gray-500">
                      hours
                    </span>
                  </p>

                  <p className={styles.muted}>
                    {totalMinutes} minutes recorded
                  </p>
                </div>

                <div className={styles.panel}>
                  <h2 className={styles.heading}>Skill Development</h2>

                  <p className={`${styles.muted} mt-1`}>
                    Your recorded activities by skill area.
                  </p>

                  <div className="mt-4 space-y-4">
                    {Object.entries(skillGroups).length === 0 ? (
                      <p className={styles.muted}>
                        No IT skill activities recorded yet.
                      </p>
                    ) : (
                      Object.entries(skillGroups).map(([skill, items]) => {
                        const done = items.filter(
                          (item) => item.status === "completed"
                        ).length;

                        const percentage = Math.round(
                          (done / items.length) * 100
                        );

                        return (
                          <div key={skill}>
                            <div className="mb-1 flex justify-between text-sm">
                              <span className="font-medium">{skill}</span>
                              <span className={styles.muted}>
                                {done}/{items.length}
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>

              <section className={styles.panel}>
                <h2 className={styles.heading}>
                  Recent Learning Activity
                </h2>

                <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentActivity.length === 0 ? (
                    <p className={styles.muted}>
                      Your learning activities will appear here as you use
                      Yankee AI.
                    </p>
                  ) : (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-4"
                      >
                        <div>
                          <p className="font-medium">{activity.title}</p>

                          <p className={styles.muted}>
                            {activity.category} ·{" "}
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {activity.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-bold">
                  Continue Learning
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <QuickLink
                    href="/study-planner"
                    title="Study Planner"
                    description="Manage your study goals and tasks."
                    icon="📅"
                  />

                  <QuickLink
                    href="/flashcards"
                    title="Flashcards"
                    description="Review and master your cards."
                    icon="🧠"
                  />

                  <QuickLink
                    href="/materials"
                    title="My Materials"
                    description="Access your saved learning files."
                    icon="📚"
                  />

                  <QuickLink
                    href="/certifications"
                    title="IT Skills Practice"
                    description="Explore courses and record progress."
                    icon="💻"
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: number;
  detail: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#191e2c]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </p>

        <span className="text-2xl">{icon}</span>
      </div>

      <p className="mt-3 text-3xl font-bold">{value}</p>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {detail}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-[#191e2c]"
    >
      <span className="text-2xl">{icon}</span>

      <h3 className="mt-3 font-bold">{title}</h3>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>

      <span className="mt-4 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400">
        Open section →
      </span>
    </Link>
  );
}
