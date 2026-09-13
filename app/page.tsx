"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";

const partners = [
  {
    key: "catl",
    name: "CATL Hungary Kft.",
    label: "CATL",
    href: "/catl",
    accent: "#0047BA",
    accentSecondary: "#00B4D8",
    description: "Dedikált partnerportál, meghívásos belépéssel és vállalati foglalási folyamattal.",
  },
  {
    key: "ecopro",
    name: "EcoPro BM Hungary",
    label: "EcoPro",
    href: "/ecopro",
    accent: "#0096D6",
    accentSecondary: "#F28C28",
    description: "Saját EcoPro portál külön meghívófolyamattal, egyedi auth linkkel és foglalási felülettel.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#040914] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,180,216,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(242,140,40,0.14),transparent_28%),linear-gradient(180deg,#040914_0%,#09152B_100%)]" />
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:36px_36px]" />

      <section className="relative z-10 min-h-screen max-w-6xl mx-auto px-6 py-16 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black tracking-[0.24em] uppercase text-sky-100 mb-6">
            <ShieldCheck className="w-4 h-4" />
            Pannon Transfer Partnerportálok
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Válaszd ki a céges portált
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Meghívásos partnerbelépés, dedikált árstruktúra és külön vállalati foglalási folyamat cégenként szétválasztva.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 * index }}
              className="group rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
            >
              <div
                className="h-1.5"
                style={{
                  background: `linear-gradient(90deg, ${partner.accent} 0%, ${partner.accentSecondary} 100%)`,
                }}
              />
              <div className="p-8">
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div
                    className="w-16 h-16 rounded-[1.35rem] flex items-center justify-center shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${partner.accent} 0%, ${partner.accentSecondary} 100%)`,
                    }}
                  >
                    <span className="text-white font-black text-lg tracking-tight">{partner.label}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-slate-300">
                    <Building2 className="w-3.5 h-3.5" />
                    Partner
                  </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight mb-3">{partner.name}</h2>
                <p className="text-slate-300 leading-relaxed mb-8">{partner.description}</p>

                <Link
                  href={partner.href}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl text-sm font-black tracking-[0.18em] uppercase text-white transition-transform duration-200 group-hover:translate-x-1"
                  style={{
                    background: `linear-gradient(90deg, ${partner.accent} 0%, ${partner.accentSecondary} 100%)`,
                  }}
                >
                  Portál megnyitása
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
