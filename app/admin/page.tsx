"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { parseReportPdf, ParsedReport } from "@/lib/parseReportPdf";
import { slugify } from "@/lib/grades";
import type { Session } from "@supabase/supabase-js";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) return <Centered>Loading…</Centered>;
  if (!session) return <LoginForm onLoggedIn={setSession} />;
  return <UploadForm onLogout={() => supabase.auth.signOut()} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy text-white">
      {children}
    </div>
  );
}

function LoginForm({ onLoggedIn }: { onLoggedIn: (s: Session) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    if (data.session) onLoggedIn(data.session);
  };

  return (
    <Centered>
      <form onSubmit={submit} className="w-full max-w-sm bg-white/5 p-8 rounded-2xl border border-white/10">
        <h1 className="font-display text-xl mb-6">Admin Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded-lg bg-white/10 border border-white/20 outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg bg-white/10 border border-white/20 outline-none"
          required
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-gold text-navy font-semibold py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-white/40 mt-4">
          Only your admin account (created in Supabase Auth) can sign in — this page is not linked
          from the public site.
        </p>
      </form>
    </Centered>
  );
}

function UploadForm({ onLogout }: { onLogout: () => void }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedReport | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // editable fields, pre-filled from parsing
  const [state, setState] = useState("");
  const [cmName, setCmName] = useState("");
  const [party, setParty] = useState("");
  const [tenure, setTenure] = useState("");
  const [assessmentYear, setAssessmentYear] = useState("");
  const [peers, setPeers] = useState("");
  const [overallScore, setOverallScore] = useState<string>("");
  const [grade, setGrade] = useState("");

  const handlePdf = async (file: File) => {
    setPdfFile(file);
    setParsing(true);
    setStatus("Reading PDF & rendering page 1…");
    try {
      const result = await parseReportPdf(file);
      setParsed(result);
      setPreviewUrl(URL.createObjectURL(result.page1ImageBlob));
      setState(result.state);
      setCmName(result.cmName);
      setTenure(result.tenure);
      setAssessmentYear(result.assessmentYear);
      setPeers(result.peers);
      setOverallScore(result.overallScore?.toString() || "");
      setGrade(result.grade);
      setStatus("Auto-filled from PDF — please review before publishing.");
    } catch (err: any) {
      setStatus("Could not auto-parse this PDF. Fill the fields in manually below.");
    } finally {
      setParsing(false);
    }
  };

  const publish = async () => {
    if (!pdfFile || !parsed) return;
    setSaving(true);
    setStatus("Uploading files…");
    try {
      const slug = slugify(`${state}-${cmName}`);
      const stamp = Date.now();

      // 1. upload page-1 cover image
      const imgPath = `${slug}-${stamp}.png`;
      const { error: imgErr } = await supabase.storage
        .from("page1-images")
        .upload(imgPath, parsed.page1ImageBlob, { contentType: "image/png" });
      if (imgErr) throw imgErr;
      const { data: imgPub } = supabase.storage.from("page1-images").getPublicUrl(imgPath);

      // 2. upload PDF
      const pdfPath = `${slug}-${stamp}.pdf`;
      const { error: pdfErr } = await supabase.storage
        .from("report-files")
        .upload(pdfPath, pdfFile, { contentType: "application/pdf" });
      if (pdfErr) throw pdfErr;
      const { data: pdfPub } = supabase.storage.from("report-files").getPublicUrl(pdfPath);

      // 3. upload xlsx (optional)
      let xlsxUrl: string | null = null;
      if (xlsxFile) {
        const xlsxPath = `${slug}-${stamp}.xlsx`;
        const { error: xlsxErr } = await supabase.storage
          .from("report-files")
          .upload(xlsxPath, xlsxFile, {
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          });
        if (xlsxErr) throw xlsxErr;
        xlsxUrl = supabase.storage.from("report-files").getPublicUrl(xlsxPath).data.publicUrl;
      }

      setStatus("Saving report…");
      const { error: insertErr } = await supabase.from("reports").insert({
        slug,
        state,
        cm_name: cmName,
        party,
        tenure,
        assessment_year: assessmentYear,
        peers,
        overall_score: parseFloat(overallScore),
        grade,
        grade_interpretation: gradeInterpretationOf(grade),
        category_scores: parsed.categoryScores,
        page1_image_url: imgPub.publicUrl,
        pdf_url: pdfPub.publicUrl,
        xlsx_url: xlsxUrl,
        published: true
      });
      if (insertErr) throw insertErr;

      setStatus("✅ Published! It's now live on the website.");
      resetForm();
    } catch (err: any) {
      setStatus(`❌ ${err.message || "Something went wrong."}`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setPdfFile(null);
    setXlsxFile(null);
    setParsed(null);
    setPreviewUrl("");
    setState("");
    setCmName("");
    setParty("");
    setTenure("");
    setAssessmentYear("");
    setPeers("");
    setOverallScore("");
    setGrade("");
  };

  return (
    <main className="min-h-screen bg-bharat-bg">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl text-navy">Publish a Report Card</h1>
          <button onClick={onLogout} className="text-sm text-navy/50 hover:text-navy">
            Log out
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
          <label className="block text-sm font-semibold text-navy mb-2">
            1. Upload Report Card PDF
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => e.target.files?.[0] && handlePdf(e.target.files[0])}
            className="block w-full text-sm mb-4"
          />

          <label className="block text-sm font-semibold text-navy mb-2">
            2. Upload Excel Workbook (optional, offered as a download)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && setXlsxFile(e.target.files[0])}
            className="block w-full text-sm"
          />

          {status && <p className="text-sm text-navy/60 mt-4">{status}</p>}
        </div>

        {previewUrl && (
          <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
            <p className="text-sm font-semibold text-navy mb-4">
              3. Review auto-filled details (edit anything before publishing)
            </p>
            <div className="grid md:grid-cols-[160px_1fr] gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Page 1 preview" className="rounded-lg border border-black/10 w-full" />

              <div className="grid grid-cols-2 gap-3">
                <Field label="State" value={state} onChange={setState} />
                <Field label="CM Name" value={cmName} onChange={setCmName} />
                <Field label="Party" value={party} onChange={setParty} placeholder="e.g. BJP" />
                <Field label="Tenure" value={tenure} onChange={setTenure} />
                <Field label="Assessment Period" value={assessmentYear} onChange={setAssessmentYear} />
                <Field label="Peers" value={peers} onChange={setPeers} />
                <Field label="Overall Score" value={overallScore} onChange={setOverallScore} />
                <Field label="Grade" value={grade} onChange={setGrade} placeholder="C+" />
              </div>
            </div>

            <button
              onClick={publish}
              disabled={saving || parsing || !cmName || !state || !overallScore || !grade}
              className="mt-6 w-full bg-navy text-white font-semibold py-3 rounded-xl disabled:opacity-40"
            >
              {saving ? "Publishing…" : "Publish to Website"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-navy/50 mb-1">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:border-navy"
      />
    </label>
  );
}

function gradeInterpretationOf(grade: string): string {
  const map: Record<string, string> = {
    "A+": "Exceptional Performance",
    A: "Excellent Performance",
    "B+": "Strong Performance",
    B: "Above-Average Performance",
    "C+": "Moderate Performance",
    C: "Below-Average Performance",
    D: "Weak Performance",
    E: "Very Weak Performance"
  };
  return map[grade.trim().toUpperCase()] || "";
}
