
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/navbar";

type Role = "student" | "teacher" | "admin";

type Resource = {
  name: string;
  description: string;
  url: string;
  skills: string[];
  type: string;
  freeNote: string;
  level: string;
};

type ProgressRecord = {
  id: string;
  user_id: string;
  skill_area: string;
  platform_name: string;
  platform_url: string | null;
  activity_title: string;
  activity_type: string;
  status: string;
  minutes_spent: number;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

const resources: Resource[] = [
  {
    name: "freeCodeCamp",
    description:
      "Learn programming and build real projects through interactive lessons.",
    url: "https://www.freecodecamp.org/learn/",
    skills: ["Programming", "Web Development"],
    type: "Courses and certificates",
    freeNote: "Free learning and certificates",
    level: "Beginner to advanced",
  },
  {
    name: "The Odin Project",
    description:
      "A project-based curriculum for becoming a full-stack web developer.",
    url: "https://www.theodinproject.com/",
    skills: ["Web Development", "Programming"],
    type: "Project-based learning",
    freeNote: "Free curriculum",
    level: "Beginner to advanced",
  },
  {
    name: "MDN Web Docs",
    description:
      "Learn HTML, CSS, JavaScript and professional web development.",
    url: "https://developer.mozilla.org/",
    skills: ["Web Development", "Programming"],
    type: "Documentation and tutorials",
    freeNote: "Free learning resources",
    level: "Beginner to advanced",
  },
  {
    name: "Cisco Networking Academy",
    description:
      "Learn networking, cybersecurity, Python and IT fundamentals.",
    url: "https://www.netacad.com/",
    skills: ["Networking", "Cybersecurity", "Programming"],
    type: "Courses and badges",
    freeNote: "Selected free courses",
    level: "Beginner to intermediate",
  },
  {
    name: "Practical Networking",
    description:
      "Understand networking concepts through practical explanations.",
    url: "https://www.practicalnetworking.net/",
    skills: ["Networking"],
    type: "Tutorials",
    freeNote: "Free learning resources",
    level: "Beginner to advanced",
  },
  {
    name: "TryHackMe",
    description:
      "Practice cybersecurity using guided interactive labs.",
    url: "https://tryhackme.com/",
    skills: ["Cybersecurity", "Linux", "Networking"],
    type: "Interactive labs",
    freeNote: "Free and paid content",
    level: "Beginner to advanced",
  },
  {
    name: "picoCTF",
    description:
      "Improve cybersecurity skills through capture-the-flag challenges.",
    url: "https://picoctf.org/",
    skills: ["Cybersecurity", "Programming"],
    type: "Security challenges",
    freeNote: "Free challenges",
    level: "Beginner to intermediate",
  },
  {
    name: "OverTheWire",
    description:
      "Learn Linux, command-line skills and security through practical games.",
    url: "https://overthewire.org/wargames/",
    skills: ["Linux", "Cybersecurity"],
    type: "Practical challenges",
    freeNote: "Free wargames",
    level: "Beginner to advanced",
  },
  {
    name: "Linux Journey",
    description:
      "Learn Linux fundamentals, commands, permissions and system administration.",
    url: "https://linuxjourney.com/",
    skills: ["Linux", "IT Support"],
    type: "Interactive lessons",
    freeNote: "Free learning resources",
    level: "Beginner",
  },
  {
    name: "Microsoft Learn",
    description:
      "Study cloud computing, Azure, security, AI and Microsoft technologies.",
    url: "https://learn.microsoft.com/training/",
    skills: ["Cloud Computing", "Cybersecurity", "IT Support"],
    type: "Learning paths and modules",
    freeNote: "Free learning; some exams cost money",
    level: "Beginner to advanced",
  },
  {
    name: "AWS Skill Builder",
    description:
      "Learn Amazon Web Services and cloud computing fundamentals.",
    url: "https://skillbuilder.aws/",
    skills: ["Cloud Computing"],
    type: "Courses and labs",
    freeNote: "Free and paid content",
    level: "Beginner to advanced",
  },
  {
    name: "SQLBolt",
    description:
      "Practice SQL using interactive database lessons.",
    url: "https://sqlbolt.com/",
    skills: ["Databases", "Programming"],
    type: "Interactive exercises",
    freeNote: "Free lessons",
    level: "Beginner",
  },
  {
    name: "W3Schools SQL",
    description:
      "Learn SQL queries, database concepts and practical examples.",
    url: "https://www.w3schools.com/sql/",
    skills: ["Databases"],
    type: "Tutorials and exercises",
    freeNote: "Free learning resources",
    level: "Beginner",
  },
  {
    name: "IBM SkillsBuild",
    description:
      "Explore IT fundamentals, cybersecurity, AI and data skills.",
    url: "https://skillsbuild.org/",
    skills: ["IT Support", "Cybersecurity", "Cloud Computing"],
    type: "Courses and digital credentials",
    freeNote: "Free learning and selected credentials",
    level: "Beginner",
  },
  {
    name: "Professor Messer",
    description:
      "Study IT support, networking and cybersecurity certification topics.",
    url: "https://www.professormesser.com/",
    skills: ["IT Support", "Networking", "Cybersecurity"],
    type: "Video lessons and exam preparation",
    freeNote: "Free lessons; some paid resources",
    level: "Beginner to intermediate",
  },
  {
    name: "Python Institute",
    description:
      "Study Python programming fundamentals and prepare for certification.",
    url: "https://pythoninstitute.org/",
    skills: ["Programming"],
    type: "Learning and certification",
    freeNote: "Learning resources; exams may cost money",
    level: "Beginner to advanced",
  },
];

const skillCategories = [
  "All Skills",
  "Programming",
  "Web Development",
  "Networking",
  "Cybersecurity",
  "Linux",
  "Cloud Computing",
  "Databases",
  "IT Support",
];

const activityTypes = [
  "course",
  "practice",
  "project",
  "lab",
  "certification",
];

const emptyForm = {
  skill_area: "Programming",
  platform_name: "",
  platform_url: "",
  activity_title: "",
  activity_type: "course",
  status: "in_progress",
  minutes_spent: "30",
  notes: "",
};

export default function CertificationsPage() {
  const [supabase] = useState(() => createClient());

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All Skills");
  const [progressFilter, setProgressFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setLoading(true);
      setError("");

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        if (active) {
          setError("Please log in to access your learning centre.");
          setLoading(false);
        }
        return;
      }

      const currentUserId = authData.user.id;

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (!active) return;

      if (roleError) {
        setError("Unable to load your account permissions.");
        setLoading(false);
        return;
      }

      const currentRole: Role =
        roleData?.role === "admin" || roleData?.role === "teacher"
          ? roleData.role
          : "student";

      setUserId(currentUserId);
      setRole(currentRole);

      await loadProgress(currentRole, currentUserId, active);
    }

    async function loadProgress(
      currentRole: Role,
      currentUserId: string,
      isActive: boolean
    ) {
      let query = supabase
        .from("skill_progress")
        .select("*")
        .order("created_at", { ascending: false });

      if (currentRole === "student") {
        query = query.eq("user_id", currentUserId);
      }

      const { data, error: queryError } = await query;

      if (!isActive) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        setRecords((data || []) as ProgressRecord[]);
      }

      setLoading(false);
    }

    loadPage();

    return () => {
      active = false;
    };
  }, [supabase]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSkill =
        selectedSkill === "All Skills" ||
        resource.skills.includes(selectedSkill);

      const searchText = search.toLowerCase();

      const matchesSearch =
        resource.name.toLowerCase().includes(searchText) ||
        resource.description.toLowerCase().includes(searchText) ||
        resource.skills.join(" ").toLowerCase().includes(searchText);

      return matchesSkill && matchesSearch;
    });
  }, [search, selectedSkill]);

  const myRecords = records.filter(
    (record) => record.user_id === userId
  );

  const displayedRecords = records.filter((record) => {
    const matchesFilter =
      progressFilter === "all" ||
      record.status === progressFilter;

    return matchesFilter;
  });

  const completedCount = myRecords.filter(
    (record) => record.status === "completed"
  ).length;

  const activeCount = myRecords.filter(
    (record) => record.status === "in_progress"
  ).length;

  const totalMinutes = myRecords.reduce(
    (total, record) => total + (record.minutes_spent || 0),
    0
  );

  const totalHours = (totalMinutes / 60).toFixed(1);

  const completionRate =
    myRecords.length > 0
      ? Math.round((completedCount / myRecords.length) * 100)
      : 0;

  async function saveProgress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!userId) {
      setError("Please log in before recording your progress.");
      return;
    }

    if (!form.platform_name.trim() || !form.activity_title.trim()) {
      setError("Please provide a platform and activity title.");
      return;
    }

    const minutes = Number(form.minutes_spent);

    if (!Number.isInteger(minutes) || minutes < 0) {
      setError("Please enter a valid number of minutes.");
      return;
    }

    setSaving(true);

    const now = new Date().toISOString();

    const { data, error: insertError } = await supabase
      .from("skill_progress")
      .insert({
        user_id: userId,
        skill_area: form.skill_area,
        platform_name: form.platform_name.trim(),
        platform_url: form.platform_url.trim() || null,
        activity_title: form.activity_title.trim(),
        activity_type: form.activity_type,
        status: form.status,
        minutes_spent: minutes,
        notes: form.notes.trim() || null,
        started_at: now,
        completed_at:
          form.status === "completed" ? now : null,
      })
      .select()
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setRecords((previous) => [
      data as ProgressRecord,
      ...previous,
    ]);

    setForm(emptyForm);
    setShowForm(false);
    setSuccess("Your learning activity was saved successfully.");
  }

  async function updateStatus(
    record: ProgressRecord,
    newStatus: string
  ) {
    setError("");
    setSuccess("");

    if (record.user_id !== userId) {
      setError("You can only update your own learning records.");
      return;
    }

    const { error: updateError } = await supabase
      .from("skill_progress")
      .update({
        status: newStatus,
        completed_at:
          newStatus === "completed"
            ? new Date().toISOString()
            : null,
      })
      .eq("id", record.id)
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setRecords((previous) =>
      previous.map((item) =>
        item.id === record.id
          ? {
              ...item,
              status: newStatus,
              completed_at:
                newStatus === "completed"
                  ? new Date().toISOString()
                  : null,
            }
          : item
      )
    );

    setSuccess("Learning progress updated.");
  }

  async function deleteRecord(record: ProgressRecord) {
    if (record.user_id !== userId) {
      setError("You can only delete your own learning records.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this learning record?"
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("skill_progress")
      .delete()
      .eq("id", record.id)
      .eq("user_id", userId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setRecords((previous) =>
      previous.filter((item) => item.id !== record.id)
    );

    setSuccess("Learning record deleted.");
  }

  function updateForm(
    field: keyof typeof emptyForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-[#101827] dark:text-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          {/* HEADER */}
          <header className="mb-8">
            <div>
              <Link
                href="/dashboard"
                className="mb-3 inline-flex text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                ← Back to Dashboard
              </Link>

              <h1 className="text-3xl font-bold tracking-tight">
                IT Skills & Certifications
              </h1>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Learn, practice, build projects and monitor your IT journey.
              </p>
            </div>
          </header>

          {/* MESSAGES */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
              {success}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
              Loading your learning centre...
            </div>
          ) : (
            <>
              {/* PERSONAL PROGRESS */}
              <section className="mb-10">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      {role === "student"
                        ? "My Learning Progress"
                        : "Learning Progress Overview"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Your recorded learning activities and achievements.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    + Record Learning
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="My Activities"
                    value={myRecords.length}
                    icon="📚"
                  />
                  <StatCard
                    title="Completed"
                    value={completedCount}
                    icon="🏆"
                  />
                  <StatCard
                    title="In Progress"
                    value={activeCount}
                    icon="🚀"
                  />
                  <StatCard
                    title="Learning Hours"
                    value={totalHours}
                    icon="⏱️"
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                  <div className="mb-3 flex justify-between gap-3 text-sm">
                    <span className="font-semibold">
                      My completion rate
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {completionRate}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </section>

              {/* ADD PROGRESS FORM */}
              {showForm && (
                <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <h2 className="mb-2 text-xl font-bold">
                    Record a Learning Activity
                  </h2>

                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                    Record work completed on Yankee AI or another learning website.
                  </p>

                  <form
                    onSubmit={saveProgress}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                  >
                    <FormField label="Skill Area">
                      <select
                        value={form.skill_area}
                        onChange={(e) =>
                          updateForm("skill_area", e.target.value)
                        }
                        className="form-input"
                      >
                        {skillCategories
                          .filter((item) => item !== "All Skills")
                          .map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                      </select>
                    </FormField>

                    <FormField label="Learning Platform">
                      <input
                        required
                        value={form.platform_name}
                        onChange={(e) =>
                          updateForm("platform_name", e.target.value)
                        }
                        placeholder="e.g. Cisco Networking Academy"
                        className="form-input"
                      />
                    </FormField>

                    <FormField label="Activity Title">
                      <input
                        required
                        value={form.activity_title}
                        onChange={(e) =>
                          updateForm("activity_title", e.target.value)
                        }
                        placeholder="e.g. Introduction to Networking"
                        className="form-input"
                      />
                    </FormField>

                    <FormField label="Activity Type">
                      <select
                        value={form.activity_type}
                        onChange={(e) =>
                          updateForm("activity_type", e.target.value)
                        }
                        className="form-input"
                      >
                        {activityTypes.map((item) => (
                          <option key={item} value={item}>
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Platform Link (optional)">
                      <input
                        type="url"
                        value={form.platform_url}
                        onChange={(e) =>
                          updateForm("platform_url", e.target.value)
                        }
                        placeholder="https://example.com"
                        className="form-input"
                      />
                    </FormField>

                    <FormField label="Time Spent (minutes)">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.minutes_spent}
                        onChange={(e) =>
                          updateForm("minutes_spent", e.target.value)
                        }
                        className="form-input"
                      />
                    </FormField>

                    <FormField label="Progress Status">
                      <select
                        value={form.status}
                        onChange={(e) =>
                          updateForm("status", e.target.value)
                        }
                        className="form-input"
                      >
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </FormField>

                    <FormField label="Notes">
                      <textarea
                        value={form.notes}
                        onChange={(e) =>
                          updateForm("notes", e.target.value)
                        }
                        placeholder="What did you learn or practice?"
                        rows={2}
                        className="form-input"
                      />
                    </FormField>

                    <div className="flex flex-wrap gap-3 md:col-span-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Progress"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold dark:border-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {/* ADMIN AND TEACHER VIEW */}
              {role !== "student" && (
                <section className="mb-10 rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-900 dark:bg-purple-950/20">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-purple-900 dark:text-purple-300">
                        {role === "admin"
                          ? "Administrator Monitoring"
                          : "Teacher Monitoring"}
                      </h2>
                      <p className="mt-1 text-sm text-purple-800 dark:text-purple-300">
                        Authorized account: you can view learning records belonging to students.
                      </p>
                    </div>

                    <button
                      onClick={() => setAdminMode(!adminMode)}
                      className="rounded-xl border border-purple-300 px-4 py-2 text-sm font-semibold text-purple-900 dark:border-purple-700 dark:text-purple-300"
                    >
                      {adminMode ? "Hide Student Records" : "View Student Records"}
                    </button>
                  </div>

                  {adminMode && (
                    <div className="mt-5 overflow-x-auto rounded-xl bg-white dark:bg-gray-900">
                      <table className="w-full min-w-[650px] text-left text-sm">
                        <thead className="border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="p-3">Student ID</th>
                            <th className="p-3">Skill</th>
                            <th className="p-3">Activity</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Minutes</th>
                          </tr>
                        </thead>

                        <tbody>
                          {records
                            .filter((item) => item.user_id !== userId)
                            .map((item) => (
                              <tr
                                key={item.id}
                                className="border-b border-gray-100 dark:border-gray-800"
                              >
                                <td className="p-3 font-mono text-xs">
                                  {item.user_id.slice(0, 8)}...
                                </td>
                                <td className="p-3">{item.skill_area}</td>
                                <td className="p-3">
                                  {item.activity_title}
                                </td>
                                <td className="p-3 capitalize">
                                  {item.status.replace("_", " ")}
                                </td>
                                <td className="p-3">
                                  {item.minutes_spent}
                                </td>
                              </tr>
                            ))}

                          {records.filter(
                            (item) => item.user_id !== userId
                          ).length === 0 && (
                            <tr>
                              <td
                                colSpan={5}
                                className="p-6 text-center text-gray-500"
                              >
                                No other student activity has been recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* LEARNING LIBRARY */}
              <section className="mb-10">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold">
                    Free IT Learning Library
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Explore trusted websites to learn and practice real-world IT skills.
                  </p>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search platforms, skills or topics..."
                      className="form-input"
                    />
                  </div>

                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="form-input"
                  >
                    {skillCategories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  Showing {filteredResources.length} learning platforms.
                </p>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredResources.map((resource) => (
                    <article
                      key={resource.name}
                      className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold">
                          {resource.name}
                        </h3>

                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Free access
                        </span>
                      </div>

                      <p className="mb-4 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                        {resource.description}
                      </p>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {resource.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mb-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <p>{resource.type}</p>
                        <p>{resource.level}</p>
                        <p>{resource.freeNote}</p>
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Start Learning ↗
                      </a>
                    </article>
                  ))}
                </div>

                {filteredResources.length === 0 && (
                  <div className="rounded-xl border border-gray-200 p-8 text-center text-gray-500 dark:border-gray-700">
                    No learning platforms match your search.
                  </div>
                )}
              </section>

              {/* ACTIVITY HISTORY */}
              <section className="mb-10">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">
                      My Learning History
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Review and update the activities you have recorded.
                    </p>
                  </div>

                  <select
                    value={progressFilter}
                    onChange={(e) => setProgressFilter(e.target.value)}
                    className="form-input max-w-[190px]"
                  >
                    <option value="all">All Activities</option>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {displayedRecords
                    .filter((record) => record.user_id === userId)
                    .map((record) => (
                      <article
                        key={record.id}
                        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold">
                              {record.activity_title}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {record.platform_name} · {record.skill_area}
                            </p>

                            <p className="mt-2 text-xs capitalize text-gray-500">
                              {record.activity_type} · {record.minutes_spent} minutes
                            </p>

                            {record.notes && (
                              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                                {record.notes}
                              </p>
                            )}

                            {record.platform_url && (
                              <a
                                href={record.platform_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
                              >
                                Open learning platform ↗
                              </a>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                record.status === "completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : record.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              }`}
                            >
                              {record.status.replace("_", " ")}
                            </span>

                            <select
                              value={record.status}
                              onChange={(e) =>
                                updateStatus(record, e.target.value)
                              }
                              className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-800"
                            >
                              <option value="planned">Planned</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>

                            <button
                              onClick={() => deleteRecord(record)}
                              className="text-xs text-red-600 hover:underline dark:text-red-400"
                            >
                              Delete record
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}

                  {myRecords.filter((record) =>
                    progressFilter === "all"
                      ? true
                      : record.status === progressFilter
                  ).length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
                      <p className="text-lg font-semibold">
                        No learning activities yet.
                      </p>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Start learning from one of the platforms above, then record your progress here.
                      </p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Record Your First Activity
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* INFORMATION */}
              <section className="rounded-2xl border border-gray-200 bg-gray-100 p-5 dark:border-gray-700 dark:bg-gray-900">
                <h2 className="font-bold">How progress monitoring works</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  <li>
                    Yankee AI saves learning activities that you record inside this page.
                  </li>
                  <li>
                    Your learning records are stored in Supabase and remain available after you log in again.
                  </li>
                  <li>
                    External websites do not automatically send their activity to Yankee AI. You must record those activities yourself unless a supported integration is added.
                  </li>
                  <li>
                    Teachers and administrators can view student records only after their accounts have been assigned the appropriate role.
                  </li>
                  <li>
                    Students can only modify or delete their own learning records.
                  </li>
                </ul>
              </section>
            </>
          )}
        </div>

        <style jsx>{`
          .form-input {
            width: 100%;
            border: 1px solid #d1d5db;
            border-radius: 0.75rem;
            background: white;
            color: #111827;
            padding: 0.75rem 0.9rem;
            font-size: 0.875rem;
            outline: none;
          }

          .form-input:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
          }

          :global(.dark) .form-input {
            background: #1f2937;
            color: #f9fafb;
            border-color: #4b5563;
          }
        `}</style>
      </main>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 text-2xl">{icon}</div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
