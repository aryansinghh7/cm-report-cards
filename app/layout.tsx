import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CM Report Cards | @suryanshi_tyagi_",
  description: "Evidence. Evaluation. Excellence. CM Performance Report Cards.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
