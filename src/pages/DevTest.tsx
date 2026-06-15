import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function DevTest() {
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setStatus("Creating test order and generating story…");
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("dev-trigger-order", {
        body: {
          childName: "Leo",
          childAge: "8-10",
          theme: "space adventure",
          strength: "bravery",
          hasSupportingCharacter: false,
          customerEmail: "investor-demo@mestar.pro",
          forceAudiobook: true,
        },
      });
      if (error) throw error;
      setResult(data);
      setStatus("Done. Audiobook is generating in the background (~30s).");
    } catch (e: any) {
      setStatus(`Error: ${e.message || String(e)}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Dev Test — Full Order Pipeline</h1>
      <p className="text-muted-foreground mb-6">
        Fires generate-story → create-storybook → generate-audiobook. Not linked publicly.
      </p>

      <button
        onClick={run}
        disabled={running}
        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        {running ? "Running…" : "Run audiobook demo order"}
      </button>

      {status && <p className="mt-6 text-sm">{status}</p>}

      {result && (
        <div className="mt-6 p-4 border rounded-lg space-y-2 text-sm">
          <div><strong>Order ID:</strong> {result.orderId}</div>
          <div><strong>Title:</strong> {result.title}</div>
          {result.pdfUrl && (
            <div>
              <strong>PDF:</strong>{" "}
              <a className="text-primary underline" href={result.pdfUrl} target="_blank" rel="noreferrer">Open</a>
            </div>
          )}
          {result.orderId && (
            <Link
              to={`/library/${result.orderId}`}
              className="inline-block mt-3 bg-primary text-primary-foreground px-4 py-2 rounded"
            >
              Open library page (audiobook player) →
            </Link>
          )}
          <pre className="mt-3 text-xs bg-muted p-2 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
