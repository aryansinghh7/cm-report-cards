import Link from "next/link";
import type { Report } from "@/lib/grades";
import { gradeColor } from "@/lib/grades";

export default function CmCard({ report, rank }: { report: Report; rank?: number }) {
  return (
    <Link
      href={`/cm/${report.slug}`}
      className="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow overflow-hidden border border-black/5"
    >
      {typeof rank === "number" && (
        <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-navy text-white text-sm font-bold flex items-center justify-center">
          {rank}
        </div>
      )}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-bharat-bg">
        {/* Cover = rendered page 1 of the PDF, as required */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={report.page1_image_url}
          alt={`${report.cm_name} report card`}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm text-navy leading-tight">{report.cm_name}</h3>
          <span
            className="text-white text-xs font-bold px-2 py-1 rounded-md shrink-0 ml-2"
            style={{ backgroundColor: gradeColor(report.grade) }}
          >
            {report.grade}
          </span>
        </div>
        <p className="text-xs text-navy/60">
          {report.state}
          {report.party ? ` · ${report.party}` : ""}
        </p>
        <p className="text-xs text-navy/50">{report.tenure}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-navy/50">Overall Score</span>
          <span className="font-display text-lg text-navy">{report.overall_score.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
