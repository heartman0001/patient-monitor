import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Patient Monitor — Real-Time Form & Staff Dashboard",
  description:
    "A real-time patient input form and staff monitoring system built with Next.js, Socket.io, and TypeScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-dvh flex flex-col bg-[#FAFAFA] text-[#0A0A0A] antialiased">
        <nav className="sticky top-0 z-50 bg-[#FAFAFA]/90 backdrop-blur border-b border-[#E5E5E5]">
          <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
            <Link href="/" className="text-[13px] font-medium text-[#0A0A0A] tracking-tight hover:text-[#71717A] transition-colors duration-150">
              Patient Monitor
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/patient" className="px-3 py-1.5 text-[13px] font-medium text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors duration-150">Patient</Link>
              <Link href="/staff" className="px-3 py-1.5 text-[13px] font-medium text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors duration-150">Staff</Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
