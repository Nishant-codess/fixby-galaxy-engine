"use client";

import React, { useState } from "react";

interface Thread {
  id: string;
  name: string;
  preview: string;
  messages: { from: "them" | "me"; text: string }[];
}

const INITIAL: Thread[] = [
  {
    id: "samsung",
    name: "Samsung Members",
    preview: "Your device care report is ready.",
    messages: [
      { from: "them", text: "Your device care report is ready." },
      { from: "them", text: "Battery usage was higher than usual yesterday." },
    ],
  },
  {
    id: "mom",
    name: "Mom",
    preview: "Did you charge your phone?",
    messages: [{ from: "them", text: "Did you charge your phone?" }],
  },
  {
    id: "office",
    name: "Office",
    preview: "Standup moved to 11.",
    messages: [{ from: "them", text: "Standup moved to 11." }],
  },
];

/**
 * In-simulator Messages app. Sent bubbles stay in component state.
 * Nothing is delivered as a real SMS.
 */
export function MessagesApp() {
  const [threads, setThreads] = useState<Thread[]>(INITIAL);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [composing, setComposing] = useState(false);
  const [composeName, setComposeName] = useState("");

  const open = threads.find((t) => t.id === openId) || null;

  const send = () => {
    const text = draft.trim();
    if (!text || !open) return;
    setThreads((prev) => prev.map((t) => t.id === open.id
      ? { ...t, preview: text, messages: [...t.messages, { from: "me", text }] }
      : t));
    setDraft("");
  };

  const startCompose = () => {
    const name = composeName.trim();
    if (!name) return;
    const id = `local-${Date.now()}`;
    const thread: Thread = { id, name, preview: "New conversation", messages: [] };
    setThreads((prev) => [thread, ...prev]);
    setOpenId(id);
    setComposing(false);
    setComposeName("");
  };

  if (!open) {
    return (
      <div
        data-testid="messages-app"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 40,
          background: "var(--oneui-bg-primary)",
          color: "var(--oneui-text-primary)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "56px 20px 8px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 300 }}>Messages</div>
            <div style={{ fontSize: "12px", color: "var(--oneui-text-secondary)", marginTop: "4px" }}>
              Simulated inbox — messages are not sent
            </div>
          </div>
          <button
            data-testid="messages-compose-btn"
            onClick={() => setComposing(true)}
            style={{
              border: "none",
              background: "var(--oneui-accent)",
              color: "#fff",
              borderRadius: "16px",
              padding: "8px 12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Compose
          </button>
        </div>

        <div data-testid="messages-conversation-list" style={{ flex: 1, overflowY: "auto", paddingBottom: "72px" }}>
          {threads.map((thread) => (
            <button
              key={thread.id}
              data-testid={`messages-thread-${thread.id}`}
              onClick={() => setOpenId(thread.id)}
              style={{
                width: "100%",
                textAlign: "left",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--oneui-separator)",
                padding: "16px 20px",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 600 }}>{thread.name}</div>
              <div style={{ fontSize: "13px", color: "var(--oneui-text-secondary)", marginTop: "4px" }}>{thread.preview}</div>
            </button>
          ))}
        </div>

        {composing && (
          <div style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 72,
            background: "var(--oneui-bg-card)",
            borderRadius: "20px",
            padding: "16px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
          }}>
            <div style={{ fontSize: "13px", marginBottom: "8px" }}>New conversation</div>
            <input
              data-testid="messages-compose-name"
              value={composeName}
              onChange={(e) => setComposeName(e.target.value)}
              placeholder="Name"
              style={{
                width: "100%",
                borderRadius: "12px",
                border: "1px solid var(--oneui-separator)",
                padding: "10px 12px",
                marginBottom: "8px",
                background: "transparent",
                color: "inherit",
              }}
            />
            <button onClick={startCompose} style={{ border: "none", background: "var(--oneui-accent)", color: "#fff", borderRadius: "12px", padding: "8px 14px", fontWeight: 600, cursor: "pointer" }}>
              Start
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="messages-thread"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "var(--oneui-bg-primary)",
        color: "var(--oneui-text-primary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        onClick={() => setOpenId(null)}
        style={{
          margin: "52px 16px 8px",
          alignSelf: "flex-start",
          background: "transparent",
          border: "none",
          color: "var(--oneui-accent)",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "15px",
        }}
      >
        ‹ Messages
      </button>
      <div style={{ padding: "0 20px 8px", fontSize: "22px", fontWeight: 500 }}>{open.name}</div>
      <div style={{ fontSize: "12px", color: "var(--oneui-text-secondary)", padding: "0 20px 12px" }}>
        Simulated conversation. Nothing leaves this phone.
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {open.messages.map((msg, i) => (
          <div
            key={`${msg.text}-${i}`}
            style={{
              alignSelf: msg.from === "me" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: msg.from === "me" ? "var(--oneui-accent)" : "var(--oneui-bg-card)",
              color: msg.from === "me" ? "#fff" : "var(--oneui-text-primary)",
              borderRadius: "18px",
              padding: "10px 14px",
              fontSize: "14px",
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px", padding: "8px 12px 64px" }}>
        <input
          data-testid="messages-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message"
          style={{
            flex: 1,
            borderRadius: "18px",
            border: "1px solid var(--oneui-separator)",
            padding: "12px 14px",
            background: "var(--oneui-bg-card)",
            color: "inherit",
          }}
        />
        <button
          data-testid="messages-send-btn"
          onClick={send}
          style={{
            border: "none",
            borderRadius: "18px",
            padding: "0 16px",
            background: "var(--oneui-accent)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
