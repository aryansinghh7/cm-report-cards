import { supabase } from "@/lib/supabaseClient";
import { gradeColor } from "@/lib/grades";
import type { Report } from "@/lib/grades";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 0;

async function getReport(slug: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return data as Report;
}

export default async function CmProfile({ params }: { params: { slug: string } }) {
  const report = await getReport(params.slug);
  if (!report) return notFound();

  return (
    <main className="bg-bharat-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-navy/60 hover:text-navy">
          ← Back to all report cards
        </Link>

        <div className="mt-6 grid md:grid-cols-[380px_1fr] gap-8">
          {/* Page 1 of the PDF */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-black/5 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={report.page1_image_url}
              alt={`${report.cm_name} report card page 1`}
              className="w-full h-auto"
            />
          </div>

          <div>
            <span
              className="inline-block text-white text-sm font-bold px-3 py-1 rounded-md mb-3"
              style={{ backgroundColor: gradeColor(report.grade) }}
            >
              Grade {report.grade} · {report.grade_interpretation}
            </span>
            <h1 className="font-display text-3xl text-navy mb-1">{report.cm_name}</h1>
            <p className="text-navy/60 mb-6">
              Chief Minister of {report.state}
              {report.party ? ` · ${report.party}` : ""}
            </p>

            <dl className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-black/5">
                <dt className="text-xs text-navy/40 uppercase tracking-wide">Overall Score</dt>
                <dd className="font-display text-2xl text-navy">
                  {report.overall_score.toFixed(2)} / 100
                </dd>
              </div>
              <div className="bg-white rounded-xl p-4 border border-black/5">
                <dt className="text-xs text-navy/40 uppercase tracking-wide">Tenure</dt>
                <dd className="text-navy font-semibold">{report.tenure || "—"}</dd>
              </div>
              <div className="bg-white rounded-xl p-4 border border-black/5">
                <dt className="text-xs text-navy/40 uppercase tracking-wide">Assessment Period</dt>
                <dd className="text-navy font-semibold">{report.assessment_year || "—"}</dd>
              </div>
              <div className="bg-white rounded-xl p-4 border border-black/5">
                <dt className="text-xs text-navy/40 uppercase tracking-wide">Peers</dt>
                <dd className="text-navy font-semibold">{report.peers || "—"}</dd>
              </div>
            </dl>

            {report.category_scores?.length > 0 && (
              <div className="bg-white rounded-xl border border-black/5 overflow-hidden mb-8">
                <table className="w-full text-sm">
                  <thead className="bg-navy text-white text-left">
                    <tr>
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Weight</th>
                      <th className="px-4 py-2 font-medium">Score</th>
                      <th className="px-4 py-2 font-medium">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {report.category_scores.map((c, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-navy">{c.category}</td>
                        <td className="px-4 py-2 text-navy/60">{c.weight}</td>
                        <td className="px-4 py-2 text-navy font-semibold">{c.score}</td>
                        <td className="px-4 py-2">
                          <span
                            className="text-white text-xs font-bold px-2 py-0.5 rounded"
                            style={{ backgroundColor: gradeColor(c.grade) }}
                          >
                            {c.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a
                href={report.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-navy text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-navy-light transition-colors"
              >
                ⬇ Download Full PDF Report
              </a>
              {report.xlsx_url && (
                <a
                  href={report.xlsx_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="bg-gold text-navy px-5 py-3 rounded-xl font-semibold text-sm hover:brightness-95 transition-all"
                >
                  ⬇ Download Excel Workbook
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
