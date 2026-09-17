"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, RefreshCw, UserPlus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

type Invite = {
  id: string;
  email: string;
  status: "active" | "pending_approval" | "rejected";
  activated: boolean;
  bookings: number;
  createdAt: number;
};

export default function NiInvitesPage() {
  const { language } = useLanguage();
  const english = language === "en";
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadInvites = async () => {
    const response = await fetch("/api/ni-invites", { cache: "no-store" });
    const json = await response.json();
    if (response.ok && json.success) setInvites(json.users || []);
  };

  useEffect(() => {
    void loadInvites();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/ni-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Hiba történt.");
      setMessage(json.message);
      setEmail("");
      await loadInvites();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030816] text-slate-300 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <Link href="/ni/bookings" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> {english ? "Back to bookings" : "Vissza a foglalásokhoz"}
        </Link>
        <div className="rounded-3xl border border-white/10 bg-[#0B1221]/90 p-7 shadow-2xl">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#41B679] font-bold">{english ? "NI partner network" : "NI partnerhálózat"}</p>
              <h1 className="text-3xl font-black text-white mt-2">{english ? "Invitations" : "Meghívók"}</h1>
              <p className="text-slate-400 mt-2">{english ? "Invite colleagues and track their bookings." : "Hívj meg kollégákat, és lásd, hány foglalást készítettek."}</p>
            </div>
            <UserPlus className="w-9 h-9 text-[#41B679]" />
          </div>

          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder={english ? "colleague@emerson.com" : "kollega@emerson.com"}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-white outline-none focus:border-[#41B679]"
                required
              />
            </div>
            <button disabled={loading} className="rounded-xl bg-[#41B679] px-6 py-3 font-bold text-white disabled:opacity-50">
              {loading ? (english ? "Sending..." : "Küldés...") : (english ? "Send invitation" : "Meghívó küldése")}
            </button>
          </form>
          <p className="text-xs text-slate-500 mb-5">{english ? "Emerson addresses are sent immediately. Other domains require administrator approval." : "Az Emerson-címek azonnal kiküldhetők. Más domain esetén rendszergazdai jóváhagyás szükséges."}</p>
          {message && <p className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-300">{message}</p>}
          {error && <p className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-rose-300">{error}</p>}

          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">{english ? "People invited by you" : "Általad meghívott személyek"}</h2>
            <button onClick={() => void loadInvites()} className="text-slate-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
          </div>
          <div className="divide-y divide-white/10">
            {invites.map((invite) => (
              <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-semibold text-white">{invite.email}</p>
                  <p className="text-xs text-slate-500">{new Date(invite.createdAt).toLocaleDateString(english ? "en-US" : "hu-HU")}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={invite.activated ? "text-emerald-300" : "text-amber-300"}>
                    {invite.activated ? (english ? "Active" : "Aktív") : (english ? "Pending" : "Függőben")}
                  </span>
                  <span className="text-slate-300">{invite.bookings} {english ? "bookings" : "foglalás"}</span>
                </div>
              </div>
            ))}
            {invites.length === 0 && <p className="py-8 text-center text-slate-500">{english ? "No invitations yet." : "Még nincs meghívott személy."}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
