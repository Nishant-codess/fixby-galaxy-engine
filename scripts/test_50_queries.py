#!/usr/bin/env python3
"""
Fixby Galaxy Engine — 50-Query Edge Case Test Suite
Tests every domain, compound scenario, and edge case in the SIIS decision matrix.
"""

import json
import time
import requests
import sys

BASE_URL = "http://localhost:8000"
API_KEY  = "test-api-key-123"
HEADERS  = {"Content-Type": "application/json", "X-API-Key": API_KEY}

# ── Colour helpers ────────────────────────────────────────────────────────────
G = "\033[92m"   # green
R = "\033[91m"   # red
Y = "\033[93m"   # yellow
B = "\033[94m"   # blue
W = "\033[97m"   # white/bold
D = "\033[90m"   # dim
RST = "\033[0m"

def healthy():
    return {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"}

# ── Test cases ─────────────────────────────────────────────────────────────────
# Format: (id, description, query, siis_dict, expected_keyword_in_path)
# expected is a list of strings — if ANY one is found in the top result path ✓
TEST_CASES = [
    # ── GROUP A: Storage Domain (A1–A6) ──────────────────────────────────────
    ("A1", "Storage critical single threshold (95%)",
     "My phone says storage is almost full.",
     {"batteryLevel": 80, "storageUsed": 96, "temperature": 32, "signalStrength": "Excellent"},
     ["Storage", "storage"]),

    ("A2", "Storage high but below critical (80-94%)",
     "There's not enough space on my phone to download anything.",
     {"batteryLevel": 80, "storageUsed": 82, "temperature": 32, "signalStrength": "Excellent"},
     ["Storage", "storage"]),

    ("A3", "Storage moderate (50%) — just curious",
     "How much storage is my phone using?",
     {"batteryLevel": 80, "storageUsed": 50, "temperature": 32, "signalStrength": "Excellent"},
     ["Storage", "storage"]),

    ("A4", "Storage full causing slow performance",
     "My phone is slow and I have no space left.",
     {"batteryLevel": 80, "storageUsed": 90, "temperature": 32, "signalStrength": "Excellent"},
     ["Storage", "storage"]),

    ("A5", "Storage full — trash/junk",
     "How do I delete junk files and clear trash on my Samsung?",
     {"batteryLevel": 80, "storageUsed": 85, "temperature": 32, "signalStrength": "Excellent"},
     ["Storage", "storage"]),

    ("A6", "Storage critical + low battery (compound emergency)",
     "I can't install any app, my phone is completely full.",
     {"batteryLevel": 10, "storageUsed": 97, "temperature": 32, "signalStrength": "Excellent"},
     ["Auto optimization", "Storage", "Power saving"]),

    # ── GROUP B: Battery Domain (B1–B8) ──────────────────────────────────────
    ("B1", "Battery healthy — drain audit",
     "Why is my battery draining so fast these days?",
     {"batteryLevel": 72, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Battery usage", "background"]),

    ("B2", "Battery low (15%) — needs power saving",
     "My battery is almost dead, how do I save it?",
     {"batteryLevel": 14, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Power saving"]),

    ("B3", "Battery moderate (25%) — background limits",
     "Battery is going down very quickly, it's at 25%.",
     {"batteryLevel": 25, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Background usage", "Power saving"]),

    ("B4", "Charging not working",
     "My phone is not charging even when plugged in.",
     {"batteryLevel": 5, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Power saving", "Battery"]),

    ("B5", "Fast charge not working",
     "Fast charging stopped working suddenly.",
     {"batteryLevel": 50, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Battery", "background"]),

    ("B6", "Battery percentage jumping around",
     "My battery percentage keeps jumping from 30% to 15% randomly.",
     {"batteryLevel": 40, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Battery usage", "background"]),

    ("B7", "Low battery + overheating (compound Tier-1)",
     "Phone is hot and battery is dying fast.",
     {"batteryLevel": 13, "storageUsed": 40, "temperature": 58, "signalStrength": "Excellent"},
     ["Game Booster", "Power saving", "Background", "Auto optimization"]),

    ("B8", "Battery drain overnight",
     "My phone loses 30% battery charge overnight when I'm sleeping.",
     {"batteryLevel": 68, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Battery usage", "background"]),

    # ── GROUP C: Connectivity Domain (C1–C8) ──────────────────────────────────
    ("C1", "Slow internet, weak signal",
     "My internet is super slow and YouTube keeps buffering.",
     {"batteryLevel": 70, "storageUsed": 40, "temperature": 32, "signalStrength": "Weak"},
     ["Mobile networks", "Wi-Fi"]),

    ("C2", "Wi-Fi connectivity issue, healthy hardware",
     "My Wi-Fi keeps disconnecting every few minutes.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Reset network", "Wi-Fi", "Connections"]),

    ("C3", "No signal in certain area",
     "I have zero signal in my office, calls are dropping.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "None"},
     ["Mobile networks", "Wi-Fi calling"]),

    ("C4", "Bluetooth not connecting",
     "My Bluetooth headphones won't connect to my Samsung phone.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Reset network", "Connections", "Bluetooth"]),

    ("C5", "Mobile data not working",
     "Mobile data is not working after inserting a new SIM card.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Weak"},
     ["Mobile networks"]),

    ("C6", "VPN issues",
     "My VPN keeps disconnecting on my Samsung.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Reset network", "Connections", "VPN"]),

    ("C7", "Hotspot not working",
     "I can't share my mobile hotspot with my laptop.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Connections", "Reset network"]),

    ("C8", "Weak signal + low battery (compound)",
     "My phone has no internet and battery is very low.",
     {"batteryLevel": 12, "storageUsed": 40, "temperature": 32, "signalStrength": "None"},
     ["Power saving", "Auto optimization", "Mobile networks"]),

    # ── GROUP D: Performance Domain (D1–D7) ────────────────────────────────────
    ("D1", "Phone slow, normal hardware",
     "My Samsung Galaxy S23 feels really sluggish while scrolling.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Memory", "Device care", "RAM"]),

    ("D2", "Apps randomly closing",
     "Apps keep closing by themselves and sending me back to home screen.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Memory", "RAM", "Device care"]),

    ("D3", "Phone lagging after an update",
     "Ever since the software update, my phone has been incredibly slow.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Memory", "Device care", "Performance profile"]),

    ("D4", "Phone freezing randomly",
     "My phone freezes for 5 seconds randomly throughout the day.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Memory", "Device care", "Performance"]),

    ("D5", "Slow performance + high storage",
     "Everything is slow and storage is 85% full.",
     {"batteryLevel": 75, "storageUsed": 85, "temperature": 32, "signalStrength": "Excellent"},
     ["Storage", "storage"]),

    ("D6", "Performance + low battery",
     "Phone is lagging and battery is at 28%.",
     {"batteryLevel": 28, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Power saving", "Storage", "Memory"]),

    ("D7", "Phone rebooting on its own",
     "My phone suddenly restarts by itself, especially when gaming.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Memory", "Device care", "Performance profile"]),

    # ── GROUP E: Thermal Domain (E1–E4) ────────────────────────────────────────
    ("E1", "Overheating during gaming",
     "My phone gets really hot when playing Call of Duty Mobile.",
     {"batteryLevel": 60, "storageUsed": 40, "temperature": 62, "signalStrength": "Excellent"},
     ["Performance profile", "Game Booster", "Thermal"]),

    ("E2", "Overheating while charging",
     "My phone burns up when I use it while charging.",
     {"batteryLevel": 55, "storageUsed": 40, "temperature": 58, "signalStrength": "Excellent"},
     ["Performance profile", "Game Booster"]),

    ("E3", "Overheating causes throttling",
     "My phone becomes super slow when it gets hot.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 57, "signalStrength": "Excellent"},
     ["Performance profile", "Game Booster"]),

    ("E4", "Overheating + low battery + storage full (3-way compound)",
     "Phone is on fire, battery is 5%, storage is full!",
     {"batteryLevel": 5, "storageUsed": 98, "temperature": 72, "signalStrength": "Excellent"},
     ["Auto optimization", "Storage", "Performance profile", "Power saving"]),

    # ── GROUP F: Named App Pre-Pass (F1–F10) ────────────────────────────────────
    ("F1", "Instagram crashing — healthy hardware",
     "Instagram keeps crashing every time I open it.",
     {"batteryLevel": 80, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Instagram"]),

    ("F2", "WhatsApp freezing",
     "WhatsApp is frozen and not sending messages.",
     {"batteryLevel": 80, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["WhatsApp"]),

    ("F3", "TikTok buffering (weak signal should override app-pass)",
     "TikTok videos keep buffering and loading very slowly.",
     {"batteryLevel": 80, "storageUsed": 40, "temperature": 32, "signalStrength": "Weak"},
     ["Mobile networks", "Wi-Fi"]),

    ("F4", "Snapchat not opening",
     "Snapchat won't open at all, it just crashes immediately.",
     {"batteryLevel": 80, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Snapchat"]),

    ("F5", "YouTube lag — healthy hardware",
     "YouTube keeps stopping and lagging, it's very frustrating.",
     {"batteryLevel": 80, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["YouTube"]),

    ("F6", "Spotify glitching",
     "Spotify is glitching and randomly skipping songs.",
     {"batteryLevel": 80, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Spotify"]),

    ("F7", "Netflix not loading",
     "Netflix is not loading any shows, it just shows a blank screen.",
     {"batteryLevel": 80, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Netflix"]),

    ("F8", "Genshin Impact overheating — should use thermal route since temp is 65°C",
     "Genshin Impact makes my phone burn up so badly.",
     {"batteryLevel": 55, "storageUsed": 40, "temperature": 65, "signalStrength": "Excellent"},
     ["Game Booster", "Performance profile", "Thermal"]),

    ("F9", "Camera not working — domain should be camera",
     "My camera is not working, it just shows a black screen.",
     {"batteryLevel": 80, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Camera", "camera"]),

    ("F10", "Chrome hanging — healthy",
     "Chrome browser is hanging and not loading any websites.",
     {"batteryLevel": 80, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Chrome"]),

    # ── GROUP G: Display & Sound (G1–G4) ────────────────────────────────────────
    ("G1", "Screen flickering",
     "My phone screen is flickering randomly throughout the day.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Motion smoothness", "Display", "brightness"]),

    ("G2", "Screen too dim, can't read outside",
     "My screen is too dark and I can't see it in sunlight.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["brightness", "Display", "Adaptive"]),

    ("G3", "Speaker sound is distorted",
     "My phone speaker sounds very crackly and distorted.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Sound quality", "Dolby", "Sounds"]),

    ("G4", "No sound from earphones",
     "My earphones are plugged in but there's no sound.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Sound quality", "Sounds"]),

    # ── GROUP H: Security & Wellbeing (H1–H3) ──────────────────────────────────
    ("H1", "Fingerprint not working",
     "My fingerprint sensor is not recognizing my finger anymore.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Fingerprint", "Biometric", "Security"]),

    ("H2", "Too many notifications annoying me",
     "I'm getting way too many notifications and it's very distracting.",
     {"batteryLevel": 75, "storageUsed": 40, "temperature": 32, "signalStrength": "Excellent"},
     ["Do not disturb", "Notifications"]),

    ("H3", "Completely maxed hardware + vague query",
     "Everything on my phone is broken.",
     {"batteryLevel": 5, "storageUsed": 99, "temperature": 73, "signalStrength": "None"},
     ["Auto optimization", "Device care"]),
]

# ── Test runner ────────────────────────────────────────────────────────────────
def clear_cache():
    requests.post(f"{BASE_URL}/v1/cache/clear", headers=HEADERS)

def run_query(query, siis_dict):
    payload = {
        "query": query,
        "context": {},
        "siis_response": json.dumps(siis_dict)
    }
    r = requests.post(f"{BASE_URL}/v1/troubleshoot", headers=HEADERS, json=payload, timeout=30)
    r.raise_for_status()
    data = r.json()
    contexts = data["response"]["contexts"]
    if not contexts:
        return [], "No contexts returned"
    paths = []
    for ctx in contexts[:4]:
        try:
            path = ctx["actions"][0]["stepGroups"][0]["actionableDeeplink"]["classes"]["path"]
            paths.append(path)
        except (KeyError, IndexError):
            paths.append("<no path>")
    return paths, None

def check(paths, expected_keywords):
    full = " ".join(paths)
    for kw in expected_keywords:
        if kw.lower() in full.lower():
            return True
    return False

def main():
    print(f"\n{B}{'='*70}{RST}")
    print(f"{W}  Fixby Galaxy Engine — 50-Query Edge Case Test Suite{RST}")
    print(f"{B}{'='*70}{RST}\n")

    clear_cache()
    time.sleep(0.2)

    results = []
    passed = 0
    failed = 0
    fail_ids = []

    for idx, (test_id, desc, query, siis_dict, expected) in enumerate(TEST_CASES, 1):
        clear_cache()  # Fresh cache for every test — no cross-contamination
        try:
            paths, err = run_query(query, siis_dict)
            if err:
                ok = False
                top_path = err
            else:
                ok = check(paths, expected)
                top_path = paths[0] if paths else "<empty>"
        except Exception as e:
            ok = False
            top_path = f"ERROR: {e}"
            paths = []

        colour = G if ok else R
        status = "✓ PASS" if ok else "✗ FAIL"
        passed += ok
        if not ok:
            failed += 1
            fail_ids.append(test_id)

        siis_summary = (
            f"Batt:{siis_dict['batteryLevel']}% "
            f"Sto:{siis_dict['storageUsed']}% "
            f"Temp:{siis_dict['temperature']}°C "
            f"Sig:{siis_dict['signalStrength']}"
        )

        print(f"{colour}[{test_id}] {status}{RST}  {W}{desc}{RST}")
        print(f"  {D}Query:{RST} {query}")
        print(f"  {D}SIIS:{RST}  {siis_summary}")
        print(f"  {D}Top result:{RST} {colour}{top_path}{RST}")
        if len(paths) > 1:
            print(f"  {D}Other results:{RST} {' | '.join(paths[1:3])}")
        print(f"  {D}Expected any of:{RST} {expected}")
        print()
        results.append((test_id, ok, top_path, expected))

    # Summary
    print(f"{B}{'='*70}{RST}")
    print(f"  RESULTS: {G}{passed} PASSED{RST}  {R}{failed} FAILED{RST}  (Total: {len(TEST_CASES)})")
    if fail_ids:
        print(f"  {R}Failed IDs: {', '.join(fail_ids)}{RST}")
    print(f"{B}{'='*70}{RST}\n")

    # Machine-readable output for the fixer script
    with open("/tmp/fixby_test_results.json", "w") as f:
        json.dump({
            "passed": passed,
            "failed": failed,
            "total": len(TEST_CASES),
            "fail_ids": fail_ids,
            "details": [
                {"id": t, "ok": ok, "top_path": path, "expected": exp}
                for t, ok, path, exp in results
            ]
        }, f, indent=2)

    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
