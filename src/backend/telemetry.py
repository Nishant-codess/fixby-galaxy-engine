# src/backend/telemetry.py
from typing import Dict, List
import numpy as np

class TelemetryCollector:
    def __init__(self):
        self.latencies: List[float] = []
        self.cache_hits = 0
        self.total_queries = 0
        self.categories: Dict[str, int] = {}
        self.languages: Dict[str, int] = {}
        self.pipeline_sources: Dict[str, int] = {"live": 0, "mock": 0}

    def record(self, latency_ms: float, cache_hit: bool, category: str, lang: str, pipeline_source: str = "live"):
        self.total_queries += 1
        self.latencies.append(latency_ms)
        if cache_hit:
            self.cache_hits += 1
        self.categories[category] = self.categories.get(category, 0) + 1
        self.languages[lang] = self.languages.get(lang, 0) + 1
        self.pipeline_sources[pipeline_source] = self.pipeline_sources.get(pipeline_source, 0) + 1

    def get_summary(self) -> Dict:
        if not self.latencies:
            return {"total_queries": 0, "cache_hits": 0, "cache_hit_rate_pct": 0.0, "avg_latency_ms": 0.0,
                     "latency_p50_ms": 0.0, "latency_p95_ms": 0.0, "latency_p99_ms": 0.0,
                     "top_complaint_categories": {}, "language_distribution": {}, "pipeline_source_breakdown": {}}
        arr = np.array(self.latencies)
        return {
            "total_queries": self.total_queries, "cache_hits": self.cache_hits,
            "cache_hit_rate_pct": round(self.cache_hits / self.total_queries * 100, 1),
            "avg_latency_ms": round(float(np.mean(arr)), 1),
            "latency_p50_ms": round(float(np.percentile(arr, 50)), 1),
            "latency_p95_ms": round(float(np.percentile(arr, 95)), 1),
            "latency_p99_ms": round(float(np.percentile(arr, 99)), 1),
            "top_complaint_categories": self.categories, "language_distribution": self.languages,
            "pipeline_source_breakdown": self.pipeline_sources,
        }

telemetry = TelemetryCollector()
