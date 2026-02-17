import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WebChat - Self-Hosted Gaming Chat Platform",
  description: "Real-time messaging, voice, and presence for your gaming community – fully under your control.",
  keywords: "self-hosted chat, Discord alternative, gaming chat, open source chat, WebSocket chat, Rust chat server",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-background text-foreground antialiased")}>
        {children}
      </body>
    </html>
  );
}
