# src/backend/telemetry.py — Live Engine Telemetry & Latency Tracker (with SQLite persistence)
import os
import sqlite3
import time
from typing import Any, Dict, List

import numpy as np

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "telemetry.db")


class EngineTelemetry:
    def __init__(self):
        self.latencies: List[float] = []
        self.cache_hits: int = 0
        self.total_queries: int = 0
        self.pipeline_sources: Dict[str, int] = {"live": 0, "mock": 0}
        self.category_counts: Dict[str, int] = {}
        self.languages: Dict[str, int] = {}

        self._init_db()
        self._load_from_db()

    def _init_db(self):
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS telemetry_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    latency_ms REAL,
                    cache_hit BOOLEAN,
                    category TEXT,
                    lang TEXT,
                    pipeline_source TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def _load_from_db(self):
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT latency_ms, cache_hit, category, lang, pipeline_source FROM telemetry_logs")
            rows = cursor.fetchall()
            for row in rows:
                latency_ms, cache_hit, category, lang, pipeline_source = row
                self.total_queries += 1
                self.latencies.append(latency_ms)
                if cache_hit:
                    self.cache_hits += 1
                self.category_counts[category] = self.category_counts.get(category, 0) + 1
                self.languages[lang] = self.languages.get(lang, 0) + 1
                src = pipeline_source or "live"
                self.pipeline_sources[src] = self.pipeline_sources.get(src, 0) + 1

    def record(self, latency_ms: float, cache_hit: bool, source: str = "live", category: str = "general", language: str = "en", **kwargs):
        # Persist to SQLite
        effective_source = kwargs.get("pipeline_source", source)
        effective_lang = kwargs.get("lang", language)
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                "INSERT INTO telemetry_logs (latency_ms, cache_hit, category, lang, pipeline_source) VALUES (?, ?, ?, ?, ?)",
                (latency_ms, bool(cache_hit), category, effective_lang, effective_source)
            )
            conn.commit()

        # Update in-memory state
        self.total_queries += 1
        self.latencies.append(latency_ms)
        if cache_hit:
            self.cache_hits += 1

        self.pipeline_sources[effective_source] = self.pipeline_sources.get(effective_source, 0) + 1
        self.category_counts[category] = self.category_counts.get(category, 0) + 1
        self.languages[effective_lang] = self.languages.get(effective_lang, 0) + 1

    def get_summary(self) -> Dict[str, Any]:
        if not self.latencies:
            return {
                "total_queries": 0,
                "cache_hits": 0,
                "cache_hit_rate_pct": 0.0,
                "avg_latency_ms": 0.0,
                "latency_p50_ms": 0.0,
                "latency_p95_ms": 0.0,
                "latency_p99_ms": 0.0,
                "top_complaint_categories": self.category_counts,
                "language_distribution": self.languages,
                "pipeline_source_breakdown": self.pipeline_sources
            }

        arr = np.array(self.latencies)
        hit_rate = round((self.cache_hits / self.total_queries) * 100, 1)

        return {
            "total_queries": self.total_queries,
            "cache_hits": self.cache_hits,
            "cache_hit_rate_pct": hit_rate,
            "avg_latency_ms": round(float(np.mean(arr)), 1),
            "latency_p50_ms": round(float(np.percentile(arr, 50)), 1),
            "latency_p95_ms": round(float(np.percentile(arr, 95)), 1),
            "latency_p99_ms": round(float(np.percentile(arr, 99)), 1),
            "top_complaint_categories": self.category_counts,
            "language_distribution": self.languages,
            "pipeline_source_breakdown": self.pipeline_sources
        }


telemetry = EngineTelemetry()
