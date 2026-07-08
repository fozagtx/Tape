"use client";

import React from "react";
import { cn } from "@heroui/react";

export type CellValueProps = React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  value?: React.ReactNode;
};

/** design-promax cell-value - label left, value right */
const CellValue = React.forwardRef<HTMLDivElement, CellValueProps>(
  ({ label, value, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex min-h-9 items-center justify-between gap-3 py-2",
        className
      )}
      {...props}
    >
      <div className="shrink-0 text-small text-default-500">{label}</div>
      <div className="min-w-0 truncate text-right text-small font-medium text-default-700">
        {value ?? children}
      </div>
    </div>
  )
);

CellValue.displayName = "CellValue";

export default CellValue;
