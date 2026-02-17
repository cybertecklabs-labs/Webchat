import { create } from "zustand";
import { api } from "@/lib/api";

interface Server {
    id: string;
    name: string;
    owner_id: string;
    invite_code: string;
    created_at: string;
}

interface ServerState {
    servers: Server[];
    currentServer: Server | null;
    loading: boolean;
    fetchServers: () => Promise<void>;
    setCurrentServer: (server: Server) => void;
    createServer: (name: string) => Promise<Server>;
}

export const useServerStore = create<ServerState>((set, get) => ({
    servers: [],
    currentServer: null,
    loading: false,

    fetchServers: async () => {
        set({ loading: true });
        try {
            const data = await api("/servers");
            set({ servers: data, loading: false });
        } catch (error) {
            console.error("Failed to fetch servers:", error);
            set({ loading: false });
        }
    },

    setCurrentServer: (server) => set({ currentServer: server }),

    createServer: async (name: string) => {
        const server = await api("/servers", {
            method: "POST",
            body: JSON.stringify({ name }),
        });
        set({ servers: [...get().servers, server] });
        return server;
    },
}));
