import { supabase } from "@/lib/supabaseClient";
import Hero from "@/components/Hero";
import CmCard from "@/components/CmCard";
import Leaderboard from "@/components/Leaderboard";
import type { Report } from "@/lib/grades";

export const revalidate = 0; // always fetch fresh so new publishes show up immediately

async function getReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return (data as Report[]) || [];
}

export default async function Home() {
  const reports = await getReports();

  return (
    <main className="bg-bharat-bg min-h-screen">
      <Hero />

      <section id="cm-list" className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <span className="uppercase tracking-[0.25em] text-gold text-xs">All Reports</span>
          <h2 className="font-display text-2xl md:text-3xl text-navy mt-2">
            Chief Minister Report Cards
          </h2>
          <p className="text-navy/50 text-sm mt-1">{reports.length} published</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {reports.map((r) => (
            <CmCard key={r.id} report={r} />
          ))}
        </div>

        {reports.length === 0 && (
          <p className="text-center text-navy/40 py-16">
            No report cards published yet. Check back soon.
          </p>
        )}
      </section>

      <Leaderboard reports={reports} />

      <footer className="text-center text-xs text-navy/40 py-10">
        © {new Date().getFullYear()} @suryanshi_tyagi_ — Questioning norms for a better Bharat
      </footer>
    </main>
  );
}
