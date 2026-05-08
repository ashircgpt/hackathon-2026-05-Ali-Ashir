"use client";

import { useEffect, useState } from "react";
import {
  Database,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Shield,
  Key,
} from "lucide-react";
import { getSocket } from "@/lib/socket-client";

type SocketStatus = "connecting" | "connected" | "disconnected";

const SOCKET_META: Record<SocketStatus, { label: string; color: string }> = {
  connected:    { label: "Live",          color: "text-green-400" },
  connecting:   { label: "Connecting…",  color: "text-amber-400" },
  disconnected: { label: "Disconnected", color: "text-red-400" },
};

const DOT_COLOR: Record<SocketStatus, string> = {
  connected:    "bg-green-400",
  connecting:   "bg-amber-400",
  disconnected: "bg-red-400",
};

export default function SettingsSection() {
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("connecting");
  const [showKitchen, setShowKitchen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    setAppUrl(window.location.origin);

    const socket = getSocket();
    setSocketStatus(socket.connected ? "connected" : "connecting");

    function onConnect() {
      setSocketStatus("connected");
    }
    function onDisconnect() {
      setSocketStatus("disconnected");
    }
    function onError() {
      setSocketStatus("disconnected");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
    };
  }, []);

  const socketMeta = SOCKET_META[socketStatus];
  const SocketIcon = socketStatus === "connected" ? Wifi : WifiOff;
  const socketIconColor =
    socketStatus === "connected"
      ? "text-green-400"
      : socketStatus === "connecting"
        ? "text-amber-400"
        : "text-red-400";
  const socketIconBg =
    socketStatus === "connected"
      ? "bg-green-500/10"
      : socketStatus === "connecting"
        ? "bg-amber-500/10"
        : "bg-red-500/10";

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cheese mb-2">
          Configuration
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-smoke mt-1">
          System status and access configuration.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* System Status Card */}
        <div className="bg-glass border border-ash rounded-2xl p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-6">
            System Status
          </p>
          <div className="space-y-5">
            {/* Database */}
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cream">Database</p>
                <p className="text-[10px] font-mono text-smoke mt-0.5">
                  PostgreSQL · Supabase
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-mono text-green-400 shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Connected
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-ash/50" />

            {/* Socket.io */}
            <div className="flex items-center gap-4">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${socketIconBg}`}
              >
                <SocketIcon className={`w-4 h-4 ${socketIconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cream">Socket.io</p>
                <p className="text-[10px] font-mono text-smoke mt-0.5">
                  Real-time order push
                </p>
              </div>
              <span
                className={`flex items-center gap-1.5 text-xs font-mono shrink-0 ${socketMeta.color}`}
              >
                <span className={`w-2 h-2 rounded-full animate-pulse ${DOT_COLOR[socketStatus]}`} />
                {socketMeta.label}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-ash/50" />

            {/* App URL */}
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-ember/10 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-ember" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cream">App URL</p>
                <p className="text-[10px] font-mono text-smoke mt-0.5 truncate">
                  {appUrl || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Credentials Card */}
        <div className="bg-glass border border-ash rounded-2xl p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-6">
            Demo Credentials
          </p>
          <div className="space-y-5">
            {[
              {
                role: "Kitchen",
                passphrase: "kitchen_demo",
                show: showKitchen,
                toggle: () => setShowKitchen((v) => !v),
              },
              {
                role: "Admin",
                passphrase: "admin_demo",
                show: showAdmin,
                toggle: () => setShowAdmin((v) => !v),
              },
            ].map(({ role, passphrase, show, toggle }, idx) => (
              <div key={role}>
                {idx > 0 && <div className="border-t border-ash/50 mb-5" />}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-ember/10 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-ember" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cream">{role}</p>
                    <p className="text-[10px] font-mono text-smoke mt-0.5 tracking-[0.1em]">
                      {show ? passphrase : "•••••••••••••"}
                    </p>
                  </div>
                  <button
                    onClick={toggle}
                    aria-label={show ? `Hide ${role} passphrase` : `Show ${role} passphrase`}
                    className="p-2 rounded-lg text-smoke hover:text-cream hover:bg-ash/50 transition-all
                      focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 focus:ring-offset-void"
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t border-ash/50 pt-4">
              <p className="text-[10px] font-mono text-smoke/50 leading-relaxed">
                These passphrases are demo-only. Set{" "}
                <span className="text-smoke">KITCHEN_PASSPHRASE</span> /{" "}
                <span className="text-smoke">ADMIN_PASSPHRASE</span> env vars
                to change them.
              </p>
            </div>
          </div>
        </div>

        {/* Auth & Session Card — full width */}
        <div className="bg-glass border border-ash rounded-2xl p-6 md:col-span-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-6">
            Auth &amp; Session
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                icon: Key,
                label: "Auth Method",
                value: "SHA-256 passphrase cookie",
              },
              {
                icon: Shield,
                label: "Kitchen Cookie",
                value: "pizza314_kitchen_auth",
              },
              {
                icon: Shield,
                label: "Admin Cookie",
                value: "pizza314_admin_auth",
              },
              {
                icon: Lock,
                label: "Protected Routes",
                value: "/kitchen  ·  /admin",
              },
              {
                icon: Globe,
                label: "Public Routes",
                value: "/table/[id]  ·  /",
              },
              {
                icon: Globe,
                label: "Middleware Runtime",
                value: "Edge (Vercel)",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-void/50 rounded-xl px-4 py-3.5 flex gap-3 items-start">
                <Icon className="w-3.5 h-3.5 text-smoke mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-smoke mb-1.5">
                    {label}
                  </p>
                  <p className="text-xs font-mono text-cream/80 break-all">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
