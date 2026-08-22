import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bharat-bg text-navy px-6 text-center">
      <h1 className="font-display text-3xl mb-3">Report Not Found</h1>
      <p className="text-navy/60 mb-6">This CM report card doesn't exist or isn't published yet.</p>
      <Link href="/" className="bg-navy text-white px-5 py-2 rounded-lg font-semibold">
        ← Back home
      </Link>
    </main>
  );
}
