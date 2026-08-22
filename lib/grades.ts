export type CategoryScore = {
  category: string;
  weight: string;
  score: number;
  grade: string;
};

export type Report = {
  id: string;
  slug: string;
  state: string;
  cm_name: string;
  party: string | null;
  tenure: string | null;
  assessment_year: string | null;
  peers: string | null;
  overall_score: number;
  grade: string;
  grade_interpretation: string | null;
  category_scores: CategoryScore[];
  page1_image_url: string;
  pdf_url: string;
  xlsx_url: string | null;
  published: boolean;
  created_at: string;
};

// Matches the report card's own grade color coding (green -> gold -> orange -> red)
export const gradeColor = (grade: string): string => {
  const g = grade.trim().toUpperCase();
  switch (g) {
    case "A+":
      return "#1f8a3b";
    case "A":
      return "#3fae57";
    case "B+":
      return "#8bc34a";
    case "B":
      return "#e8c73a";
    case "C+":
      return "#f0a63a";
    case "C":
      return "#e8873a";
    case "D":
      return "#e05a4a";
    case "E":
      return "#c62b2b";
    default:
      return "#7a7a7a";
  }
};

export const gradeInterpretation = (grade: string): string => {
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
};

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
