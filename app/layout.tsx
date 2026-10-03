import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {AppShell} from "./components/AppShell/AppShell"; // Importing the new component

// Optimizing Fonts (Week 02)
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GridLog App",
  description: "Track power outages efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap all pages with the base shell structure */}
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}