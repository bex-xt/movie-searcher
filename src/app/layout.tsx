import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Netflix De-Syndrome",
  description: "Stop scrolling. Find the movie your mood actually wants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
