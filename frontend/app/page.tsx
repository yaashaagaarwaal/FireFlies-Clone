import {
  ArrowRight,
  Bot,
  Calendar,
  Globe2,
  Languages,
  Layers,
  Mic,
  MonitorSmartphone,
  Phone,
  Search,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/marketing/Logo";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Reveal } from "@/components/marketing/Reveal";

/** Very soft radial glow used as a background accent — same treatment on
 * dark and light sections so the page reads as one continuous surface
 * instead of alternating flat blocks. */
function SectionGlow({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const color = variant === "dark" ? "rgba(99,60,222,0.35)" : "rgba(99,60,222,0.07)";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${color}, transparent)`,
      }}
    />
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0b0518] pb-32 pt-24 text-center sm:pt-28">
      <SectionGlow />
      <div className="relative mx-auto max-w-4xl px-6">
        <Reveal>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl xl:text-[80px]">
            The AI Assistant For Your Meetings
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-gray-400">
            Record, transcribe, summarize, and search every conversation your team has — automatically.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="control-focus inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl active:translate-y-0"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
            <a
              href="#contact"
              className="control-focus rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10"
            >
              Request Demo
            </a>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-11 inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs text-gray-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-semibold text-white">4.8 / 5</span>
              <span className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
                ))}
              </span>
            </span>
            <span className="text-gray-600">|</span>
            <span>Built as a full-stack demo project</span>
          </div>
        </Reveal>
      </div>

      <Reveal delay={400} className="relative mx-auto mt-20 max-w-5xl px-6">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white text-left shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] dark:bg-gray-900">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3 dark:border-gray-800">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Kickoff Call — Product Sync</span>
            </div>
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-[1.4fr_1fr]">
              <div className="border-b border-gray-100 p-6 dark:border-gray-800 sm:border-b-0 sm:border-r">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Kickoff Call — Product Sync</h3>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Sarah Watts, +3 · Today · 11:30 AM</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  The kickoff call served as an introduction between teams. They aim to streamline
                  onboarding, automate follow-ups, and improve meeting workflows.
                </p>
              </div>
              <div className="flex flex-col gap-3 p-6">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Transcript</p>
                <div className="flex gap-2">
                  <span className="h-6 w-6 shrink-0 rounded-full bg-indigo-100 text-center text-[11px] font-semibold leading-6 text-indigo-600">
                    S
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    We&apos;re aiming for a seamless onboarding experience, especially around integrations.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="h-6 w-6 shrink-0 rounded-full bg-amber-100 text-center text-[11px] font-semibold leading-6 text-amber-600">
                    J
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Our team will work closely with your tech lead on that.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden={false}
            className="animate-float-slow absolute -right-4 -top-6 hidden items-center gap-2.5 rounded-xl border border-white/10 bg-[#150c2e]/95 px-4 py-3 text-xs font-medium text-white shadow-[0_20px_50px_-15px_rgba(99,60,222,0.65)] backdrop-blur sm:flex"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500">
              <Sparkles size={12} />
            </span>
            Summary ready in seconds
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const LOGOS = ["Northwind", "Globex", "Initech", "Hooli", "Umbrella"];

function LogosRow() {
  return (
    <div className="border-b border-white/10 bg-[#0b0518] py-12">
      <Reveal>
        <p className="text-center text-xs font-medium uppercase tracking-widest text-gray-500">
          Used across teams everywhere
        </p>
        <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6">
          {LOGOS.map((name) => (
            <span
              key={name}
              className="text-lg font-semibold tracking-tight text-gray-500 opacity-80 transition-opacity duration-200 hover:opacity-100 hover:text-gray-300"
            >
              {name}
            </span>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

const TRANSCRIPTION_FEATURES = [
  { icon: Mic, title: "High accuracy", body: "Clean, readable transcripts generated from every recording." },
  { icon: Languages, title: "Multi-language", body: "Transcribe meetings across a wide range of languages." },
  { icon: Users, title: "Speaker recognition", body: "Each turn is attributed to the right participant automatically." },
  { icon: Globe2, title: "Any source", body: "Upload a file or paste a transcript — both are parsed the same way." },
];

function TranscriptionSection() {
  return (
    <section id="transcription" className="relative overflow-hidden bg-white py-28 dark:bg-gray-950 lg:py-32">
      <SectionGlow variant="light" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <Reveal>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              High quality meeting <span className="text-indigo-600 dark:text-indigo-400">transcription</span>
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Every meeting is broken into searchable, speaker-labeled segments the moment it&apos;s added.
            </p>
          </Reveal>
          <dl className="mt-12 grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2">
            {TRANSCRIPTION_FEATURES.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 80}>
                <dt className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  <Icon size={16} className="text-indigo-500 dark:text-indigo-400" />
                  {title}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{body}</dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <Reveal delay={150}>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-2 shadow-[0_1px_2px_rgba(15,10,40,0.04),0_24px_48px_-28px_rgba(15,10,40,0.25)] transition-transform duration-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900">
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
              <p className="mb-4 text-xs font-medium text-gray-400 dark:text-gray-500">Transcript</p>
              <div className="flex flex-col gap-4">
                {[
                  { name: "Cate", color: "bg-rose-100 text-rose-600", time: "00:53", text: "There's some concern about onboarding — clients feel it's not intuitive enough." },
                  { name: "Rohan", color: "bg-amber-100 text-amber-600", time: "01:24", text: "Noted, we'll pass that to product. How are we doing on capacity?" },
                  { name: "Tom", color: "bg-indigo-100 text-indigo-600", time: "01:47", text: "We're on track — final review is scheduled for Thursday." },
                ].map((row) => (
                  <div key={row.time} className="flex gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${row.color}`}>
                      {row.name[0]}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {row.name} <span className="ml-1 font-normal text-gray-400 dark:text-gray-500">{row.time}</span>
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{row.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const SUMMARY_TABS = ["Overview", "Bullet Points", "Action Items", "Custom Notes"];

function SummariesSection() {
  return (
    <section id="summaries" className="relative overflow-hidden bg-[#0b0518] py-28 text-white lg:py-32">
      <SectionGlow />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Reveal>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Comprehensive <span className="text-indigo-400">AI summaries</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-400">
                Get an overview, key notes, and action items instantly after every meeting — no manual
                note-taking required.
              </p>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <Link
              href="/dashboard"
              className="control-focus inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md active:translate-y-0"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="mt-12 flex flex-wrap gap-2">
            {SUMMARY_TABS.map((tab, i) => (
              <span
                key={tab}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  i === 2 ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-300"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white p-7 text-gray-900 shadow-[0_30px_70px_-25px_rgba(99,60,222,0.55)] transition-transform duration-300 hover:-translate-y-1 dark:bg-gray-900 dark:text-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Action Items</h3>
            <div className="mt-5 grid gap-7 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Chris</p>
                <ul className="mt-2 space-y-2.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  <li>Prepare technical requirements for integrations. <span className="text-indigo-500 dark:text-indigo-400">01:47</span></li>
                  <li>Share final rollout list by Thursday. <span className="text-indigo-500 dark:text-indigo-400">24:42</span></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Sarah</p>
                <ul className="mt-2 space-y-2.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  <li>Schedule training sessions with weekly feedback calls. <span className="text-indigo-500 dark:text-indigo-400">02:19</span></li>
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const CAPTURE_METHODS = [
  { icon: MonitorSmartphone, title: "Web dashboard", body: "Create and browse meetings from any browser." },
  { icon: Video, title: "Upload a recording", body: "Attach transcript text or files straight from the create form." },
  { icon: Phone, title: "Structured import", body: "Paste WebVTT or JSON transcripts — parsed automatically." },
];

function CaptureSection() {
  return (
    <section id="capture" className="relative overflow-hidden bg-gray-50 py-28 dark:bg-gray-950 lg:py-32">
      <SectionGlow variant="light" />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <Reveal>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
            Capture meetings <span className="text-indigo-600 dark:text-indigo-400">anywhere</span>
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-500 dark:text-gray-400">
            Bring a transcript in however it&apos;s easiest, and everything else — summary, topics, action
            items — is generated for you.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {CAPTURE_METHODS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="h-full rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-[0_1px_2px_rgba(15,10,40,0.04),0_20px_40px_-28px_rgba(15,10,40,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(15,10,40,0.06),0_28px_48px_-24px_rgba(15,10,40,0.3)] dark:border-gray-800 dark:bg-gray-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SearchSection() {
  return (
    <section id="search" className="relative overflow-hidden bg-white py-28 dark:bg-gray-950 lg:py-32">
      <SectionGlow variant="light" />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <Reveal>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
            Remember every conversation with <span className="text-indigo-600 dark:text-indigo-400">search</span>
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-500 dark:text-gray-400">
            Jump straight to the moment that matters — search finds it and scrolls the transcript into view.
          </p>
        </Reveal>

        <Reveal delay={160}>
          <div className="mx-auto mt-16 max-w-md rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left shadow-[0_1px_2px_rgba(15,10,40,0.04),0_24px_48px_-28px_rgba(15,10,40,0.25)] transition-transform duration-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-950">
              <Search size={15} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-400 dark:text-gray-500">integrations</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border-l-2 border-amber-400 bg-amber-50/60 px-3 py-2 dark:bg-amber-500/10">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Sarah · 00:53</p>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  We&apos;re aiming for a seamless onboarding experience, especially around{" "}
                  <mark className="rounded bg-amber-200 px-0.5 dark:bg-amber-500/40">integrations</mark>.
                </p>
              </div>
              <div className="rounded-lg px-3 py-2">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Chris · 01:47</p>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  I&apos;ll prepare the technical requirements for setting up{" "}
                  <mark className="rounded bg-amber-100 px-0.5 dark:bg-amber-500/25">integrations</mark>.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#0b0518] py-28 text-center lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_100%,rgba(99,60,222,0.3),transparent)]"
      />
      <Reveal className="relative mx-auto max-w-2xl px-6">
        <Layers size={28} className="mx-auto text-indigo-400" />
        <h2 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Try it on your own meetings
        </h2>
        <p className="mt-4 text-base leading-relaxed text-gray-400">
          Jump into the dashboard, create a meeting, and see the whole workflow end to end.
        </p>
        <Link
          href="/dashboard"
          className="control-focus mt-9 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl active:translate-y-0"
        >
          Get Started
          <ArrowRight size={16} />
        </Link>
      </Reveal>
    </section>
  );
}

function MarketingFooter() {
  return (
    <footer id="contact" className="border-t border-white/10 bg-[#0b0518] py-16 text-gray-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            A full-stack meeting notes &amp; transcription demo — built with Next.js, FastAPI, and
            SQLAlchemy.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 text-sm sm:items-end">
          <a href="#transcription" className="control-focus rounded transition-colors duration-200 hover:text-white">
            Transcription
          </a>
          <a href="#summaries" className="control-focus rounded transition-colors duration-200 hover:text-white">
            AI Summaries
          </a>
          <Link href="/dashboard" className="control-focus rounded transition-colors duration-200 hover:text-white">
            Open App
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-11 flex max-w-6xl items-center justify-between border-t border-white/10 px-6 pt-6 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={12} />© {new Date().getFullYear()} Fireflies Clone
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Bot size={12} />
          Portfolio project, not affiliated with Fireflies.ai
        </span>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main>
        <Hero />
        <LogosRow />
        <TranscriptionSection />
        <SummariesSection />
        <CaptureSection />
        <SearchSection />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
