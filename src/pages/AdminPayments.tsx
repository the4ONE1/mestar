import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-payment-events`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TOKEN_STORAGE_KEY = "mestar_admin_token";

type PaymentEvent = {
  id: string;
  order_id: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  event_type: string;
  result: string;
  message: string | null;
  payload_summary: Record<string, unknown>;
  created_at: string;
};

type OrderSummary = {
  id: string;
  status: string;
  child_name: string | null;
  customer_email: string | null;
  story_title: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
};

const resultTone = (result: string): "default" | "secondary" | "destructive" | "outline" => {
  if (result === "queued" || result === "pipeline_complete" || result === "refunded") return "default";
  if (result === "pipeline_failed" || result === "payment_failed" || result === "expired") return "destructive";
  if (result === "ignored" || result === "skipped") return "secondary";
  return "outline";
};

export default function AdminPayments() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [authed, setAuthed] = useState<boolean>(false);
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [orders, setOrders] = useState<Record<string, OrderSummary>>({});
  const [loading, setLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>("");

  const load = async (opts?: { silent?: boolean }) => {
    if (!token) return;
    setLoading(true);
    try {
      const url = new URL(FN_URL);
      if (orderFilter.trim()) url.searchParams.set("orderId", orderFilter.trim());
      url.searchParams.set("limit", "200");
      const res = await fetch(url.toString(), {
        headers: {
          "x-admin-token": token,
          apikey: ANON,
          Authorization: `Bearer ${ANON}`,
        },
      });
      if (res.status === 401) {
        setAuthed(false);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (!opts?.silent) toast.error("Wrong admin password");
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setEvents(json.events || []);
      const map: Record<string, OrderSummary> = {};
      for (const o of json.orders || []) map[o.id] = o;
      setOrders(map);
      setAuthed(true);
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (e) {
      console.error(e);
      if (!opts?.silent) toast.error("Failed to load payment events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load({ silent: true });
     
  }, []);

  if (!authed) {
    return (
      <div className="container max-w-md py-16">
        <Card className="p-6 space-y-4">
          <h1 className="font-display text-2xl">Admin Access</h1>
          <p className="text-sm text-muted-foreground">
            Enter the admin password to view payment event logs.
          </p>
          <Input
            type="password"
            placeholder="Admin password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <Button onClick={() => load()} disabled={!token || loading} className="w-full">
            {loading ? "Checking…" : "Sign in"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl">Payment Event Log</h1>
          <p className="text-sm text-muted-foreground">
            Every Stripe webhook event received, most recent first.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by order ID (UUID)"
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="w-72"
          />
          <Button onClick={() => load()} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem(TOKEN_STORAGE_KEY);
              setToken("");
              setAuthed(false);
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No payment events yet. Once Stripe fires a webhook, it will appear here.
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">When</th>
                <th className="p-2">Event Type</th>
                <th className="p-2">Result</th>
                <th className="p-2">Order</th>
                <th className="p-2">Stripe Session</th>
                <th className="p-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const order = e.order_id ? orders[e.order_id] : null;
                return (
                  <tr key={e.id} className="border-b align-top hover:bg-muted/40">
                    <td className="p-2 whitespace-nowrap text-muted-foreground">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                    <td className="p-2 font-mono text-xs">{e.event_type}</td>
                    <td className="p-2">
                      <Badge variant={resultTone(e.result)}>{e.result}</Badge>
                    </td>
                    <td className="p-2 text-xs">
                      {order ? (
                        <div className="space-y-0.5">
                          <div className="font-medium">{order.child_name || "—"}</div>
                          <div className="text-muted-foreground">{order.customer_email || "—"}</div>
                          <div className="text-muted-foreground">Status: {order.status}</div>
                          <button
                            className="text-primary hover:underline font-mono"
                            onClick={() => {
                              setOrderFilter(order.id);
                              setTimeout(load, 0);
                            }}
                          >
                            {order.id.slice(0, 8)}…
                          </button>
                        </div>
                      ) : e.order_id ? (
                        <span className="font-mono text-muted-foreground">{e.order_id.slice(0, 8)}…</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-2 font-mono text-xs text-muted-foreground">
                      {e.stripe_session_id ? `${e.stripe_session_id.slice(0, 14)}…` : "—"}
                    </td>
                    <td className="p-2 text-xs">{e.message || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
