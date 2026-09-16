# src/core/session.py — Multi-Turn Troubleshooting Session Manager
"""
Fixby Multi-Turn Troubleshooting Session Manager.
Tracks conversational state, attempted action history, and diagnostic DAG progression
across multi-turn escalation flows (AUTO -> CAUTION -> CRITICAL).
Thread-safe with LRU and TTL eviction.
"""
import time
import uuid
import threading
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field


@dataclass
class TroubleshootingSession:
    session_id: str
    created_at: float = field(default_factory=time.time)
    last_active: float = field(default_factory=time.time)
    current_turn: int = 1
    current_escalation: str = "AUTO"
    attempted_action_ids: List[str] = field(default_factory=list)
    query_history: List[Dict[str, Any]] = field(default_factory=list)
    active_graph: Optional[Dict[str, Any]] = None

    def add_attempted_actions(self, action_ids: List[str]):
        for aid in action_ids:
            if aid and aid not in self.attempted_action_ids:
                self.attempted_action_ids.append(aid)

    def record_turn(
        self,
        query: str,
        turn: int,
        escalation: str,
        suggested_actions: List[str],
        graph: Optional[Dict[str, Any]] = None
    ):
        self.last_active = time.time()
        self.current_turn = turn
        self.current_escalation = escalation
        if graph:
            self.active_graph = graph
        self.query_history.append({
            "turn": turn,
            "query": query,
            "escalation": escalation,
            "suggested_actions": suggested_actions,
            "timestamp": self.last_active
        })


class SessionManager:
    def __init__(self, max_sessions: int = 2000, ttl_seconds: float = 3600.0):
        self._sessions: Dict[str, TroubleshootingSession] = {}
        self._max_sessions = max_sessions
        self._ttl = ttl_seconds
        self._lock = threading.Lock()

    def get_or_create(self, session_id: Optional[str] = None) -> TroubleshootingSession:
        with self._lock:
            now = time.time()
            self._cleanup_expired(now)

            if not session_id:
                session_id = str(uuid.uuid4())

            if session_id not in self._sessions:
                if len(self._sessions) >= self._max_sessions:
                    # LRU eviction: remove oldest active session
                    oldest_k = min(self._sessions.keys(), key=lambda k: self._sessions[k].last_active)
                    del self._sessions[oldest_k]

                self._sessions[session_id] = TroubleshootingSession(session_id=session_id)

            session = self._sessions[session_id]
            session.last_active = now
            return session

    def get(self, session_id: str) -> Optional[TroubleshootingSession]:
        with self._lock:
            return self._sessions.get(session_id)

    def record_turn(
        self,
        session_id: str,
        query: str,
        turn: int,
        escalation: str,
        suggested_actions: List[str],
        attempted_actions: Optional[List[str]] = None,
        graph: Optional[Dict[str, Any]] = None
    ) -> TroubleshootingSession:
        session = self.get_or_create(session_id)
        if attempted_actions:
            session.add_attempted_actions(attempted_actions)
        session.record_turn(
            query=query,
            turn=turn,
            escalation=escalation,
            suggested_actions=suggested_actions,
            graph=graph
        )
        return session

    def get_attempted_actions(self, session_id: str) -> List[str]:
        session = self.get(session_id)
        return list(session.attempted_action_ids) if session else []

    def clear(self, session_id: str) -> bool:
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False

    def reset_all(self):
        with self._lock:
            self._sessions.clear()

    def _cleanup_expired(self, now: float):
        expired = [sid for sid, s in self._sessions.items() if now - s.last_active > self._ttl]
        for sid in expired:
            del self._sessions[sid]


# Global session manager instance
session_manager = SessionManager()
