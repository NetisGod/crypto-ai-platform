import { SiBinance, SiCoinbase, SiOkx } from "react-icons/si";

type IconProps = { className?: string };

/* ─── Real brand icons (Simple Icons via react-icons) ───────── */

export function BinanceLogo({ className }: IconProps) {
  return <SiBinance className={className} aria-label="Binance" />;
}

export function CoinbaseLogo({ className }: IconProps) {
  return <SiCoinbase className={className} aria-label="Coinbase" />;
}

export function OkxLogo({ className }: IconProps) {
  return <SiOkx className={className} aria-label="OKX" />;
}

/* ─── Custom SVGs for brands not in Simple Icons ────────────── */

export function KrakenLogo({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-label="Kraken"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12v9a1 1 0 0 0 2 0v-3a1 1 0 0 1 2 0v3a1 1 0 0 0 2 0v-5a1 1 0 0 1 2 0v5a1 1 0 0 0 2 0v-7a1 1 0 0 1 2 0v7a1 1 0 0 0 2 0v-5a1 1 0 0 1 2 0v5a1 1 0 0 0 2 0v-3a1 1 0 0 1 2 0v3a1 1 0 0 0 2 0v-9c0-5.52-4.48-10-10-10Zm-3 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
    </svg>
  );
}

export function BybitLogo({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-label="Bybit"
    >
      <path d="M16.8 14.6V5.5h2v9.1h-2Zm-13.8 4V8.6h4.7c1.7 0 2.7.9 2.7 2.4 0 1-.5 1.6-1 1.9.6.3 1.2 1 1.2 2.1 0 1.6-1.1 2.6-2.9 2.6H3Zm1.9-5.9h2.6c.7 0 1.1-.4 1.1-1s-.4-1-1.1-1H4.9v2Zm0 4.1h2.7c.8 0 1.2-.4 1.2-1.1 0-.6-.4-1.1-1.2-1.1H4.9v2.2ZM12.6 18.6V12L9.4 8.6h2.4l2 2.4 2-2.4H18l-3.2 3.4v6.6h-2.2Zm9.4 0V10.4h-2.7V8.6h7.3v1.8h-2.7v8.2H22Z" />
    </svg>
  );
}

export function GeminiLogo({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-label="Gemini"
    >
      <path d="M12 2 2 12l10 10 10-10L12 2Zm0 3.4L18.6 12 12 18.6 5.4 12 12 5.4Z" />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Unified list with brand colors ────────────────────────── */

export const exchanges = [
  { name: "Binance", Icon: BinanceLogo, color: "text-[#F0B90B]" },
  { name: "Coinbase", Icon: CoinbaseLogo, color: "text-[#0052FF]" },
  { name: "Kraken", Icon: KrakenLogo, color: "text-[#5841D8]" },
  { name: "Bybit", Icon: BybitLogo, color: "text-[#F7A600]" },
  { name: "OKX", Icon: OkxLogo, color: "text-foreground" },
  { name: "Gemini", Icon: GeminiLogo, color: "text-[#00DCFA]" },
] as const;
