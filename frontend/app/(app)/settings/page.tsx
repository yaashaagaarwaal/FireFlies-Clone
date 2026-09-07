"use client";

import { Calendar, MessageSquare, Plug, Radio, User, Users, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Topbar } from "@/components/layout/Topbar";
import { PanelSection } from "@/components/meeting-detail/PanelSection";
import { useToast } from "@/components/ui/ToastProvider";

interface Integration {
  icon: LucideIcon;
  name: string;
  description: string;
}

const INTEGRATIONS: Integration[] = [
  { icon: Video, name: "Zoom", description: "Auto-join and record Zoom calls." },
  { icon: Video, name: "Google Meet", description: "Auto-join and record Google Meet calls." },
  { icon: Calendar, name: "Google Calendar", description: "Sync upcoming meetings automatically." },
  { icon: MessageSquare, name: "Slack", description: "Post summaries to a channel after each call." },
  { icon: Plug, name: "HubSpot (CRM)", description: "Log meeting notes against CRM contacts." },
];

export default function SettingsPage() {
  const { showToast } = useToast();
  const comingSoon = (feature: string) => showToast(`${feature} is coming soon`, "info");

  return (
    <>
      <Topbar title="Settings" />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          <PanelSection icon={User} title="Account">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#8B7355] text-base font-semibold text-white">
                Y
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">Yash Agarwal</p>
                <p className="truncate text-xs text-gray-500">yash21chess@gmail.com</p>
              </div>
              <span className="ml-auto shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Default user
              </span>
            </div>
            <p className="mt-3.5 text-xs leading-relaxed text-gray-500">
              This app runs as a single signed-in user, so there&apos;s no login screen. Real
              authentication (sign-up, sign-in, multiple accounts) is coming soon.
            </p>
          </PanelSection>

          <PanelSection icon={Radio} title="Live meeting recording">
            <p className="text-sm leading-relaxed text-gray-500">
              Inviting a bot to auto-join and record a live call, with real-time speech-to-text as it
              happens, is coming soon. For now, create a meeting by pasting or uploading a transcript —
              summaries, topics, and action items are still generated automatically.
            </p>
            <button
              type="button"
              onClick={() => comingSoon("Live meeting recording")}
              className="control-focus mt-3.5 flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <Radio size={13} />
              Join a live call
            </button>
          </PanelSection>

          <PanelSection icon={Plug} title="Integrations">
            <div className="flex flex-col divide-y divide-gray-100">
              {INTEGRATIONS.map(({ icon: Icon, name, description }) => (
                <div key={name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="truncate text-xs text-gray-500">{description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => comingSoon(`${name} integration`)}
                    className="control-focus shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection icon={Users} title="Team &amp; sharing">
            <p className="text-sm leading-relaxed text-gray-500">
              Inviting teammates to a shared workspace, and sharing individual meetings with people
              outside it, is coming soon. Each meeting page already has a Share button as a preview of
              where that will live.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                comingSoon("Team invites");
              }}
              className="mt-3.5 flex gap-2"
            >
              <input
                type="email"
                placeholder="teammate@company.com"
                className="field-focus flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="control-focus shrink-0 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Invite
              </button>
            </form>
          </PanelSection>
        </div>
      </main>
    </>
  );
}
