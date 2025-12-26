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
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-text">GARUDA PANEL</div>
                    <h1>System Authentication</h1>
                    <p>Please enter your credentials to access the management dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Admin Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="gkk.devx@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Access Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Verifying..." : "Enter Dashboard"}
                    </button>
                </form>

                <div className="login-footer">
                    © 2025 NeoBridge Garuda • Secure Environment
                </div>
            </div>

            <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
          background: #111;
          border: 1px solid #222;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-text {
          font-weight: 800;
          letter-spacing: 2px;
          color: #ff4d4d;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }

        h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        p {
          color: #888;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #bbb;
        }

        input {
          padding: 0.8rem 1rem;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #ff4d4d;
        }

        .error-message {
          background: rgba(255, 77, 77, 0.1);
          color: #ff4d4d;
          padding: 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          border: 1px solid rgba(255, 77, 77, 0.2);
        }

        .login-btn {
          margin-top: 0.5rem;
          background: #ff4d4d;
          color: #fff;
          border: none;
          padding: 0.9rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }

        .login-btn:hover {
          background: #ff3333;
        }

        .login-btn:active {
          transform: scale(0.98);
        }

        .login-btn:disabled {
          background: #555;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.75rem;
          color: #444;
        }
      `}</style>
        </div>
    );
}
