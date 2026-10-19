import React, { useEffect, useState } from "react";

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string | null;
}

interface DiscordLoginProps {
  onUserLoaded?: (user: DiscordUser | null) => void;
}

export default function DiscordLogin({ onUserLoaded }: DiscordLoginProps = {}) {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUser() {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "same-origin"
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (onUserLoaded) onUserLoaded(data.user);
      } else {
        setUser(null);
        if (onUserLoaded) onUserLoaded(null);
      }
    } catch {
      setError("Não foi possível ligar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function logout() {
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin"
      });

      if (!response.ok) {
        throw new Error("Falha ao terminar a sessão.");
      }

      setUser(null);
      if (onUserLoaded) onUserLoaded(null);
    } catch {
      setError("Não foi possível terminar a sessão.");
    }
  }

  if (loading) {
    return <p className="text-xs text-slate-400">A verificar sessão...</p>;
  }

  if (user) {
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
      : null;

    return (
      <div 
        style={{ display: "flex", alignItems: "center", gap: 12 }}
        className="text-xs text-white"
      >
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt=""
            width="40"
            height="40"
            style={{ borderRadius: "50%" }}
            className="ring-1 ring-indigo-500/50"
          />
        )}

        <span className="font-bold">
          Olá, {user.global_name || user.username}
        </span>

        <button 
          onClick={logout}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 border border-slate-700 transition text-xs font-semibold"
        >
          Terminar sessão
        </button>

        {error && <p role="alert" className="text-rose-400 text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          window.location.assign("/api/auth/discord");
        }}
        className="px-3.5 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs shadow-md shadow-[#5865F2]/20 transition active:scale-95"
      >
        Entrar com Discord
      </button>

      {error && <p role="alert" className="text-rose-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
