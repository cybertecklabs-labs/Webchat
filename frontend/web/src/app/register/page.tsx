"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function Register() {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:3001/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                // Automatically login or redirect to login
                router.push("/login");
            } else {
                const msg = await res.text();
                setError(msg || "Registration failed");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
            <form onSubmit={handleSubmit} className="glass-panel w-full max-w-md space-y-4 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-center text-white mb-6">Create Account</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-lg text-white"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-lg text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-lg text-white"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors">
                    Register
                </button>
                <p className="text-center text-gray-400 text-sm">
                    Already have an account? <a href="/login" className="text-indigo-400 hover:underline">Login</a>
                </p>
            </form>
        </div>
    );
}
