import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminListFleet } from "@/lib/fleet.functions";

export const Route = createFileRoute("/debug-auth")({
  component: DebugAuthPage,
});


function DebugAuthPage() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  function push(line: string) {
    setLog((l) => [...l, line]);
  }

  async function run() {
    setLog([]);
    setRunning(true);
    try {
      const clientUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "(not set)";
      push(`1) Client build-time project URL: ${clientUrl}`);

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) {
        push(`2) getSession() error: ${sessionErr.message}`);
        return;
      }
      const token = sessionData.session?.access_token;
      const user = sessionData.session?.user;
      push(`2) Session present: ${!!sessionData.session}. User: ${user?.email ?? "none"}. Token length: ${token?.length ?? 0}`);
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          push(`   Token payload: iss=${payload.iss} aud=${payload.aud} sub=${payload.sub} exp=${new Date(payload.exp * 1000).toISOString()} now=${new Date().toISOString()}`);
        } catch (e: any) {
          push(`   Could not decode token payload: ${e.message}`);
        }
      }
      if (!token) {
        push("No token available, stopping.");
        return;
      }

      const rawUrl = clientUrl + "/auth/v1/user";
      push(`3) Calling raw Supabase Auth endpoint directly: ${rawUrl}`);
      const rawKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || "";
      const rawRes = await fetch(rawUrl, {
        headers: { apikey: rawKey, Authorization: `Bearer ${token}` },
      });
      const rawText = await rawRes.text();
      push(`   Raw Supabase Auth response: status=${rawRes.status} body=${rawText}`);

      push("4) Calling adminListFleet() server function (goes through our middleware)...");
      try {
        const result = await adminListFleet();
        push(`   SUCCESS: got ${Array.isArray(result) ? result.length : "?"} rows`);
      } catch (e: any) {
        push(`   FAILED: ${e?.message ?? String(e)}`);
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "monospace", fontSize: 13, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Auth Debug</h1>
      <button
        onClick={run}
        disabled={running}
        style={{ padding: "8px 16px", background: "#111", color: "#fff", borderRadius: 8, marginBottom: 16 }}
      >
        {running ? "Running..." : "Run test"}
      </button>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 16, borderRadius: 8, lineHeight: 1.6 }}>
        {log.length ? log.join("\n\n") : 'Click "Run test" while logged into /admin in this same browser tab.'}
      </pre>
    </div>
  );
}
