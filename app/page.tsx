import BrandHeader from "@/components/BrandHeader";
import { brand } from "@/lib/config/brand";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────
// HOMEPAGE CONTENT — safe to customize in Module 4.
// Edit the words below, or reorder the sections in SECTION_ORDER.
// ─────────────────────────────────────────────────────────────

const headline = "Order your favorites in seconds.";
const subcopy =
  "Browse the menu, add what you're craving to your cart, and place your order — all from one place.";

const howItWorks = [
  { title: "1. Browse the menu", text: "See what's available and pick your favorites." },
  { title: "2. Add to cart & order", text: "Choose quantities and place your order in one click." },
  { title: "3. Track your order", text: "Watch it move from pending to ready, right from your account." },
];

// Reorder these to change the page layout (Module 4 layout edit).
const SECTION_ORDER = ["hero", "how-it-works", "cta"] as const;

// ─────────────────────────────────────────────────────────────

type SectionId = (typeof SECTION_ORDER)[number];

const sections: Record<SectionId, React.ReactNode> = {
  hero: (
    <section key="hero" className="relative overflow-hidden px-4 py-16 text-center">
      <span className="rocket-fly" aria-hidden="true">
        🚀
      </span>
      <img
        src="https://apiuat.timetecbuilding.com/images/logo/ineighbour_logo.png"
        alt=""
        aria-hidden="true"
        width={100}
        height={22}
        className="logo-fly"
      />
      {brand.showWorkshopBadge && (
        <span className="mb-4 inline-block rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600">
          Built at the TimeTec AI Workshop
        </span>
      )}
      <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        {headline}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">{subcopy}</p>
      <p className="mt-2 text-sm font-medium" style={{ color: brand.primaryColor }}>
        {brand.tagline}
      </p>
    </section>
  ),
  "how-it-works": (
    <section key="how-it-works" className="px-4 py-12">
      <h2 className="text-center text-2xl font-semibold">How it works</h2>
      <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-3">
        {howItWorks.map((step) => (
          <div key={step.title} className="rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  ),
  cta: (
    <section key="cta" className="px-4 py-16 text-center">
      <h2 className="text-2xl font-semibold">Ready to start?</h2>
      <div className="mt-6 flex justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-md px-5 py-2.5 font-medium text-white"
          style={{ backgroundColor: brand.primaryColor }}
        >
          Create your account
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          Sign in
        </Link>
      </div>
    </section>
  ),
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <BrandHeader />
      <main>{SECTION_ORDER.map((id) => sections[id])}</main>
      <footer className="border-t border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
        {brand.name} — {brand.tagline}
      </footer>
    </div>
  );
}
