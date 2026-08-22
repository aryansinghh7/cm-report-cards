// Runs entirely in the browser. Loads pdfjs-dist, reads page 1 text to
// auto-fill the admin form, and rasterizes page 1 to a PNG (used as the
// "cover" image shown on the CM's card and profile page — exactly what
// the brief asks for: "the first page of the PDF").
//
// The regexes are tuned to the fixed CM Performance Report template
// (title page layout). If a future report's wording drifts slightly, the
// admin form still lets you correct any field before publishing — so
// parsing failures never block you, they just mean less auto-fill.

export type ParsedReport = {
  state: string;
  cmName: string;
  tenure: string;
  assessmentYear: string;
  peers: string;
  overallScore: number | null;
  grade: string;
  categoryScores: { category: string; weight: string; score: number; grade: string }[];
  page1ImageBlob: Blob;
};

async function getPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  return pdfjsLib;
}

async function getPageText(page: any): Promise<string> {
  const content = await page.getTextContent();
  return content.items.map((it: any) => it.str).join("\n");
}

function grab(text: string, regex: RegExp): string {
  const m = text.match(regex);
  return m ? m[1].trim() : "";
}

export async function parseReportPdf(file: File): Promise<ParsedReport> {
  const pdfjsLib = await getPdfJs();
  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;

  const page1 = await doc.getPage(1);
  const text1 = await getPageText(page1);

  // --- Rasterize page 1 as the cover image ---
  const viewport = page1.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page1.render({ canvasContext: ctx, viewport }).promise;
  const page1ImageBlob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), "image/png", 0.92)
  );

  // --- Extract fields from page 1 text ---
  const cmName = grab(text1, /CHIEF MINISTER OF\s*\n?([\s\S]*?)\nCHIEF MINISTER OF/) ||
    grab(text1, /([A-Z][A-Z .]+ADITYANATH|[A-Z][A-Z .]{3,40})\s*\nCHIEF MINISTER OF/) ||
    "";

  const state = grab(text1, /CHIEF MINISTER OF\s*\n([A-Z .]+?)\n/) ||
    grab(text1, /\n([A-Z]{3,30})INDEX/) || "";

  const tenure = grab(text1, /TENURE\s*\n?([0-9]{1,2} [A-Z]+,? [0-9]{4}\s*[-–]\s*(?:PRESENT|[0-9]{1,2} [A-Z]+,? [0-9]{4}))/i);

  const assessmentYear = grab(text1, /ASSESSMENT YEAR\s*\n?(FY\s*[0-9]{2,4}[-–][0-9]{2,4}\s*to\s*FY\s*[0-9]{2,4}[-–][0-9]{2,4})/i);

  const peers = grab(text1, /PEERS\s*\n?([A-Za-z, &]+?)\n/);

  const scoreRaw = grab(text1, /OVERALL SCORE\s*\n?([0-9]{1,3}\.[0-9]{1,2})/i) ||
    grab(text1, /([0-9]{1,3}\.[0-9]{1,2})\s*\nOUT OF 100/i);
  const overallScore = scoreRaw ? parseFloat(scoreRaw) : null;

  const grade = grab(text1, /GRADE\s*\n?([A-E][+]?)\s*\n/i) ||
    grab(text1, /\n([A-E][+]?)\s*\nMODERATE|\n([A-E][+]?)\s*\n(?:EXCEPTIONAL|EXCELLENT|STRONG|ABOVE-AVERAGE|BELOW-AVERAGE|WEAK|VERY WEAK)/i);

  // --- Category scorecard, usually on page 2 ("1. CONSOLIDATED CATEGORY SCORECARD") ---
  let categoryScores: ParsedReport["categoryScores"] = [];
  try {
    const page2 = await doc.getPage(2);
    const text2 = await getPageText(page2);
    const rowRegex =
      /([A-Z]{3,4}\s*[–-]\s*[A-Za-z &]+?)\s*\n?(\d{1,2}%)\s*\n?([\d.]+)\s*\n?([\d.]+)\s*\n?([\d.]+)\s*\n?([\d.]+)\s*\n?([\d.]+)\s*\n?(A\+|A|B\+|B|C\+|C|D|E)/g;
    let m: RegExpExecArray | null;
    while ((m = rowRegex.exec(text2))) {
      categoryScores.push({
        category: m[1].trim(),
        weight: m[2],
        score: parseFloat(m[6]),
        grade: m[7]
      });
    }
  } catch {
    // page 2 not parseable — admin can add categories manually
  }

  return {
    state: state.trim(),
    cmName: cmName.trim(),
    tenure: tenure.trim(),
    assessmentYear: assessmentYear.trim(),
    peers: peers.trim(),
    overallScore,
    grade: (grade || "").trim().toUpperCase(),
    categoryScores,
    page1ImageBlob
  };
}
