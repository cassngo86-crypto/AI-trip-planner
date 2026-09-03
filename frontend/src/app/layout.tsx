import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Open-Jaw Trip Planner",
  description: "Multi-city travel itinerary planner",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TripPlanner",
  },
};

// CRITICAL: Must be a default export returning a React Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}