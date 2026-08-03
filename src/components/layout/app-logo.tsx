import Image from "next/image";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  title?: string;
  className?: string;
};

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

/** Brand mark: stylized Arabic Ain (ع) — Azadari. */
export function AppLogo({ title = "Azadari", className }: AppLogoProps) {
  return (
    <Image
      src={`${basePath}/icons/logo.png`}
      alt={title}
      width={128}
      height={128}
      priority
      unoptimized
      className={cn("rounded-lg", className)}
    />
  );
}
