import { createClient } from "@/lib/supabase/server";

type PlatformStats = {
  total_users: number;
  services_count: number;
  portfolios_created: number;
  resumes_created: number;
  ats_checks_completed: number;
  total_service_uses: number;
};

export default async function PlatformStats() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_platform_stats");

  const stats: PlatformStats = {
    total_users: Number(data?.total_users ?? 0),
    services_count: Number(data?.services_count ?? 3),
    portfolios_created: Number(data?.portfolios_created ?? 0),
    resumes_created: Number(data?.resumes_created ?? 0),
    ats_checks_completed: Number(data?.ats_checks_completed ?? 0),
    total_service_uses: Number(data?.total_service_uses ?? 0),
  };

  if (error) {
    console.error("Failed to load platform statistics:", error);
  }

  const items = [
    {
      value: stats.total_users,
      label: "Career builders",
      description: "People using HirePro",
    },
    {
      value: stats.services_count,
      label: "AI services",
      description: "Career tools available",
    },
    {
      value: stats.total_service_uses,
      label: "Service uses",
      description: "Tools used across HirePro",
    },
    {
      value: stats.portfolios_created,
      label: "Portfolios",
      description: "AI portfolios created",
    },
    {
      value: stats.resumes_created,
      label: "Resumes",
      description: "Resumes created",
    },
  ];

  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            HirePro in numbers
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            Helping people build better careers
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            A growing platform built to help you create, improve and present
            your professional profile.
          </p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item, index) => (
            <div
              key={item.label}
              className={`px-6 py-9 text-center ${
                index !== items.length - 1
                  ? "border-b border-slate-200 sm:border-r lg:border-b-0"
                  : ""
              } ${
                index === 1
                  ? "sm:border-r-0 lg:border-r lg:border-slate-200"
                  : ""
              }`}
            >
              <p className="text-4xl font-bold tracking-tight text-[#0f172a]">
                {item.value.toLocaleString("en-IN")}+
              </p>

              <p className="mt-3 text-sm font-bold text-blue-600">
                {item.label}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}