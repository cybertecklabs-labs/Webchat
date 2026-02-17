const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function api(endpoint: string, options: RequestInit = {}) {
    // Get token from localStorage if available
    let token: string | null = null;
    if (typeof window !== "undefined") {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
            const parsed = JSON.parse(authStorage);
            token = parsed.state?.token;
        }
    }

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `HTTP ${res.status}`);
    }

    return res.json();
}

export async function authApi(endpoint: string, options: RequestInit = {}) {
    const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:8081";

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const res = await fetch(`${AUTH_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `HTTP ${res.status}`);
    }

    return res.json();
}
