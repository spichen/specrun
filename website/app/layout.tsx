import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Specrun - Build Agentic AI Workflows from the CLI",
  description:
    "A lightweight CLI framework for building and running agentic AI workflows using the Open Agent Specification. Define in YAML, wire tools in any language, run from one command.",
  keywords: [
    "specrun",
    "ai agents",
    "agentic workflows",
    "cli",
    "llm",
    "open agent specification",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
