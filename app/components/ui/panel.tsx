"use client";

import React from "react";
import { Card, cn } from "@heroui/react";

export type PanelProps = React.ComponentProps<typeof Card> & {
  title?: React.ReactNode;
  endContent?: React.ReactNode;
  bodyClassName?: string;
  /** No body padding — for dense lists / order book */
  flush?: boolean;
};

/**
 * Design-promax panel shell.
 * Measures: header px-4 py-3 · body p-4 · border-default-100 · rounded via Card
 */
const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      title,
      endContent,
      children,
      className,
      bodyClassName,
      flush = false,
      ...props
    },
    ref
  ) => (
    <Card
      ref={ref}
      className={cn(
        "h-full border border-transparent dark:border-default-100",
        className
      )}
      shadow="none"
      {...props}
    >
      {(title || endContent) && (
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-default-100 px-4 py-3">
          {typeof title === "string" ? (
            <h2 className="text-tiny font-semibold uppercase tracking-wide text-default-700">
              {title}
            </h2>
          ) : (
            title
          )}
          {endContent ? (
            <div className="flex shrink-0 items-center gap-2">{endContent}</div>
          ) : null}
        </div>
      )}
      <div className={cn(flush ? "p-0" : "p-4", bodyClassName)}>{children}</div>
    </Card>
  )
);

Panel.displayName = "Panel";

export default Panel;
