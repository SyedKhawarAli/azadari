import Image from "next/image";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

type AppLogoProps = {
  title?: string;
  className?: string;
};

/** Brand mark: stylized Arabic Ain (ع) — Azadari. */
export function AppLogo({ title = "Azadari", className }: AppLogoProps) {
  return (
    <Image
      src={logo}
      alt={title}
      width={128}
      height={128}
      priority
      className={cn("rounded-lg", className)}
    />
  );
}
