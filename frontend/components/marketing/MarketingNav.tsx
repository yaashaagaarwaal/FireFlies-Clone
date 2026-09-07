"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Transcription", href: "#transcription" },
  { label: "AI Summaries", href: "#summaries" },
  { label: "Capture", href: "#capture" },
  { label: "Search", href: "#search" },
];

export function MarketingNav() {
  // Blends into the hero at the very top of the page, then gains a visible
  // edge and firmer background once the user actually scrolls — rather than
  // a fixed blur/border that looks the same everywhere.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${
        scrolled ? "border-b border-white/10 bg-[#0b0518]/90" : "border-b border-transparent bg-[#0b0518]/30"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-4">
        <Logo />
        <div className="hidden flex-1 items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link control-focus rounded text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle variant="on-dark" />
          <a
            href="#contact"
            className="control-focus hidden rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10 sm:inline-block"
          >
            Request Demo
          </a>
          <Link
            href="/dashboard"
            className="control-focus rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md active:translate-y-0"
          >
            Open App
          </Link>
        </div>
      </nav>
    </header>
  );
}
