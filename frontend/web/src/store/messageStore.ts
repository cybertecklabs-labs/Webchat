import { create } from "zustand";
import { api } from "@/lib/api";

interface Message {
    id: string;
    channel_id: string;
    user_id: string;
    content: string;
    attachments: string[];
    created_at: string;
}

interface MessageState {
    messages: Message[];
    loading: boolean;
    fetchMessages: (channelId: string) => Promise<void>;
    addMessage: (message: Message) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
    messages: [],
    loading: false,

    fetchMessages: async (channelId: string) => {
        set({ loading: true });
        try {
            const data = await api(`/channels/${channelId}/messages?limit=50`);
            set({ messages: data.reverse(), loading: false });
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            set({ loading: false });
        }
    },

    addMessage: (message) => {
        set((state) => ({ messages: [...state.messages, message] }));
    },
}));
