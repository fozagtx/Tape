import { heroui } from "@heroui/react";

export default heroui({
  defaultTheme: "dark",
  themes: {
    light: {
      colors: {
        background: "#f6f7f9",
        foreground: "#0c0d10",
        content1: "#ffffff",
        content2: "#eef0f4",
        content3: "#e4e7ed",
        content4: "#d8dce5",
        primary: {
          DEFAULT: "#c9962a",
          foreground: "#0c0d10",
        },
        success: {
          DEFAULT: "#0f9f62",
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#e11d48",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#c9962a",
          foreground: "#0c0d10",
        },
        focus: "#c9962a",
      },
    },
    dark: {
      colors: {
        background: "#0c0d10",
        foreground: "#f4f5f7",
        content1: "#14161b",
        content2: "#1a1d24",
        content3: "#22262f",
        content4: "#2a2f3a",
        primary: {
          DEFAULT: "#e8b84a",
          foreground: "#0c0d10",
        },
        success: {
          DEFAULT: "#3dd68c",
          foreground: "#0c0d10",
        },
        danger: {
          DEFAULT: "#f0455a",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#e8b84a",
          foreground: "#0c0d10",
        },
        focus: "#e8b84a",
      },
    },
  },
});
