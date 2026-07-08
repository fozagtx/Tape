"use client";

import React from "react";
import { cn } from "@heroui/react";
import { Icon } from "@iconify/react";

export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon = "solar:inbox-linear",
      title,
      description,
      children,
      className,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4 py-10 text-center",
        className
      )}
      {...props}
    >
      <Icon
        icon={icon}
        width={28}
        className="text-default-400"
        aria-hidden
      />
      <p className="text-small font-medium text-default-600">{title}</p>
      {description ? (
        <p className="max-w-xs text-tiny leading-relaxed text-default-400">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  )
);

EmptyState.displayName = "EmptyState";

export default EmptyState;
