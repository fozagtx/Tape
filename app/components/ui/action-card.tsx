"use client";

import type { CardProps } from "@heroui/react";
import React from "react";
import { Card, CardBody, cn } from "@heroui/react";
import { Icon } from "@iconify/react";

export type ActionCardProps = CardProps & {
  icon: string;
  title: string;
  description: string;
  color?: "primary" | "warning" | "danger" | "default";
};

/** design-promax action-card */
const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  (
    { color = "default", title, icon, description, className, ...props },
    ref
  ) => {
    const colors = React.useMemo(() => {
      switch (color) {
        case "primary":
          return {
            card: "border-default-200 dark:border-default-100",
            iconWrapper: "bg-primary/10 border-primary/20",
            icon: "text-primary",
          };
        case "warning":
          return {
            card: "border-default-200 dark:border-default-100",
            iconWrapper: "bg-warning/10 border-warning/20",
            icon: "text-warning",
          };
        case "danger":
          return {
            card: "border-default-200 dark:border-default-100",
            iconWrapper: "bg-danger/10 border-danger/20",
            icon: "text-danger",
          };
        default:
          return {
            card: "border-default-200 dark:border-default-100",
            iconWrapper: "bg-default-100 border-default-200",
            icon: "text-default-500",
          };
      }
    }, [color]);

    return (
      <Card
        ref={ref}
        className={cn("border-small h-full", colors.card, className)}
        shadow="none"
        {...props}
      >
        <CardBody className="flex h-full flex-row items-start gap-3 p-4">
          <div
            className={cn(
              "flex shrink-0 items-center rounded-medium border p-2",
              colors.iconWrapper
            )}
          >
            <Icon className={colors.icon} icon={icon} width={24} aria-hidden />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-medium font-medium text-default-700">{title}</p>
            <p className="text-small leading-relaxed text-default-400">
              {description}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }
);

ActionCard.displayName = "ActionCard";

export default ActionCard;
