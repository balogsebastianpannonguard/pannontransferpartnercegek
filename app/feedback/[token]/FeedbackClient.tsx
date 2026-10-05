"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, CheckCircle2, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import type { BookingEase, ConcernArea, FeedbackLanguage } from "@/lib/feedback";

interface RequestInfo {
  bookingCode: string;
  travelerName: string;
  language: FeedbackLanguage;
  submitted: boolean;
}

type LoadState = "loading" | "ready" | "not_found" | "already" | "done" | "error";

const TEXT = {
  hu: {
    title: "Visszajelzés az utazásról",
    intro: "Válaszai nagyban segítik szolgáltatásunk fejlesztését!",
    hello: (name: string) => `Kedves ${name}!`,
    satisfied: "Elégedett volt a transzfer szolgáltatással?",
    yes: "Igen",
    no: "Nem",
    concernTitle: "Kérjük, mondja el bővebben a tapasztalatait. Jelölje meg, melyik területtel volt gondja:",
    concerns: { booking: "Foglalási folyamat", notifications: "Értesítések", driver: "Sofőr", vehicle: "Jármű", other: "Egyéb" } as Record<ConcernArea, string>,
    concernOther: "Kérjük, írja le, mi volt a gond",
    experience: "Kérjük, mondja el bővebben a tapasztalatait:",
    notification: "Megkapta a sofőr adatait tartalmazó e-mail értesítést az utazás előtt 12–24 órával?",
    ease: "Mennyire volt könnyű vagy nehéz az online foglalási felületünk használata?",
    easeOptions: { very_easy: "Nagyon könnyű", easy: "Könnyű", neutral: "Semleges", difficult: "Nehéz", very_difficult: "Nagyon nehéz" } as Record<BookingEase, string>,
    difficulties: "Ha nehézségbe ütközött, kérjük, röviden írja le:",
    placeholder: "Írja be a választ",
    required: "Kötelező",
    submit: "Visszajelzés elküldése",
    sending: "Küldés…",
    thanksTitle: "Köszönjük a visszajelzését!",
    thanksBody: "Értékes véleménye segít abban, hogy szolgáltatásunk még jobb legyen.",
    alreadyTitle: "Ezt a visszajelzést már elküldte",
    alreadyBody: "Köszönjük, a válaszait megkaptuk.",
    notFoundTitle: "Érvénytelen link",
    notFoundBody: "Ez a visszajelzési link nem található vagy lejárt.",
    errorTitle: "Hiba történt",
    errorBody: "Nem sikerült betölteni vagy elküldeni a kérdőívet. Kérjük, próbálja újra.",
    errors: {
      satisfied_required: "Kérjük, válaszoljon az első kérdésre.",
      concerns_required: "Kérjük, jelöljön meg legalább egy területet.",
      concern_other_required: "Kérjük, írja le az „Egyéb” területet.",
      notification_required: "Kérjük, válaszoljon az értesítésre vonatkozó kérdésre.",
      booking_ease_required: "Kérjük, értékelje a foglalási felület használatát.",
      generic: "Nem sikerült elküldeni. Kérjük, próbálja újra.",
    } as Record<string, string>,
  },
  en: {
    title: "Trip feedback",
    intro: "Your responses will greatly help with the development of our service!",
    hello: (name: string) => `Dear ${name},`,
    satisfied: "Were you satisfied with the transfer service?",
    yes: "Yes",
    no: "No",
    concernTitle: "Please tell us more about your experience. Select your area of concern:",
    concerns: { booking: "Booking process", notifications: "Notifications", driver: "Driver", vehicle: "Vehicle", other: "Other" } as Record<ConcernArea, string>,
    concernOther: "Please describe the issue",
    experience: "Please tell us more about your experience:",
    notification: "Did you receive the e-mail notification with the driver's details 12-24 hours before your trip?",
    ease: "How easy or difficult was it to use our online booking platform?",
    easeOptions: { very_easy: "Very easy", easy: "Easy", neutral: "Neutral", difficult: "Difficult", very_difficult: "Very difficult" } as Record<BookingEase, string>,
    difficulties: "If you encountered any difficulties, please describe them briefly:",
    placeholder: "Enter your answer",
    required: "Required",
    submit: "Send feedback",
    sending: "Sending…",
    thanksTitle: "Thank you for your feedback!",
    thanksBody: "Your valuable opinion helps us make our service even better.",
    alreadyTitle: "You have already sent this feedback",
    alreadyBody: "Thank you, we have received your answers.",
    notFoundTitle: "Invalid link",
    notFoundBody: "This feedback link was not found or has expired.",
    errorTitle: "Something went wrong",
    errorBody: "We could not load or send the survey. Please try again.",
    errors: {
      satisfied_required: "Please answer the first question.",
      concerns_required: "Please select at least one area of concern.",
      concern_other_required: "Please describe the “Other” area.",
      notification_required: "Please answer the question about the notification.",
      booking_ease_required: "Please rate how easy the booking platform was to use.",
      generic: "Could not send. Please try again.",
    } as Record<string, string>,
  },
} as const;

