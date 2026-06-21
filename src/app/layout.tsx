import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CooperProvider } from "@/context/cooper-context";

export const metadata: Metadata = {
  title: "Cooper",
  description: "A calm sustainability habit tracker for lighter daily choices.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CooperProvider>
          <div className="min-h-screen">
            <header className="sticky top-0 z-30 border-b border-[var(--border)]/80 bg-[color:rgb(250_246_239_/_0.8)] backdrop-blur-xl">
              <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                <Link
                  href="/"
                  className="flex items-center gap-3 font-serif text-2xl font-semibold tracking-tight text-[var(--charcoal)] transition-transform duration-300 hover:translate-y-[-1px]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/80 text-base font-bold shadow-[0_8px_20px_rgba(55,61,52,0.06)]">
                    C
                  </span>
                  Cooper.
                </Link>
                <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 p-1 shadow-[0_10px_30px_rgba(55,61,52,0.06)]">
                  <Link className="nav-pill" href="/">
                    Home
                  </Link>
                  <Link className="nav-pill" href="/dashboard">
                    Dashboard
                  </Link>
                </div>
              </nav>
            </header>
            {children}
          </div>
        </CooperProvider>
      </body>
    </html>
  );
}
