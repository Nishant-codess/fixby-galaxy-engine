import { useState } from 'react';
import { findTroubleshootingPlan } from '../settings/catalog';

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
  diagnosis?: string;
  likelyCauses?: string[];
  whyItHelps?: string;
  expectedImpact?: string;
  risk?: 'low' | 'medium' | 'high';
  samsungPath?: string[];
  capabilityId?: string;
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

    // Pre-resolve catalog plan if available
    const matchedPlan = findTroubleshootingPlan(query);
    const catalogGoals: GoalData[] = matchedPlan
      ? matchedPlan.fixes.map((fix, idx) => ({
          goal: fix.title,
          title: fix.title,
          score: Math.max(0.98 - idx * 0.05, 0.75),
          resolution_modes: [fix.canAutoApply ? 'auto' : 'manual', fix.canDemo ? 'demo' : 'manual'],
          navigation_path: fix.samsungPath,
          diagnosis: matchedPlan.diagnosis,
          likelyCauses: matchedPlan.likelyCauses,
          whyItHelps: fix.whyItHelps,
          expectedImpact: fix.expectedImpact,
          risk: fix.risk,
          samsungPath: fix.samsungPath,
          capabilityId: fix.capabilityId,
          actions: [{
            actionName: fix.title,
            description: fix.description,
            category: matchedPlan.category.toLowerCase(),
            stepGroups: [{
              steps: fix.action?.steps || [
                'Open Settings',
                ...fix.samsungPath.slice(1).map(p => `Tap ${p}`),
                `Select ${fix.title}`
              ],
              actionableDeeplink: {
                deeplink: `bixby://${fix.samsungPath.map(s => s.toLowerCase().replace(/\s+/g, '_')).join('/')}`,
                description: fix.title,
                classes: { path: fix.samsungPath.join(' > ') }
              }
            }]
          }]
        }))
      : [];

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 
        (typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname)
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
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const d = await res.json();
        apiTelemetry = d.meta;
        
        const rawContexts = (d.response?.contexts || []) as GoalData[];
        const extractedGoals: GoalData[] = [];
        const seenActionTitles = new Set<string>();

        // Flatten all actions across contexts so all actionable fixes appear as individual cards
        for (const ctx of rawContexts) {
          const acts = ctx.actions || [];
          if (acts.length > 0) {
            for (const act of acts) {
              const actName = act.actionName || ctx.title;
              if (!seenActionTitles.has(actName.toLowerCase())) {
                seenActionTitles.add(actName.toLowerCase());
                extractedGoals.push({
                  ...ctx,
                  title: actName,
                  actions: [act],
                  diagnosis: matchedPlan?.diagnosis || ctx.diagnosis,
                  likelyCauses: matchedPlan?.likelyCauses || ctx.likelyCauses,
                });
              }
            }
          } else {
            extractedGoals.push({
              ...ctx,
              diagnosis: matchedPlan?.diagnosis || ctx.diagnosis,
              likelyCauses: matchedPlan?.likelyCauses || ctx.likelyCauses,
            });
          }
        }

        // If we have an API answer, show that ranking. The local catalog is only
        // an offline fallback when the request fails.
        goals = extractedGoals;

        // Extract primary path from first goal for backward compat
        const pathStr = goals[0]?.actions?.[0]?.stepGroups?.[0]?.actionableDeeplink?.classes?.path;
        if (pathStr) {
          dynamicPath = (pathStr as string).split(">").map((s: string) => s.trim()).filter(Boolean);
        } else if (goals[0]?.navigation_path) {
          dynamicPath = goals[0].navigation_path;
        }
      } else if (catalogGoals.length > 0) {
        goals = catalogGoals;
        dynamicPath = goals[0]?.navigation_path || [];
      }
    } catch (e) {
      console.warn("Fixby API unavailable, using fallback.", e);
      if (catalogGoals.length > 0) {
        goals = catalogGoals;
        dynamicPath = goals[0]?.navigation_path || [];
      }
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

