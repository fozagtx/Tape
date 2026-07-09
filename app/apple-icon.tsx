import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — T monogram */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0d10",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 100,
            fontWeight: 700,
            color: "#f4f5f7",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            lineHeight: 1,
          }}
        >
          T
        </div>
      </div>
    ),
    { ...size }
  );
}
