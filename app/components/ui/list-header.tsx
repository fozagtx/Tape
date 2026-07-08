"use client";

import React from "react";
import { cn } from "@heroui/react";

export type ListHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  className?: string;
};

const ListHeader = React.forwardRef<HTMLDivElement, ListHeaderProps>(
  ({ columns, className, style, ...props }, ref) => (
    <div
      ref={ref}
      style={style}
      className={cn(
        "grid gap-2 px-4 py-2 text-tiny font-medium uppercase tracking-wide text-default-400",
        className
      )}
      {...props}
    >
      {columns.map((col) => (
        <span
          key={col.key}
          className={cn(col.align === "right" && "text-right")}
        >
          {col.label}
        </span>
      ))}
    </div>
  )
);

ListHeader.displayName = "ListHeader";

export default ListHeader;
