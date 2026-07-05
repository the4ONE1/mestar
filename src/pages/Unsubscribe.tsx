import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

type State =
  | { kind: "loading" }
  | { kind: "valid" }
  | { kind: "already" }
  | { kind: "invalid" }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "error"; message: string };

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`;
    fetch(url, {
      headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setState({ kind: "invalid" });
          return;
        }
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setState({ kind: "already" });
          return;
        }
        if (data.valid) {
          setState({ kind: "valid" });
          return;
        }
        setState({ kind: "invalid" });
      })
      .catch(() => setState({ kind: "invalid" }));
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    const { data, error } = await supabase.functions.invoke(
      "handle-email-unsubscribe",
      { body: { token } }
    );
    if (error) {
      setState({ kind: "error", message: error.message });
      return;
    }
    if ((data as any)?.success || (data as any)?.reason === "already_unsubscribed") {
      setState({ kind: "done" });
      return;
    }
    setState({ kind: "error", message: "Could not unsubscribe." });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-background">
      <SEO title="Unsubscribe — MESTAR" description="Manage your MESTAR email preferences and confirm unsubscribe to stop receiving order updates, story delivery emails, and promotional messages." noindex />
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border bg-card">
        <h1 className="text-2xl font-bold">Email preferences</h1>
        {state.kind === "loading" && <p className="text-muted-foreground">Checking your link…</p>}
        {state.kind === "invalid" && (
          <p className="text-muted-foreground">This unsubscribe link is invalid or expired.</p>
        )}
        {state.kind === "already" && (
          <p className="text-muted-foreground">You're already unsubscribed. Nothing more to do.</p>
        )}
        {state.kind === "valid" && (
          <>
            <p className="text-muted-foreground">
              Click below to confirm and stop receiving emails from MESTAR.
            </p>
            <Button onClick={confirm} size="lg" className="w-full">
              Confirm unsubscribe
            </Button>
          </>
        )}
        {state.kind === "submitting" && <p className="text-muted-foreground">Processing…</p>}
        {state.kind === "done" && (
          <p className="text-muted-foreground">
            You've been unsubscribed. We're sorry to see you go.
          </p>
        )}
        {state.kind === "error" && (
          <p className="text-destructive">{state.message}</p>
        )}
      </div>
    </main>
  );
};

export default Unsubscribe;
