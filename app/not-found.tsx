import type { Metadata } from "next";
import { AlertTriangle, Phone, Mail, ShieldOff } from "lucide-react";

// Shown for the root "/" route (see app/page.tsx which calls notFound())
// and for any unmatched path in this app. Intentionally does NOT reveal
// the partner portal selector, so nobody who lands here by accident can
// see which companies use this system. All individual partner routes
// (/catl, /ni, /schaeffler, ...) keep working exactly as before.
export const metadata: Metadata = {
  title: "404 - Az oldal nem található",
  description: "Az oldal nem található.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#040914] text-white relative overflow-hidden flex items-center justify-center px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(0,180,216,0.08),transparent_28%),linear-gradient(180deg,#040914_0%,#09152B_100%)]" />
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:36px_36px]" />

      <div className="relative z-10 max-w-2xl w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-[11px] font-black tracking-[0.24em] uppercase text-red-300 mb-8">
          <ShieldOff className="w-4 h-4" />
          Hozzáférés megtagadva
        </div>

        <h1 className="font-serif text-7xl sm:text-8xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-5">
          Ez az oldal nem létezik
        </h2>

        <div className="flex items-start justify-center gap-3 mb-8 text-left bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 mx-auto max-w-xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-slate-300 leading-relaxed text-[15px]">
            Kérjük, azonnal hagyd el ezt az oldalt. Ide nem tartozol, és itt semmilyen
            tartalom nem érhető el számodra. Köszönjük szépen a megértésed!
          </p>
        </div>

        <p className="text-sm text-slate-500 mb-10">
          Ha kérdésed van, vagy úgy gondolod, hogy tévedésből kaptál 404 hibát, keresd a vezető fejlesztőt.
        </p>

        <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-6">
          <p className="text-[11px] font-black tracking-[0.2em] uppercase text-slate-400">
            Balog Sebastian Máté
          </p>
          <p className="text-xs text-slate-500 mb-1">Vezető fejlesztő &middot; PannonGuard Zrt.</p>
          <a
            href="tel:+36306654135"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-sky-300 transition-colors"
          >
            <Phone className="w-4 h-4 text-sky-400" />
            +36 30 665 4135
          </a>
          <a
            href="mailto:balogh.sebastian@pannonguard.hu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-sky-300 transition-colors"
          >
            <Mail className="w-4 h-4 text-sky-400" />
            balogh.sebastian@pannonguard.hu
          </a>
        </div>
      </div>
    </main>
  );
}
