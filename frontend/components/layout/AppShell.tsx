import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50/50 via-white to-orange-50/40">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
