import type { SVGProps } from "react";

type AppLogoProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

/** Brand mark: open book under a crescent — Azadari Setup. */
export function AppLogo({ title = "Azadari Setup", className, ...props }: AppLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role="img"
      aria-hidden={title ? undefined : true}
      className={className}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <rect width="64" height="64" rx="14" fill="#0a0a0a" />
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="#f5f2eb"
        strokeOpacity="0.45"
        strokeWidth="2"
      />
      <path
        fill="#c4a35a"
        d="M34.2 10.5c-5.6 0-10.2 4.4-10.2 9.9 0 1.4.3 2.8.8 4 1.5-2.1 4-3.5 6.9-3.5 4.6 0 8.3 3.6 8.3 8.1 0 .5 0 1-.1 1.4 3.3-1.6 5.6-4.9 5.6-8.8 0-5.5-4.6-11.1-11.3-11.1z"
      />
      <path
        fill="#f5f2eb"
        d="M32 28.5c-1.2 3.8-1.2 8.2 0 12.5-3.4.9-7.2 1.2-10.8.2-2.2-.6-3.8-2.4-4.2-4.6-.6-3.2-.6-6.9 0-10.1.4-2.2 2-4 4.2-4.6 3.6-1 7.4-.7 10.8.2z"
      />
      <path
        fill="#f5f2eb"
        d="M32 28.5c1.2 3.8 1.2 8.2 0 12.5 3.4.9 7.2 1.2 10.8.2 2.2-.6 3.8-2.4 4.2-4.6.6-3.2.6-6.9 0-10.1-.4-2.2-2-4-4.2-4.6-3.6-1-7.4-.7-10.8.2z"
      />
      <path d="M32 28.2v13.1" stroke="#0a0a0a" strokeWidth="1.4" strokeLinecap="round" />
      <g stroke="#0a0a0a" strokeOpacity="0.75" strokeWidth="1.3" strokeLinecap="round">
        <path d="M22.5 33.2h7.2" />
        <path d="M22.5 36.2h7.2" />
        <path d="M24.2 39.2h5.5" />
        <path d="M34.3 33.2h7.2" />
        <path d="M34.3 36.2h7.2" />
        <path d="M34.3 39.2h5.5" />
      </g>
    </svg>
  );
}