const CONCERN_ORDER: ConcernArea[] = ["booking", "notifications", "driver", "vehicle", "other"];
const EASE_ORDER: BookingEase[] = ["very_easy", "easy", "neutral", "difficult", "very_difficult"];

function Shell({ children, lang, onLang }: { children: React.ReactNode; lang: FeedbackLanguage; onLang?: (l: FeedbackLanguage) => void }) {
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#030816] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-[#41B679]/15 blur-[120px]" />
        <div className="absolute -right-28 top-10 h-[30rem] w-[30rem] rounded-full bg-[#0A5CCB]/20 blur-[130px]" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+32px)] pt-[calc(env(safe-area-inset-top)+20px)]">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-[0.3em] text-[#41B679]">PANNON TRANSFER</div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Executive Travel</div>
          </div>
          {onLang && (
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#040E1B]/70 px-1.5 py-1 backdrop-blur-xl">
              {(["hu", "en"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLang(code)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                    lang === code ? "bg-[#41B679] text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}

function StatusCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center backdrop-blur-xl"
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06]">{icon}</div>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">{body}</p>
    </motion.div>
  );
}

function Question({ title, required, children, hint }: { title: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
      <h2 className="text-[15px] font-semibold leading-snug text-white">
        {title}
        {required && <span className="ml-1 text-[#41B679]">*</span>}
      </h2>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Choice({ selected, onClick, children, icon, multi }: { selected: boolean; onClick: () => void; children: React.ReactNode; icon?: React.ReactNode; multi?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] font-medium transition-all duration-200 active:scale-[0.985] ${
        selected
          ? "border-[#41B679]/70 bg-[#41B679]/15 text-white shadow-[0_0_0_1px_rgba(65,182,121,0.25)]"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25"
      }`}
    >
      {icon}
      <span
        className={`ml-auto order-last flex h-6 w-6 shrink-0 items-center justify-center border transition-colors ${multi ? "rounded-md" : "rounded-full"} ${
          selected ? "border-[#41B679] bg-[#41B679]" : "border-white/25"
        }`}
        aria-hidden
      >
        {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      maxLength={2000}
      className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[16px] text-white outline-none transition placeholder:text-slate-600 focus:border-[#41B679]/70 focus:ring-4 focus:ring-[#41B679]/15"
    />
  );
}

export default function FeedbackClient({ token }: { token: string }) {
  const [state, setState] = useState<LoadState>("loading");
  const [info, setInfo] = useState<RequestInfo | null>(null);
  const [lang, setLang] = useState<FeedbackLanguage>("hu");

  const [satisfied, setSatisfied] = useState<boolean | null>(null);
  const [concerns, setConcerns] = useState<ConcernArea[]>([]);
  const [concernOther, setConcernOther] = useState("");
  const [experience, setExperience] = useState("");
  const [notificationReceived, setNotificationReceived] = useState<boolean | null>(null);
  const [bookingEase, setBookingEase] = useState<BookingEase | null>(null);
  const [difficulties, setDifficulties] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = TEXT[lang];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/feedback/${token}`, { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 404) return setState("not_found");
        if (!res.ok) return setState("error");
        const data = await res.json();
        setInfo(data.request);
        setLang(data.request.language === "en" ? "en" : "hu");
        setState(data.request.submitted ? "already" : "ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggleConcern = (area: ConcernArea) =>
    setConcerns((current) => (current.includes(area) ? current.filter((a) => a !== area) : [...current, area]));

  const missing = useMemo(() => {
    if (satisfied === null) return "satisfied_required";
    if (satisfied === false) {
      if (concerns.length === 0) return "concerns_required";
      if (concerns.includes("other") && !concernOther.trim()) return "concern_other_required";
    }
    if (notificationReceived === null) return "notification_required";
    if (bookingEase === null) return "booking_ease_required";
    return null;
  }, [satisfied, concerns, concernOther, notificationReceived, bookingEase]);

  const submit = async () => {
    if (missing) {
      setError(t.errors[missing]);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/feedback/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          satisfied,
          concerns: satisfied ? [] : concerns,
          concernOther: !satisfied && concerns.includes("other") ? concernOther : undefined,
          experience: satisfied ? undefined : experience,
          notificationReceived,
          bookingEase,
          difficulties,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) return setState("done");
      if (res.status === 409) return setState("already");
      setError(t.errors[data?.error as string] ?? t.errors.generic);
    } catch {
      setError(t.errors.generic);
    } finally {
      setSubmitting(false);
    }
  };

  if (state === "loading") {
    return (
      <Shell lang={lang}>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#41B679]" />
        </div>
      </Shell>
    );
  }
  if (state === "not_found") {
    return (
      <Shell lang={lang} onLang={setLang}>
        <StatusCard icon={<AlertTriangle className="h-8 w-8 text-amber-400" />} title={t.notFoundTitle} body={t.notFoundBody} />
      </Shell>
    );
  }
  if (state === "error") {
    return (
      <Shell lang={lang} onLang={setLang}>
        <StatusCard icon={<AlertTriangle className="h-8 w-8 text-amber-400" />} title={t.errorTitle} body={t.errorBody} />
      </Shell>
    );
  }
  if (state === "already") {
    return (
      <Shell lang={lang} onLang={setLang}>
        <StatusCard icon={<CheckCircle2 className="h-8 w-8 text-[#41B679]" />} title={t.alreadyTitle} body={t.alreadyBody} />
      </Shell>
    );
  }
  if (state === "done") {
    return (
      <Shell lang={lang} onLang={setLang}>
        <StatusCard icon={<CheckCircle2 className="h-8 w-8 text-[#41B679]" />} title={t.thanksTitle} body={t.thanksBody} />
      </Shell>
    );
  }

  return (
    <Shell lang={lang} onLang={setLang}>
      <div className="mb-5">
        <h1 className="font-serif text-[26px] font-bold leading-tight">{t.title}</h1>
        {info && <p className="mt-2 text-sm font-semibold text-slate-200">{t.hello(info.travelerName)}</p>}
        <p className="mt-1 text-sm leading-relaxed text-slate-400">{t.intro}</p>
        {info && <p className="mt-2 text-[11px] font-semibold tracking-[0.2em] text-slate-600">#{info.bookingCode}</p>}
      </div>

      <div className="space-y-4">
        <Question title={t.satisfied} required>
          <div className="grid grid-cols-2 gap-3">
            <Choice selected={satisfied === true} onClick={() => setSatisfied(true)} icon={<ThumbsUp className="h-5 w-5 text-[#41B679]" />}>
              {t.yes}
            </Choice>
            <Choice selected={satisfied === false} onClick={() => setSatisfied(false)} icon={<ThumbsDown className="h-5 w-5 text-amber-400" />}>
              {t.no}
            </Choice>
          </div>
        </Question>

        <AnimatePresence initial={false}>
          {satisfied === false && (
            <motion.div
              key="unsatisfied"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 overflow-hidden"
            >
              <Question title={t.concernTitle} required>
                <div className="space-y-2.5">
                  {CONCERN_ORDER.map((area) => (
                    <Choice key={area} multi selected={concerns.includes(area)} onClick={() => toggleConcern(area)}>
                      {t.concerns[area]}
                    </Choice>
                  ))}
                  {concerns.includes("other") && (
                    <input
                      value={concernOther}
                      onChange={(e) => setConcernOther(e.target.value)}
                      placeholder={t.concernOther}
                      maxLength={300}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[16px] text-white outline-none transition placeholder:text-slate-600 focus:border-[#41B679]/70 focus:ring-4 focus:ring-[#41B679]/15"
                    />
                  )}
                </div>
              </Question>
              <Question title={t.experience}>
                <TextArea value={experience} onChange={setExperience} placeholder={t.placeholder} />
              </Question>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {satisfied !== null && (
            <motion.div
              key="common"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 overflow-hidden"
            >
              <Question title={t.notification} required>
                <div className="grid grid-cols-2 gap-3">
                  <Choice selected={notificationReceived === true} onClick={() => setNotificationReceived(true)}>
                    {t.yes}
                  </Choice>
                  <Choice selected={notificationReceived === false} onClick={() => setNotificationReceived(false)}>
                    {t.no}
                  </Choice>
                </div>
              </Question>

              <Question title={t.ease} required>
                <div className="space-y-2.5">
                  {EASE_ORDER.map((level) => (
                    <Choice key={level} selected={bookingEase === level} onClick={() => setBookingEase(level)}>
                      {t.easeOptions[level]}
                    </Choice>
                  ))}
                </div>
              </Question>

              <Question title={t.difficulties}>
                <TextArea value={difficulties} onChange={setDifficulties} placeholder={t.placeholder} />
              </Question>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="mt-4 flex items-center gap-2.5 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-[13px] font-medium text-red-200"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#41B679] to-[#2f9a62] text-[16px] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(65,182,121,0.7)] transition active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t.sending}
          </>
        ) : (
          t.submit
        )}
      </button>
    </Shell>
  );
}
