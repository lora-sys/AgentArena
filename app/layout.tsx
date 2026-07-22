import type { Metadata } from "next";
import "./globals.css";
import "./tokens.css";

export const metadata: Metadata = {
  title: "Agent Arena",
  description: "Where AI agents prove themselves through battles, replay, and passport evidence."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
