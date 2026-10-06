"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Copy,
  FileText,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Clock3,
  History,
  Check,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

type ResumeRecord = {
  id: string;
  title: string;
  template: string;
  source_type: string;
  is_primary: boolean;
  updated_at: string;
  created_at: string;
};

const TEMPLATE_NAMES: Record<string, string> = {
  "blue-01": "Blue Professional 01",
  "blue-02": "Blue Professional 02",
  "blue-03": "Blue Professional 03",
  "blue-04": "Blue Professional 04",
  student: "Student CV",
  "infographic-01": "Infographic 01",
  "infographic-02": "Infographic 02",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function templateName(template: string) {
  return (
    TEMPLATE_NAMES[template] ||
    "HirePro Resume Template"
  );
}

function sourceName(source: string) {
  const names: Record<string, string> = {
    ai_generated: "AI generated",
    manual_edit: "Manual",
    duplicate: "Duplicate",
    restored_version: "Restored",
  };

  return names[source] || "Resume";
}

export default function SavedResumesPage() {
  const router = useRouter();

  const [resumes, setResumes] = useState<ResumeRecord[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [busyId, setBusyId] = useState<string | null>(null);

  const [menuId, setMenuId] = useState<string | null>(null);

  const [editingTitleId, setEditingTitleId] =
    useState<string | null>(null);

  const [editingTitle, setEditingTitle] =
    useState("");

  const [savingTitleId, setSavingTitleId] =
    useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  /*
   * Close the action menu when the user clicks outside.
   */
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setMenuId(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
    };
  }, []);

  const loadResumes = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "/api/resume/manage",
          {
            cache: "no-store",
            credentials: "include",
          },
        );

        const data = await response.json();

        if (response.status === 401) {
          router.replace(
            `/login?next=${encodeURIComponent(
              "/dashboard/resume/saved",
            )}`,
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to load resumes.",
          );
        }

        setResumes(
          Array.isArray(data?.resumes)
            ? data.resumes
            : [],
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load resumes.",
        );
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  /*
   * ============================================================
   * CONTINUE EDITING
   * ============================================================
   */

  function continueEditing(
    resumeId: string,
  ) {
    setMenuId(null);

    router.push(
      `/dashboard/resume?resumeId=${encodeURIComponent(
        resumeId,
      )}`,
    );
  }

  /*
   * ============================================================
   * CREATE NEW
   * ============================================================
   */

  function createNewResume() {
    setMenuId(null);

    router.push(
      "/dashboard/resume?new=1",
    );
  }

  /*
   * ============================================================
   * HISTORY
   * ============================================================
   */

  function openHistory(
    resumeId: string,
  ) {
    setMenuId(null);

    router.push(
      `/dashboard/resume?resumeId=${encodeURIComponent(
        resumeId,
      )}#history`,
    );
  }

  /*
   * ============================================================
   * DUPLICATE
   * ============================================================
   */

  async function duplicateResume(
    resumeId: string,
  ) {
    setBusyId(resumeId);
    setMenuId(null);

    try {
      const response = await fetch(
        "/api/resume/manage",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: "duplicate",
            resumeId,
          }),
        },
      );

      const data =
        await response.json();

      if (
        response.status === 401
      ) {
        router.replace(
          `/login?next=${encodeURIComponent(
            "/dashboard/resume/saved",
          )}`,
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to duplicate resume.",
        );
      }

      await loadResumes();
    } catch (duplicateError) {
      alert(
        duplicateError instanceof Error
          ? duplicateError.message
          : "Failed to duplicate resume.",
      );
    } finally {
      setBusyId(null);
    }
  }

  /*
   * ============================================================
   * RENAME
   * ============================================================
   */

  function beginRename(
    resume: ResumeRecord,
  ) {
    setMenuId(null);
    setEditingTitleId(resume.id);
    setEditingTitle(
      resume.title || "My Resume",
    );
  }

  function cancelRename() {
    setEditingTitleId(null);
    setEditingTitle("");
  }

  async function saveRename(
    resumeId: string,
  ) {
    const title =
      editingTitle.trim();

    if (!title) {
      alert(
        "Please enter a resume name.",
      );
      return;
    }

    if (title.length > 100) {
      alert(
        "Resume name cannot exceed 100 characters.",
      );
      return;
    }

    setSavingTitleId(resumeId);

    try {
      const response = await fetch(
        "/api/resume/manage",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            resumeId,
            title,
          }),
        },
      );

      const data =
        await response.json();

      if (
        response.status === 401
      ) {
        router.replace(
          `/login?next=${encodeURIComponent(
            "/dashboard/resume/saved",
          )}`,
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to rename resume.",
        );
      }

      setResumes((current) =>
        current.map((item) =>
          item.id === resumeId
            ? {
                ...item,
                title,
                updated_at:
                  data?.resume
                    ?.updated_at ||
                  item.updated_at,
              }
            : item,
        ),
      );

      cancelRename();
    } catch (renameError) {
      alert(
        renameError instanceof Error
          ? renameError.message
          : "Failed to rename resume.",
      );
    } finally {
      setSavingTitleId(null);
    }
  }

  /*
   * ============================================================
   * DELETE
   * ============================================================
   */

  async function deleteResume(
    resume: ResumeRecord,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${resume.title}"?\n\nThis will permanently delete the resume and its saved history.`,
      );

    if (!confirmed) {
      return;
    }

    setBusyId(resume.id);
    setMenuId(null);

    try {
      const response =
        await fetch(
          `/api/resume/manage?id=${encodeURIComponent(
            resume.id,
          )}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

      const data =
        await response.json();

      if (
        response.status === 401
      ) {
        router.replace(
          `/login?next=${encodeURIComponent(
            "/dashboard/resume/saved",
          )}`,
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to delete resume.",
        );
      }

      /*
       * Remove it immediately from the UI.
       * No page refresh is necessary.
       */
      setResumes((current) =>
        current.filter(
          (item) =>
            item.id !== resume.id,
        ),
      );

      if (
        editingTitleId ===
        resume.id
      ) {
        cancelRename();
      }
    } catch (deleteError) {
      alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete resume.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 text-sm font-bold text-blue-600">
              HirePro
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Saved Resumes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Continue exactly where you stopped,
              manage your saved resumes, rename or
              duplicate a version, view history, or
              delete an old resume.
            </p>
          </div>

          <button
            type="button"
            onClick={createNewResume}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            Create New Resume
          </button>
        </div>

        {/* ======================================================
            LOADING
            ====================================================== */}

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading your resumes...
            </div>
          </div>
        )}

        {/* ======================================================
            ERROR
            ====================================================== */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadResumes}
              className="ml-3 font-black underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* ======================================================
            EMPTY STATE
            ====================================================== */}

        {!loading &&
          !error &&
          resumes.length === 0 && (
            <div className="flex min-h-[430px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FileText className="h-8 w-8" />
              </div>

              <h2 className="text-xl font-black text-slate-900">
                No saved resumes yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Start with a HirePro template and
                come back whenever you want to
                continue editing.
              </p>

              <button
                type="button"
                onClick={createNewResume}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Build My Resume
              </button>
            </div>
          )}

        {/* ======================================================
            RESUME GRID
            ====================================================== */}

        {!loading &&
          !error &&
          resumes.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {resumes.map((resume) => {
                const busy =
                  busyId === resume.id;

                const editing =
                  editingTitleId ===
                  resume.id;

                const savingTitle =
                  savingTitleId ===
                  resume.id;

                return (
                  <article
                    key={resume.id}
                    className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {/* Accent */}
                    <div className="h-1.5 rounded-t-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

                    <div className="p-5">
                      {/* ==================================================
                          CARD HEADER
                          ================================================== */}

                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <FileText className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            {editing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  autoFocus
                                  value={
                                    editingTitle
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    setEditingTitle(
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  onKeyDown={(
                                    event,
                                  ) => {
                                    if (
                                      event.key ===
                                      "Enter"
                                    ) {
                                      saveRename(
                                        resume.id,
                                      );
                                    }

                                    if (
                                      event.key ===
                                      "Escape"
                                    ) {
                                      cancelRename();
                                    }
                                  }}
                                  maxLength={100}
                                  className="min-w-0 flex-1 rounded-lg border border-blue-300 bg-white px-2.5 py-2 text-sm font-black text-slate-900 outline-none ring-2 ring-blue-100"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    saveRename(
                                      resume.id,
                                    )
                                  }
                                  disabled={
                                    savingTitle
                                  }
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
                                  title="Save name"
                                >
                                  {savingTitle ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    cancelRename
                                  }
                                  disabled={
                                    savingTitle
                                  }
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <h2 className="truncate text-base font-black text-slate-900">
                                  {resume.title ||
                                    "Untitled Resume"}
                                </h2>

                                <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                                  {templateName(
                                    resume.template,
                                  )}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* ==================================================
                            MENU
                            ================================================== */}

                        <div
                          className="relative shrink-0"
                          ref={
                            menuId ===
                            resume.id
                              ? menuRef
                              : null
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setMenuId(
                                menuId ===
                                  resume.id
                                  ? null
                                  : resume.id,
                              )
                            }
                            disabled={busy}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                            title="Resume actions"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {menuId ===
                            resume.id && (
                            <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                              <button
                                type="button"
                                onClick={() =>
                                  continueEditing(
                                    resume.id,
                                  )
                                }
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                              >
                                <Pencil className="h-4 w-4" />
                                Continue Editing
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  beginRename(
                                    resume,
                                  )
                                }
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                              >
                                <Pencil className="h-4 w-4" />
                                Rename
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openHistory(
                                    resume.id,
                                  )
                                }
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                              >
                                <History className="h-4 w-4" />
                                Version History
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  duplicateResume(
                                    resume.id,
                                  )
                                }
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                              >
                                <Copy className="h-4 w-4" />
                                Duplicate
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={() =>
                                  deleteResume(
                                    resume,
                                  )
                                }
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ==================================================
                          LAST EDITED
                          ================================================== */}

                      <div className="mb-4 rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          Last edited
                        </div>

                        <p className="mt-1 text-sm font-black text-slate-800">
                          {formatDate(
                            resume.updated_at,
                          )}
                        </p>
                      </div>

                      {/* ==================================================
                          BADGES
                          ================================================== */}

                      <div className="mb-5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                          {templateName(
                            resume.template,
                          )}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">
                          {sourceName(
                            resume.source_type,
                          )}
                        </span>

                        {resume.is_primary && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                            Primary
                          </span>
                        )}
                      </div>

                      {/* ==================================================
                          ACTIONS
                          ================================================== */}

                      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            continueEditing(
                              resume.id,
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Pencil className="h-4 w-4" />
                          )}

                          Continue Editing
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openHistory(
                              resume.id,
                            )
                          }
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                          title="Open resume history"
                        >
                          <History className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            deleteResume(
                              resume,
                            )
                          }
                          className="inline-flex items-center justify-center rounded-xl border border-red-200 px-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          title="Delete resume"
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </div>
    </main>
  );
}