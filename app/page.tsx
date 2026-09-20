import { notFound } from "next/navigation";

// The root route must never reveal the partner portal selector (which
// company names use this system). It immediately renders app/not-found.tsx
// with a real HTTP 404 status. All individual partner routes
// (/catl, /ni, /schaeffler, ...) are untouched and keep working as before.
export default function RootPage(): never {
  notFound();
}
