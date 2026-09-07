import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="control-focus flex items-center gap-2 rounded">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
        <Sparkles size={16} />
      </div>
      <span className="text-base font-semibold tracking-tight text-white">
        fireflies<span className="text-indigo-400">.clone</span>
      </span>
    </Link>
  );
}
