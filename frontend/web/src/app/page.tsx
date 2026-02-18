"use client";

import { SidebarServers } from "@/components/SidebarServers";
import { SidebarChannels } from "@/components/SidebarChannels";
import { ChatPanel } from "@/components/ChatPanel";
import { MemberList } from "@/components/MemberList";
import { VoiceFooter } from "@/components/VoiceFooter";
import { useAuthStore } from "@/store/authStore";
import { useServerStore } from "@/store/serverStore";
import { useChannelStore } from "@/store/channelStore";
import { useMessageStore } from "@/store/messageStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import websocket from "@/services/websocket";

export default function ChatPage() {
  const { user, token } = useAuthStore();
  const { fetchServers, currentServer } = useServerStore();
  const { fetchChannels, currentChannel } = useChannelStore();
  const { addMessage, fetchMessages } = useMessageStore();
  const [connected, setConnected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/landing");
    } else {
      websocket.connect(token);
      setConnected(true);

      websocket.onMessage((msg) => {
        if (msg.type === "message") {
          addMessage(msg.data);
        }
      });

      return () => {
        websocket.disconnect();
      };
    }
  }, [token, router, addMessage]);

  useEffect(() => {
    if (user) {
      fetchServers();
    }
  }, [user, fetchServers]);

  useEffect(() => {
    if (currentServer) {
      fetchChannels(currentServer.id);
    }
  }, [currentServer, fetchChannels]);

  useEffect(() => {
    if (currentChannel && connected) {
      websocket.joinChannel(currentChannel.id);
      fetchMessages(currentChannel.id);
      return () => {
        websocket.leaveChannel(currentChannel.id);
      };
    }
  }, [currentChannel, connected, fetchMessages]);

  if (!token) {
    return null;
  }

  return (
    <div className="flex h-screen bg-black text-white">
      <SidebarServers />
      <div className="flex flex-1">
        <SidebarChannels />
        <div className="flex flex-col flex-1">
          <ChatPanel />
          <VoiceFooter />
        </div>
        <MemberList />
      </div>
    </div>
  );
}
