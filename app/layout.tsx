import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Closer EOD Report",
  description: "End of day report for closers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
