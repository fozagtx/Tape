"use client";

import type { RadioGroupProps, RadioProps } from "@heroui/react";
import React from "react";
import {
  RadioGroup,
  VisuallyHidden,
  useRadio,
  useRadioGroupContext,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";

/** design-promax ThemeRadioItem */
const ThemeRadioItem = ({
  icon,
  ...props
}: RadioProps & { icon: string }) => {
  const {
    Component,
    isSelected: isSelfSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useRadio(props);

  const groupContext = useRadioGroupContext();

  const isSelected =
    isSelfSelected ||
    Number(groupContext.groupState.selectedValue) >= Number(props.value);

  const wrapperProps = getWrapperProps();

  return (
    <Component {...getBaseProps()}>
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...wrapperProps}
        className={cn(
          wrapperProps?.["className"],
          "pointer-events-none flex h-8 w-8 items-center justify-center rounded-full border border-default-200 ring-0 transition-transform group-data-[pressed=true]:scale-90",
          {
            "bg-default-200 dark:bg-default-100": isSelected,
          }
        )}
      >
        <Icon className="text-default-500" icon={icon} width={18} />
      </div>
    </Component>
  );
};

/**
 * design-promax ThemeSwitch: dark / light / system
 * Wired to next-themes end-to-end.
 */
const ThemeSwitch = React.forwardRef<
  HTMLDivElement,
  Omit<RadioGroupProps, "children" | "value" | "onValueChange">
>(({ classNames = {}, className, ...props }, ref) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn("flex h-8 w-[6rem] items-center gap-0", className)}
        aria-hidden
      />
    );
  }

  return (
    <RadioGroup
      ref={ref}
      aria-label="Select a theme"
      orientation="horizontal"
      value={theme ?? "system"}
      onValueChange={(value) => setTheme(value)}
      className={className}
      classNames={{
        ...classNames,
        wrapper: cn("gap-0 items-center", classNames?.wrapper),
      }}
      {...props}
    >
      <ThemeRadioItem icon="solar:moon-linear" value="dark" />
      <ThemeRadioItem icon="solar:sun-2-linear" value="light" />
      <ThemeRadioItem icon="solar:monitor-linear" value="system" />
    </RadioGroup>
  );
});

ThemeSwitch.displayName = "ThemeSwitch";

export default ThemeSwitch;
