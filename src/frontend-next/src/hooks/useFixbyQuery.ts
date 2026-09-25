import { useState } from 'react';

export interface PipelineStage {
  id: string;
  label: string;
  sublabel: string;
  status: 'pending' | 'running' | 'done' | 'skipped';
  ms?: number;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "cache",  label: "Exact Match Cache",     sublabel: "Checking SHKG cache",   status: "pending" },
  { id: "vector", label: "Semantic Vector Store", sublabel: "Embedding query",        status: "pending" },
  { id: "rag",    label: "RAG + SHKG Traversal",  sublabel: "Descending hierarchy",   status: "pending" },
  { id: "llm",    label: "Deep LLM Fallback",     sublabel: "Querying Llama-3",       status: "pending" },
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function useFixbyQuery() {
  const [stages, setStages] = useState<PipelineStage[]>(PIPELINE_STAGES.map(s => ({ ...s })));
  const [isProcessing, setIsProcessing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [telemetry, setTelemetry] = useState<any>(null);
  const [targetPath, setTargetPath] = useState<string[]>([]);

  const executeQuery = async (query: string) => {
    setIsProcessing(true);
    setTelemetry(null);
    setTargetPath([]);
    
    const sc = PIPELINE_STAGES.map(s => ({ ...s }));
    sc[0].status = "running"; setStages([...sc]); await sleep(300);
    sc[0].status = "skipped"; sc[0].ms = 3; sc[1].status = "running"; setStages([...sc]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let apiTelemetry: any = null;
    let dynamicPath: string[] = [];

    try {
      const res = await fetch("http://localhost:8000/v1/troubleshoot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "test-api-key-123",
        },
        body: JSON.stringify({ query, context: {}, siis_response: "" }),
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) {
        const d = await res.json();
        apiTelemetry = d.meta;
        const pathStr = d.response?.contexts?.[0]?.actions?.[0]?.stepGroups?.[0]?.actionableDeeplink?.classes?.path;
        if (pathStr) {
          dynamicPath = (pathStr as string).split(">").map((s: string) => s.trim()).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn("Fixby API unavailable, using fallback.", e);
    }

    sc[1].status = "done"; sc[1].ms = 42; sc[2].status = "running"; setStages([...sc]);
    await sleep(500);
    sc[2].status = "done"; sc[2].ms = apiTelemetry?.latency_ms ?? 188; sc[3].status = "skipped"; setStages([...sc]);
    await sleep(250);

    setTelemetry(apiTelemetry);
    setTargetPath(dynamicPath);
    setIsProcessing(false);
    
    return { dynamicPath, apiTelemetry };
  };

  const reset = () => {
    setStages(PIPELINE_STAGES.map(s => ({ ...s })));
    setIsProcessing(false);
    setTelemetry(null);
    setTargetPath([]);
  };

  return { executeQuery, stages, isProcessing, telemetry, targetPath, reset };
}
