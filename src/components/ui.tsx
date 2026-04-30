import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "champion" | "dark";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-pitch text-white border border-emerald-900/10 shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_1px_2px_0_rgba(13,122,82,0.25)] hover:bg-pitch-deep focus-visible:ring-emerald-200 disabled:bg-emerald-300",
  secondary:
    "bg-white text-slate-800 border border-slate-200 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-200",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-200",
  danger:
    "bg-rose-600 text-white border border-rose-900/10 shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_1px_2px_0_rgba(225,29,72,0.25)] hover:bg-rose-700 focus-visible:ring-rose-200 disabled:opacity-60",
  success:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 focus-visible:ring-emerald-200",
  champion:
    "bg-gold text-night border border-amber-900/15 shadow-[0_1px_0_0_rgba(255,255,255,0.35)_inset,0_1px_2px_0_rgba(212,164,55,0.35)] hover:bg-amber-500 focus-visible:ring-amber-200",
  dark:
    "bg-night text-white border border-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_1px_2px_0_rgba(0,0,0,0.25)] hover:bg-slate-800 focus-visible:ring-slate-400",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-7 px-2.5 text-[12px] gap-1.5",
  md: "h-9 px-3.5 text-[13px] gap-1.5",
  lg: "h-11 px-5 text-sm gap-2",
};

export const buttonClass = ({
  variant = "primary",
  size = "md",
  full = false,
  uppercase = false,
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  uppercase?: boolean;
  className?: string;
} = {}) =>
  `inline-flex items-center justify-center rounded-md font-medium transition-[background,border-color,box-shadow,color] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 ${
    uppercase ? "uppercase tracking-[0.06em] font-semibold" : ""
  } ${variantClasses[variant]} ${sizeClasses[size]} ${full ? "w-full" : ""} ${className}`;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  uppercase?: boolean;
};

export function Button({ variant, size, full, uppercase, className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClass({ variant, size, full, uppercase, className })} {...rest}>
      {children}
    </button>
  );
}

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  full?: boolean;
  uppercase?: boolean;
  className?: string;
  children: ReactNode;
};

export function LinkButton({ href, variant, size, full, uppercase, className, children }: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClass({ variant, size, full, uppercase, className })}>
      {children}
    </Link>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: ReactNode;
};

export function Input({ leftIcon, className = "", ...rest }: InputProps) {
  return (
    <div className="relative">
      {leftIcon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {leftIcon}
        </span>
      ) : null}
      <input
        className={`h-10 w-full rounded-md border border-slate-200 bg-white text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
          leftIcon ? "pl-10" : "pl-3"
        } pr-3 ${className}`}
        {...rest}
      />
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border border-slate-200/70 bg-white ${className}`}>{children}</div>
  );
}

type ChipTone = "neutral" | "emerald" | "amber" | "blue" | "violet" | "sky";
const chipTones: Record<ChipTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  amber: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
  sky: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
};

export function Chip({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: ChipTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${chipTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  percent,
  tone = "emerald",
  height = "sm",
}: {
  percent: number;
  tone?: "emerald" | "amber" | "violet" | "sky";
  height?: "xs" | "sm" | "md";
}) {
  const trackTone = {
    emerald: "bg-emerald-100",
    amber: "bg-amber-100",
    violet: "bg-violet-100",
    sky: "bg-sky-100",
  }[tone];
  const fillTone = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
    sky: "bg-sky-500",
  }[tone];
  const heightClass = { xs: "h-1", sm: "h-1.5", md: "h-2" }[height];

  return (
    <div className={`w-full overflow-hidden rounded-full ${trackTone} ${heightClass}`}>
      <div
        className={`h-full rounded-full ${fillTone} transition-[width] duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
