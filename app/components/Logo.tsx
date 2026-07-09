"use client";

import React from "react";
import { cn } from "@heroui/react";

type LogoProps = {
  className?: string;
  /** Icon box size in px */
  size?: number;
  showWordmark?: boolean;
};

/**
 * Tape mark: square monogram with a bold T.
 * Uses currentColor for the plate so light/dark both work.
 */
const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ className, size = 32, showWordmark = false }, ref) => (
    <div
      ref={ref}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-[22%] bg-foreground text-background"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg
          width={Math.round(size * 0.55)}
          height={Math.round(size * 0.55)}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 5h16v3.2H13.7V19h-3.4V8.2H4V5z"
            fill="currentColor"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-small font-semibold tracking-tight text-foreground">
          Tape
        </span>
      )}
    </div>
  )
);

Logo.displayName = "Logo";

export default Logo;
