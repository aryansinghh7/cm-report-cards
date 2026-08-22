import Link from "next/link";
import type { Report } from "@/lib/grades";
import { gradeColor } from "@/lib/grades";

export default function Leaderboard({ reports }: { reports: Report[] }) {
  const sorted = [...reports].sort((a, b) => b.overall_score - a.overall_score);

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-16" id="leaderboard">
      <div className="mb-6 text-center">
        <span className="uppercase tracking-[0.25em] text-gold text-xs">Ranked</span>
        <h2 className="font-display text-2xl md:text-3xl text-navy mt-2">Leaderboard</h2>
        <p className="text-navy/50 text-sm mt-1">Auto-updated the moment a new report is published</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 divide-y divide-black/5 overflow-hidden">
        {sorted.map((r, i) => (
          <Link
            href={`/cm/${r.slug}`}
            key={r.id}
            className="flex items-center gap-4 px-4 md:px-6 py-3 hover:bg-bharat-bg transition-colors"
          >
            <span className="font-display text-navy/40 w-8 text-center shrink-0">{i + 1}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={r.page1_image_url}
              alt=""
              className="w-10 h-14 object-cover object-top rounded shrink-0 border border-black/5"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy truncate">{r.cm_name}</p>
              <p className="text-xs text-navy/50 truncate">{r.state}</p>
            </div>
            <span
              className="text-white text-xs font-bold px-2 py-1 rounded-md shrink-0"
              style={{ backgroundColor: gradeColor(r.grade) }}
            >
              {r.grade}
            </span>
            <span className="font-display text-navy w-14 text-right shrink-0">
              {r.overall_score.toFixed(2)}
            </span>
          </Link>
        ))}

        {sorted.length === 0 && (
          <p className="text-center text-navy/40 text-sm py-10">No reports published yet.</p>
        )}
      </div>
    </section>
  );
}
