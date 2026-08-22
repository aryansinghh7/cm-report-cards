export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center bg-navy text-white overflow-hidden px-6">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,#e6a730,transparent_40%),radial-gradient(circle_at_80%_80%,#e6a730,transparent_40%)]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <span className="uppercase tracking-[0.3em] text-gold text-xs md:text-sm mb-4">
          Evidence. Evaluation. Excellence.
        </span>
        <h1 className="font-display text-4xl md:text-6xl leading-tight mb-4">
          CM REPORT
          <br />
          CARDS
        </h1>
        <p className="text-white/70 mb-8 text-sm md:text-base">
          Questioning norms for a better Bharat — data-driven Chief Minister
          performance report cards, researched &amp; prepared by
        </p>

        <a
          href="https://www.instagram.com/suryanshi_tyagi_/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors rounded-full pl-2 pr-5 py-2 border border-white/20"
        >
          <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-lg">
            📷
          </span>
          <span className="font-semibold">@suryanshi_tyagi_</span>
        </a>

        <button
          onClick={() =>
            document.getElementById("cm-list")?.scrollIntoView({ behavior: "smooth" })
          }
          className="mt-14 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
          aria-label="Scroll to report cards"
        >
          <span className="text-xs uppercase tracking-widest">Scroll for report cards</span>
          <span className="text-2xl animate-bounce">↓</span>
        </button>
      </div>
    </section>
  );
}
