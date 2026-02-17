import { create } from "zustand";
import { api } from "@/lib/api";

interface Channel {
    id: string;
    server_id: string;
    name: string;
    channel_type: string;
    topic?: string;
    created_at: string;
}

interface Message {
    id: string;
    channel_id: string;
    user_id: string;
    content: string;
    attachments: string[];
    created_at: string;
}

interface ChannelState {
    channels: Channel[];
    currentChannel: Channel | null;
    messages: Message[];
    loading: boolean;
    fetchChannels: (serverId: string) => Promise<void>;
    setCurrentChannel: (channel: Channel) => void;
    fetchMessages: (channelId: string) => Promise<void>;
    sendMessage: (channelId: string, content: string) => Promise<void>;
    addMessage: (message: Message) => void;
}

export const useChannelStore = create<ChannelState>((set, get) => ({
    channels: [],
    currentChannel: null,
    messages: [],
    loading: false,

    fetchChannels: async (serverId: string) => {
        set({ loading: true });
        try {
            const data = await api(`/servers/${serverId}/channels`);
            set({ channels: data, loading: false });
        } catch (error) {
            console.error("Failed to fetch channels:", error);
            set({ loading: false });
        }
    },

    setCurrentChannel: (channel) => {
        set({ currentChannel: channel, messages: [] });
        if (channel) {
            get().fetchMessages(channel.id);
        }
    },

    fetchMessages: async (channelId: string) => {
        try {
            const data = await api(`/channels/${channelId}/messages?limit=50`);
            set({ messages: data.reverse() }); // Reverse to show oldest first
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    },

    sendMessage: async (channelId: string, content: string) => {
        try {
            const message = await api(`/channels/${channelId}/messages`, {
                method: "POST",
                body: JSON.stringify({ content, attachments: [] }),
            });
            // Message will be added via WebSocket
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    },

    addMessage: (message) => {
        set({ messages: [...get().messages, message] });
    },
}));
