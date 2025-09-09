import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Windborne ASOS Explorer",
  description: "Interactive map and historical weather from ASOS stations",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 text-slate-900`}
      >
        <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            {/* Internal navigation uses Link */}
            <Link href="/" className="font-semibold">
              Windborne ASOS Explorer
            </Link>

            <nav className="text-sm space-x-4">
              {/* External links: target + rel to satisfy ESLint/security */}
              <a
                className="hover:underline"
                href="https://sfc.windbornesystems.com/stations"
                target="_blank"
                rel="noreferrer"
              >
                API: Stations
              </a>
              <a
                className="hover:underline"
                href="https://sfc.windbornesystems.com/historical_weather?station=KJFK"
                target="_blank"
                rel="noreferrer"
              >
                API: Sample Historical
              </a>

              <Link className="hover:underline" href="/">
                Home
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        <footer className="border-t mt-8">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
            Built with Next.js + Leaflet + Recharts. Data © ASOS via Windborne.
          </div>
        </footer>
      </body>
    </html>
  );
}
