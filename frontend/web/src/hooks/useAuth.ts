import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
    const { user, token, setUser, logout } = useAuthStore();

    const register = async (username: string, email: string, password: string) => {
        const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:8081";
        const response = await fetch(`${AUTH_BASE}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || "Registration failed");
        }

        // Auto-login after registration or just redirect to login
        // For simplicity, we'll assume the user needs to login.
    };

    const login = async (email: string, password: string) => {
        const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:8081";
        const response = await fetch(`${AUTH_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || "Login failed");
        }

        const data = await response.json();
        setUser(data.user, data.token);
    };

    return {
        user,
        token,
        register,
        login,
        logout,
        loading: false, // For now
        error: null,
    };
};
