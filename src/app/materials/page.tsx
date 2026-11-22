
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/theme-toggle";

type Material = {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

const SUBJECTS = [
  "Computer Science",
  "Programming",
  "Networking",
  "Cybersecurity",
  "Mathematics",
  "Business",
  "Financial Literacy",
  "Other",
];

function formatSize(bytes: number | null) {
  if (bytes === null || bytes === undefined) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getFileType(material: Material) {
  const name = material.file_name.toLowerCase();

  if (name.endsWith(".pdf")) return { label: "PDF", icon: "📕" };
  if (name.endsWith(".doc") || name.endsWith(".docx"))
    return { label: "WORD", icon: "📘" };
  if (name.endsWith(".ppt") || name.endsWith(".pptx"))
    return { label: "PPT", icon: "📙" };
  if (name.endsWith(".txt")) return { label: "TEXT", icon: "📄" };

  return { label: "FILE", icon: "📁" };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MaterialsPage() {
  const [supabase] = useState(() => createClient());

  const [materials, setMaterials] = useState<Material[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Computer Science");
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadMaterials() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Please log in to access your study materials.");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setMaterials(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!file) {
      setError("Please select a document.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a document title.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a PDF, Word, PowerPoint or TXT file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. The maximum size is 50 MB.");
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in before uploading materials.");
      }

      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

      const { error: storageError } = await supabase.storage
        .from("study-materials")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type,
        });

      if (storageError) throw storageError;

      const { error: databaseError } = await supabase
        .from("materials")
        .insert({
          user_id: user.id,
          title: title.trim(),
          subject,
          file_name: file.name,
          file_path: filePath,
          mime_type: file.type,
          file_size: file.size,
        });

      if (databaseError) {
        await supabase.storage
          .from("study-materials")
          .remove([filePath]);

        throw databaseError;
      }

      setTitle("");
      setSubject("Computer Science");
      setFile(null);

      const input = document.getElementById(
        "material-file"
      ) as HTMLInputElement | null;

      if (input) input.value = "";

      setMessage("Your study material was uploaded successfully!");
      await loadMaterials();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(material: Material) {
    setError("");
    setMessage("");
    setOpeningId(material.id);

    try {
      const { data, error: downloadError } = await supabase.storage
        .from("study-materials")
        .createSignedUrl(material.file_path, 60);

      if (downloadError || !data) {
        throw new Error(downloadError?.message || "Could not open the file.");
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not open the file."
      );
    } finally {
      setOpeningId(null);
    }
  }

  async function handleDelete(material: Material) {
    const confirmed = window.confirm(
      `Delete "${material.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setDeletingId(material.id);

    try {
      const { error: storageError } = await supabase.storage
        .from("study-materials")
        .remove([material.file_path]);

      if (storageError) throw storageError;

      const { error: databaseError } = await supabase
        .from("materials")
        .delete()
        .eq("id", material.id);

      if (databaseError) throw databaseError;

      setMessage("Material deleted successfully.");
      await loadMaterials();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete the material."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch = `${material.title} ${
        material.subject || ""
      } ${material.file_name}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesSubject =
        subjectFilter === "All" || material.subject === subjectFilter;

      return matchesSearch && matchesSubject;
    });
  }, [materials, search, subjectFilter]);

  const totalStorage = materials.reduce(
    (total, material) => total + (material.file_size || 0),
    0
  );

  const subjectCount = new Set(
    materials.map((material) => material.subject || "Other")
  ).size;

  const cardClass =
    "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                YANKEE AI · LEARNING SPACE
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Materials
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Your personal study library. Keep your notes, assignments,
              presentations and learning resources organized in one place.
            </p>
          </div>

          <ThemeToggle />
        </header>

        {/* Summary cards */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Saved documents
              </p>
              <span className="text-xl">📚</span>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums">
              {materials.length}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Documents in your library
            </p>
          </div>

          <div className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Subjects
              </p>
              <span className="text-xl">🎓</span>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums">
              {subjectCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Different learning areas
            </p>
          </div>

          <div className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Storage used
              </p>
              <span className="text-xl">💾</span>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums">
              {formatSize(totalStorage)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Total size of uploaded documents
            </p>
          </div>
        </section>

        {/* Upload section */}
        <section className={`${cardClass} mb-8 overflow-hidden`}>
          <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl dark:bg-blue-500/10">
                ⬆️
              </div>
              <div>
                <h2 className="text-lg font-bold">Add study material</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Upload a document to your private learning library.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-5 p-5 sm:p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="material-title"
                  className="mb-2 block text-sm font-semibold"
                >
                  Document title
                </label>
                <input
                  id="material-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Networking"
                  className={inputClass}
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="material-subject"
                  className="mb-2 block text-sm font-semibold"
                >
                  Subject
                </label>
                <select
                  id="material-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={inputClass}
                >
                  {SUBJECTS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="material-file"
                className="mb-2 block text-sm font-semibold"
              >
                Choose your document
              </label>

              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-blue-400 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-blue-500 sm:p-7">
                <div className="text-center">
                  <div className="mb-3 text-3xl">📂</div>
                  <p className="font-semibold">
                    {file ? "Document selected" : "Choose a file to upload"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    PDF, Word, PowerPoint or TXT · Maximum 50 MB
                  </p>

                  <input
                    id="material-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={(e) =>
                      setFile(e.target.files?.[0] || null)
                    }
                    className="mx-auto mt-4 block w-full max-w-md text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-500 dark:text-slate-400"
                    required
                  />

                  {file && (
                    <div className="mx-auto mt-4 flex max-w-md items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-left dark:border-blue-900 dark:bg-blue-950/40">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-blue-900 dark:text-blue-200">
                          {file.name}
                        </p>
                        <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                          {formatSize(file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          const input = document.getElementById(
                            "material-file"
                          ) as HTMLInputElement | null;
                          if (input) input.value = "";
                        }}
                        className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-400">
                Your documents are stored privately and are accessible through
                your account.
              </p>

              <button
                type="submit"
                disabled={uploading}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading your document..." : "Upload material →"}
              </button>
            </div>
          </form>
        </section>

        {/* Feedback messages */}
        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
          >
            <span className="mr-2">✓</span>
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            <span className="mr-2">!</span>
            {error}
          </div>
        )}

        {/* Study library */}
        <section>
          <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-2xl font-bold">Your study library</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Browse, search and manage your uploaded documents.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
              <input
                aria-label="Search study materials"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className={inputClass}
              />

              <select
                aria-label="Filter by subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className={inputClass}
              >
                <option value="All">All subjects</option>
                {SUBJECTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {filteredMaterials.length} of {materials.length} documents
            </span>
            <button
              type="button"
              onClick={loadMaterials}
              disabled={loading}
              className="font-semibold text-blue-600 hover:text-blue-500 disabled:opacity-50 dark:text-blue-400"
            >
              {loading ? "Refreshing..." : "↻ Refresh library"}
            </button>
          </div>

          {loading ? (
            <div className={`${cardClass} p-12 text-center`}>
              <div className="mb-3 text-3xl">⏳</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading your study library...
              </p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className={`${cardClass} border-dashed p-10 text-center sm:p-14`}>
              <div className="mb-4 text-5xl">
                {materials.length === 0 ? "📚" : "🔎"}
              </div>

              <h3 className="text-lg font-bold">
                {materials.length === 0
                  ? "Your library is ready"
                  : "No matching documents"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                {materials.length === 0
                  ? "Start building your personal study collection by uploading your first document above."
                  : "Try another search term or choose a different subject filter."}
              </p>

              {(search || subjectFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSubjectFilter("All");
                  }}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredMaterials.map((material) => {
                const fileType = getFileType(material);

                return (
                  <article
                    key={material.id}
                    className={`${cardClass} flex min-w-0 flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">
                        {fileType.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-bold leading-5">
                          {material.title}
                        </h3>
                        <p className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {material.subject || "Uncategorized"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {fileType.label}
                      </span>
                    </div>

                    <p
                      title={material.file_name}
                      className="truncate text-xs text-slate-500 dark:text-slate-400"
                    >
                      {material.file_name}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
                      <span>{formatSize(material.file_size)}</span>
                      <span>{formatDate(material.created_at)}</span>
                    </div>

                    <div className="mt-auto grid grid-cols-[1fr_auto] gap-3 pt-5">
                      <button
                        type="button"
                        onClick={() => handleDownload(material)}
                        disabled={openingId === material.id}
                        className="rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                      >
                        {openingId === material.id
                          ? "Opening..."
                          : "Open / Download"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(material)}
                        disabled={deletingId === material.id}
                        className="rounded-lg border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        {deletingId === material.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
          Yankee AI · Your knowledge, organized in one place.
        </footer>
      </div>
    </main>
  );
}
