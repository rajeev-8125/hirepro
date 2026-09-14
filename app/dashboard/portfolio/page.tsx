"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PortfolioGeneratorPage() {
  const router = useRouter();

  const [resume, setResume] =
    useState<File | null>(null);

  const [profileImage, setProfileImage] =
    useState<File | null>(null);

  const [designDescription, setDesignDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleGenerate() {
    setError("");

    if (!resume) {
      setError(
        "Please upload your resume PDF."
      );
      return;
    }

    if (
      resume.type !==
      "application/pdf"
    ) {
      setError(
        "Please upload a PDF resume."
      );
      return;
    }

    if (
      resume.size >
      10 * 1024 * 1024
    ) {
      setError(
        "Resume must be smaller than 10 MB."
      );
      return;
    }

    if (profileImage) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          profileImage.type
        )
      ) {
        setError(
          "Profile photo must be JPG, PNG or WebP."
        );
        return;
      }

      if (
        profileImage.size >
        5 * 1024 * 1024
      ) {
        setError(
          "Profile photo must be smaller than 5 MB."
        );
        return;
      }
    }

    if (
      !designDescription.trim()
    ) {
      setError(
        "Please describe how you want your portfolio to look."
      );
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        resume
      );

      if (profileImage) {
        formData.append(
          "profileImage",
          profileImage
        );
      }

      formData.append(
        "designDescription",
        designDescription
      );

      const response =
        await fetch(
          "/api/portfolio/generate",
          {
            method: "POST",
            body: formData,
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Portfolio generation failed."
        );
      }

      if (
        result.portfolio?.id
      ) {
        router.push(
          `/dashboard/portfolio/${result.portfolio.id}`
        );
      } else {
        throw new Error(
          "Portfolio was generated but no portfolio ID was returned."
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="mb-10">
          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="mb-6 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Create Your Portfolio
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Upload your resume, add your profile
            photo and tell AI exactly how you want
            your portfolio to look.
          </p>
        </div>

        {/* MAIN CARD */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          {/* RESUME */}

          <section>
            <div className="mb-4">
              <span className="text-sm font-bold text-blue-600">
                STEP 1
              </span>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Upload your resume
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                AI will extract your professional
                information from this PDF.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-blue-400 hover:bg-slate-50">

              <div className="text-4xl">
                📄
              </div>

              <p className="mt-3 font-semibold text-slate-900">
                {resume
                  ? resume.name
                  : "Choose your PDF resume"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {resume
                  ? `${(
                      resume.size /
                      1024 /
                      1024
                    ).toFixed(2)} MB`
                  : "PDF up to 10 MB"}
              </p>

              <span className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
                {resume
                  ? "Change Resume"
                  : "Choose PDF"}
              </span>

              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0] ||
                    null;

                  setResume(file);
                  setError("");
                }}
              />
            </label>
          </section>

          {/* PROFILE IMAGE */}

          <section className="mt-10 border-t border-slate-100 pt-10">
            <div className="mb-4">
              <span className="text-sm font-bold text-blue-600">
                STEP 2
              </span>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Add your profile photo
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Optional. AI will position it according
                to your chosen design.
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-8">

              {profileImage ? (
                <img
                  src={URL.createObjectURL(
                    profileImage
                  )}
                  alt="Profile preview"
                  className="h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-200 text-4xl">
                  👤
                </div>
              )}

              <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                {profileImage
                  ? "Change Photo"
                  : "Upload Photo"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file =
                      event.target.files?.[0] ||
                      null;

                    setProfileImage(file);
                    setError("");
                  }}
                />
              </label>

              <p className="text-xs text-slate-400">
                JPG, PNG or WebP • Maximum 5 MB
              </p>
            </div>
          </section>

          {/* DESIGN DESCRIPTION */}

          <section className="mt-10 border-t border-slate-100 pt-10">

            <div className="mb-4">
              <span className="text-sm font-bold text-blue-600">
                STEP 3
              </span>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Describe your portfolio design
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tell AI what you want. You don't need
                to know any design or coding terms.
              </p>
            </div>

            <textarea
              value={designDescription}
              onChange={(event) =>
                setDesignDescription(
                  event.target.value
                )
              }
              placeholder="Example: I want a modern dark developer portfolio with dark blue and purple colors. Put my photo on the right side of the hero section. Make my projects stand out and use subtle animations. Keep the design professional and clean."
              rows={8}
              className="w-full resize-none rounded-2xl border border-slate-300 p-5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            {/* PROMPT IDEAS */}

            <div className="mt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Need inspiration?
              </p>

              <div className="flex flex-wrap gap-2">

                {[
                  "Modern dark developer portfolio",
                  "Minimal white portfolio with blue accents",
                  "Creative portfolio with purple gradients",
                  "Professional corporate portfolio",
                  "Elegant portfolio with my photo on the right",
                ].map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() =>
                      setDesignDescription(
                        idea
                      )
                    }
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {idea}
                  </button>
                ))}

              </div>
            </div>
          </section>

          {/* ERROR */}

          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* GENERATE */}

          <button
            onClick={handleGenerate}
            disabled={
              !resume ||
              !designDescription.trim() ||
              loading
            }
            className="mt-8 w-full rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "AI is creating your portfolio..."
              : "✨ Generate My Portfolio"}
          </button>

          {loading && (
            <p className="mt-4 text-center text-sm text-slate-500">
              AI is reading your resume and
              designing your portfolio. This may
              take a few seconds.
            </p>
          )}
        </div>

        {/* INFO */}

        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">
              Your Content
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              AI extracts your real information
              from your resume without inventing
              experience.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">
              Your Design
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Describe the appearance you want and
              AI converts it into a safe portfolio
              design.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">
              Your Resume
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your original resume will be stored
              securely for the portfolio's resume
              download feature.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}