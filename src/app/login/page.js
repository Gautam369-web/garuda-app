"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c] p-4 font-sans text-white">
      <div className="w-full max-w-md bg-[#16161a] border border-white/5 p-8 lg:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/10 blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-secondary/10 blur-[80px] -ml-16 -mb-16 pointer-events-none"></div>

        <div className="relative z-10 text-center mb-10">
          <div className="text-2xl font-black tracking-tighter text-cyber mb-6">GARUDA PANEL</div>
          <h1 className="text-2xl font-bold mb-2">System Authentication</h1>
          <p className="text-gray-400 text-sm">Please enter credentials to access the management dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Admin Email</label>
            <input
              id="email"
              type="email"
              placeholder="xxx@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/40 border border-white/10 px-4 py-3.5 rounded-xl focus:border-accent-primary outline-none transition-all placeholder:text-gray-700"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Access Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border border-white/10 px-4 py-3.5 rounded-xl focus:border-accent-primary outline-none transition-all placeholder:text-gray-700"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-xs font-medium text-center">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-cyber-gradient text-black font-black py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? "Verifying..." : "ENTER DASHBOARD"}
          </button>
        </form>

        <div className="relative z-10 mt-12 pt-8 border-t border-white/5 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
          © 2025 Team Garuda • Secure Environment
        </div>
      </div>
    </div>
  );
}
