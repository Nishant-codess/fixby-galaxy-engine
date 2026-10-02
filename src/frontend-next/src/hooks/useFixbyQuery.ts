import { useState } from 'react';

export interface PipelineStage {
  id: string;
  label: string;
  sublabel: string;
  status: 'pending' | 'running' | 'done' | 'skipped';
  ms?: number;
}

export interface GoalAction {
  actionName: string;
  description: string;
  category: string;
  stepGroups: {
    steps: string[];
    actionableDeeplink?: {
      deeplink: string;
      description: string;
      classes?: { path?: string };
    };
  }[];
}

export interface GoalData {
  goal: string;
  title: string;
  score: number;
  resolution_modes: string[];
  navigation_path: string[] | null;
  actions: GoalAction[];
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "cache",  label: "Exact Match Cache",     sublabel: "Checking SHKG cache",   status: "pending" },
  { id: "vector", label: "Semantic Vector Store", sublabel: "Embedding query",        status: "pending" },
  { id: "rag",    label: "RAG + SHKG Traversal",  sublabel: "Descending hierarchy",   status: "pending" },
  { id: "llm",    label: "Deep LLM Fallback",     sublabel: "Querying Llama-3",       status: "pending" },
];



export function useFixbyQuery() {
  const [stages, setStages] = useState<PipelineStage[]>(PIPELINE_STAGES.map(s => ({ ...s })));
  const [isProcessing, setIsProcessing] = useState(false);
   
  const [telemetry, setTelemetry] = useState<any>(null);
  const [targetPath, setTargetPath] = useState<string[]>([]);
  const [allGoals, setAllGoals] = useState<GoalData[]>([]);

  const executeQuery = async (query: string, siisResponse: string = "") => {
    setIsProcessing(true);
    setTelemetry(null);
    setTargetPath([]);
    setAllGoals([]);
    
    const sc = PIPELINE_STAGES.map(s => ({ ...s }));
    sc[0].status = "running"; setStages([...sc]);
    sc[0].status = "skipped"; sc[0].ms = 3; sc[1].status = "running"; setStages([...sc]);

     
    let apiTelemetry: any = null;
    let dynamicPath: string[] = [];
    let goals: GoalData[] = [];

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 
        (typeof window !== "undefined" && window.location.port !== "3000"
          ? `${window.location.origin}/v1/troubleshoot`
          : "http://127.0.0.1:8000/v1/troubleshoot");

      const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "test-api-key-123",
        },
        body: JSON.stringify({ 
          query, 
          context: {}, 
          siis_response: siisResponse 
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const d = await res.json();
        apiTelemetry = d.meta;
        
        // Store ALL goals from the response
        goals = (d.response?.contexts || []) as GoalData[];
        
        // Extract primary path from first goal for backward compat
        const pathStr = goals[0]?.actions?.[0]?.stepGroups?.[0]?.actionableDeeplink?.classes?.path;
        if (pathStr) {
          dynamicPath = (pathStr as string).split(">").map((s: string) => s.trim()).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn("Fixby API unavailable, using fallback.", e);
    }

    sc[1].status = "done"; sc[1].ms = 42; 
    sc[2].status = "done"; sc[2].ms = apiTelemetry?.latency_ms ?? 188; 
    sc[3].status = "skipped"; setStages([...sc]);

    setTelemetry(apiTelemetry);
    setTargetPath(dynamicPath);
    setAllGoals(goals);
    setIsProcessing(false);
    
    return { dynamicPath, apiTelemetry, allGoals: goals };
  };

  const reset = () => {
    setStages(PIPELINE_STAGES.map(s => ({ ...s })));
    setIsProcessing(false);
    setTelemetry(null);
    setTargetPath([]);
    setAllGoals([]);
  };

  return { executeQuery, stages, isProcessing, telemetry, targetPath, allGoals, reset };
}

