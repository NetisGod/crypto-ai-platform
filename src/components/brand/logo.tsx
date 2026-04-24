import Image from "next/image";
import { cn } from "@/lib/utils";

/** Intrinsic size after trimming transparent margins from the source asset. */
const LOGO_WIDTH = 467;
const LOGO_HEIGHT = 469;

type LogoProps = {
  /** Display height in CSS pixels; width follows aspect ratio. */
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
};

export function Logo({
  size = 41,
  className,
  priority = false,
  alt = "CoinTrace AI logo",
}: LogoProps) {
  return (
    <Image
      src="/landing/logo-coin-trace.png"
      alt={alt}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      sizes={`${Math.ceil((size * LOGO_WIDTH) / LOGO_HEIGHT)}px`}
      style={{ height: size, width: "auto" }}
      className={cn("object-contain bg-transparent", className)}
    />
  );
}
