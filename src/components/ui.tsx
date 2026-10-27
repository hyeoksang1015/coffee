import type { Level, Tone } from "@/data/beans";

export const TONE: Record<Tone, string> = {
  white: "bg-surface-bright/95 text-navy-ink shadow-sm backdrop-blur",
  navy: "bg-navy-ink/90 text-on-primary",
  cobalt: "bg-cobalt-electric text-on-primary",
  amber: "bg-accent-amber text-on-primary",
  emerald: "bg-emerald-700 text-on-primary",
  secondary: "bg-secondary text-on-primary",
};

export function Badge({ tone, children, className = "" }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return <span className={`rounded-lg px-2 py-1 text-label-caps uppercase tracking-wider ${TONE[tone]} ${className}`}>{children}</span>;
}

/** 산미·단맛·바디 5칸 막대 */
export function Dots({ label, value }: { label: string; value: Level }) {
  return (
    <div className="flex flex-col">
      <span className="text-label-caps uppercase text-secondary">{label}</span>
      <div className="mt-0.5 flex items-center gap-1" role="img" aria-label={`${label} ${value} / 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= value ? "bg-cobalt-electric" : "bg-surface-variant"}`} />
        ))}
      </div>
    </div>
  );
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-label-caps uppercase tracking-wider text-cobalt-electric ${className}`}>{children}</span>;
}

export const btnPrimary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cobalt-electric px-6 text-body-lg font-semibold text-on-primary transition-colors hover:bg-primary";
export const btnSoft = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-surface-container-high px-6 text-body-lg font-semibold text-navy-ink transition-colors hover:bg-surface-dim";
export const field =
  "w-full rounded-lg border border-transparent bg-warm-canvas px-space-md text-base text-navy-ink outline-none transition-colors placeholder:text-secondary/70 focus:border-cobalt-electric focus:bg-canvas-card aria-[invalid=true]:border-error sm:text-body-md";
