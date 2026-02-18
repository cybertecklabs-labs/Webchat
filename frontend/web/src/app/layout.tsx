import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "WebChat - Self-Hosted Gaming Chat Platform",
  description: "Real-time messaging, voice, and presence for your gaming community – fully under your control.",
  keywords: "self-hosted chat, Discord alternative, gaming chat, open source chat, WebSocket chat, Rust chat server",
};

import { ToastProvider } from "@/components/ToastProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn("bg-background text-foreground antialiased font-sans")}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
