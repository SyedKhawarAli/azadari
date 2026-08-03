import Image from "next/image";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  title?: string;
  className?: string;
};

/** Brand mark: stylized Arabic Ain (ع) — Azadari Setup. */
export function AppLogo({ title = "Azadari Setup", className }: AppLogoProps) {
  return (
    <Image
      src="/icons/logo.png"
      alt={title}
      width={128}
      height={128}
      priority
      className={cn("rounded-lg", className)}
    />
  );
}
