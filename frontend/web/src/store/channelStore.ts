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

interface ChannelState {
    channels: Channel[];
    currentChannel: Channel | null;
    loading: boolean;
    fetchChannels: (serverId: string) => Promise<void>;
    setCurrentChannel: (channel: Channel) => void;
}

export const useChannelStore = create<ChannelState>((set, get) => ({
    channels: [],
    currentChannel: null,
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
        set({ currentChannel: channel });
    },
}));
