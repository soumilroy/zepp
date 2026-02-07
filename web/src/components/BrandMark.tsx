import { SnailIcon, type LucideIcon } from "lucide-react";

type BrandMarkProps = {
  showTagline?: boolean;
  className?: string;
  Icon?: LucideIcon;
};

export default function BrandMark({
  showTagline = true,
  className,
  Icon = SnailIcon,
}: BrandMarkProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-xs font-light tracking-[0.25em] text-slate-700 uppercase dark:text-slate-200">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span>Zepp.ai</span>
      </div>
      {showTagline ? (
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
          AI Powered resume builder
        </p>
      ) : null}
    </div>
  );
}
