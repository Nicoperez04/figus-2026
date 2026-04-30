import { iso2FromCountryCode } from "@/lib/country-flags";

type FlagSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<FlagSize, { className: string; width: number; cdn: number }> = {
  xs: { className: "h-3 w-4", width: 24, cdn: 40 },
  sm: { className: "h-4 w-6", width: 32, cdn: 40 },
  md: { className: "h-5 w-7", width: 40, cdn: 80 },
  lg: { className: "h-7 w-10", width: 64, cdn: 80 },
  xl: { className: "h-12 w-16", width: 96, cdn: 160 },
};

type Props = {
  countryCode: string | null | undefined;
  size?: FlagSize;
  rounded?: boolean;
  className?: string;
};

export function Flag({ countryCode, size = "md", rounded = true, className = "" }: Props) {
  const iso2 = iso2FromCountryCode(countryCode);
  const { className: sizeClass, cdn } = sizeMap[size];
  const radius = rounded ? "rounded-md" : "rounded-none";
  const baseClass = `inline-block shrink-0 object-cover ring-1 ring-black/5 ${sizeClass} ${radius} ${className}`;

  if (!iso2) {
    return (
      <span
        aria-hidden
        className={`inline-flex items-center justify-center bg-slate-100 text-[9px] font-semibold text-slate-500 ${sizeClass} ${radius} ${className}`}
      >
        {(countryCode ?? "").slice(0, 2)}
      </span>
    );
  }

  const slug = iso2.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w${cdn}/${slug}.png`}
      srcSet={`https://flagcdn.com/w${cdn}/${slug}.png 1x, https://flagcdn.com/w${cdn * 2}/${slug}.png 2x`}
      alt={`Bandera ${iso2}`}
      loading="lazy"
      decoding="async"
      className={baseClass}
    />
  );
}
