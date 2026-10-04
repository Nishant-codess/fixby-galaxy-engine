"use client";

import React, { useState } from "react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

type Tab = "keypad" | "recents" | "contacts";

const RECENTS = [
  { name: "Samsung Care", number: "1800 40 7267864", time: "Yesterday" },
  { name: "Mom", number: "+91 98100 11223", time: "Mon" },
  { name: "Unknown", number: "+82 2 555 0199", time: "Sun" },
];

const CONTACTS = [
  { name: "Fixby Support", number: "1800 40 7267864" },
  { name: "Mom", number: "+91 98100 11223" },
  { name: "Office", number: "+91 80 4123 9000" },
];

/**
 * In-simulator Samsung dialer. Calls stay inside the phone frame.
 * This is not a launch of com.samsung.android.dialer.
 */
export function PhoneApp() {
  const [tab, setTab] = useState<Tab>("keypad");
  const [digits, setDigits] = useState("");
  const [calling, setCalling] = useState<string | null>(null);

  const placeCall = (number: string) => {
    if (!number) return;
    setCalling(number);
  };

  return (
    <div
      data-testid="phone-app"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "var(--oneui-bg-primary)",
        display: "flex",
        flexDirection: "column",
        color: "var(--oneui-text-primary)",
      }}
    >
      <div style={{ padding: "56px 20px 8px" }}>
        <div style={{ fontSize: "28px", fontWeight: 300, letterSpacing: "-0.02em" }}>Phone</div>
        <div style={{ fontSize: "12px", color: "var(--oneui-text-secondary)", marginTop: "4px" }}>
          Simulated dialer — calls stay inside this phone
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", padding: "8px 16px 12px" }}>
        {(["keypad", "recents", "contacts"] as Tab[]).map((id) => (
          <button
            key={id}
            data-testid={id === "keypad" ? "phone-keypad-tab" : id === "recents" ? "phone-recents-tab" : "phone-contacts-tab"}
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              border: "none",
              borderRadius: "14px",
              padding: "8px 0",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              background: tab === id ? "var(--oneui-accent)" : "rgba(128,128,128,0.15)",
              color: tab === id ? "#fff" : "var(--oneui-text-primary)",
            }}
          >
            {id === "keypad" ? "Keypad" : id === "recents" ? "Recents" : "Contacts"}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 72px" }}>
        {tab === "keypad" && (
          <div data-testid="phone-keypad">
            <div style={{
              minHeight: "36px",
              textAlign: "center",
              fontSize: "28px",
              fontWeight: 300,
              letterSpacing: "0.08em",
              margin: "8px 0 12px",
            }}>
              {digits || " "}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setDigits((d) => (d + key).slice(0, 16))}
                  style={{
                    height: "56px",
                    borderRadius: "28px",
                    border: "none",
                    background: "var(--oneui-bg-card)",
                    color: "var(--oneui-text-primary)",
                    fontSize: "22px",
                    cursor: "pointer",
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
            <button
              data-testid="phone-call-btn"
              onClick={() => placeCall(digits)}
              style={{
                marginTop: "16px",
                width: "100%",
                height: "48px",
                borderRadius: "24px",
                border: "none",
                background: "#34c759",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Call
            </button>
          </div>
        )}

        {tab === "recents" && (
          <div data-testid="phone-recents">
            {RECENTS.map((row) => (
              <button
                key={row.number}
                onClick={() => placeCall(row.number)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--oneui-separator)",
                  padding: "14px 4px",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 500 }}>{row.name}</div>
                <div style={{ fontSize: "13px", color: "var(--oneui-text-secondary)" }}>{row.number} · {row.time}</div>
              </button>
            ))}
          </div>
        )}

        {tab === "contacts" && (
          <div data-testid="phone-contacts">
            {CONTACTS.map((row) => (
              <button
                key={row.number}
                onClick={() => placeCall(row.number)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--oneui-separator)",
                  padding: "14px 4px",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 500 }}>{row.name}</div>
                <div style={{ fontSize: "13px", color: "var(--oneui-text-secondary)" }}>{row.number}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {calling && (
        <div
          data-testid="phone-call-screen"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            background: "#0e1116",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "24px",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.7 }}>Simulated call</div>
          <div style={{ fontSize: "28px", fontWeight: 300 }}>{calling}</div>
          <div style={{ fontSize: "13px", opacity: 0.6, textAlign: "center", maxWidth: "240px" }}>
            No cellular call is placed. This stays inside the FixBy phone.
          </div>
          <button
            onClick={() => setCalling(null)}
            style={{
              marginTop: "24px",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              border: "none",
              background: "#ff3b30",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            End
          </button>
        </div>
      )}
    </div>
  );
}
