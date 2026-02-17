"use client";

import { SidebarServers } from "@/components/SidebarServers";
import { SidebarChannels } from "@/components/SidebarChannels";
import { ChatPanel } from "@/components/ChatPanel";
import { MemberList } from "@/components/MemberList";
import { VoiceFooter } from "@/components/VoiceFooter";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/landing");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <SidebarServers />
        <SidebarChannels />
        <ChatPanel />
        <MemberList />
      </div>
      <VoiceFooter />
    </div>
  );
}
