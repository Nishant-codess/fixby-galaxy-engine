# tests/test_domain_rigidity.py — Cross-Domain Rigidity & Zero-Leakage Benchmark
import pytest
from src.core.pipeline import run_troubleshoot_pipeline
from src.core.taxonomy import extract_slots, classify_complaint_taxonomy

TEST_CASES = [
    # (query, expected_domain, expected_path_contains)
    ("camera is notworking", "camera", "Camera"),
    ("camera is not working", "camera", "Camera"),
    ("camera crashing and photos blurry", "camera", "Camera"),
    ("battery draining fast", "battery", "Battery"),
    ("phone is overheating and getting hot", "battery", "Performance profile"),
    ("screen refresh rate 120hz stutter", "display", "Display"),
    ("touch screen unresponsive", "display", "Display"),
    ("screen timeout turns off too fast", "display", "Display"),
    ("wifi keeps disconnecting from network", "connectivity", "Wi-Fi"),
    ("bluetooth disconnects from earbuds", "connectivity", "Bluetooth"),
    ("speaker distortion and sound crackling", "sound", "Sound"),
    ("phone storage full clean trash", "storage", "Storage"),
    ("clean ram memory apps close", "performance", "Memory"),
    ("fingerprint sensor not working", "security", "Fingerprint"),
    ("notifications vibrating at night sleep", "notifications", "Do not disturb"),
]


@pytest.mark.parametrize("query,expected_domain,expected_path_contains", TEST_CASES)
def test_domain_rigidity_and_no_battery_leakage(query, expected_domain, expected_path_contains):
    # 1. Slot extraction must match expected domain
    slots = extract_slots(query)
    assert slots["domain"] == expected_domain, f"Slot domain mismatch for '{query}': got {slots['domain']}, expected {expected_domain}"

    # 2. Pipeline execution must resolve to target domain and never leak to Battery unless domain IS battery
    resp = run_troubleshoot_pipeline(query)
    assert len(resp.response.contexts) > 0
    first_action = resp.response.contexts[0].actions[0]
    sg = first_action.stepGroups[0]
    deeplink_path = sg.actionableDeeplink.classes.get("path", "") if (sg.actionableDeeplink and sg.actionableDeeplink.classes) else ""

    assert expected_path_contains.lower() in deeplink_path.lower(), (
        f"Query '{query}' resolved to wrong path '{deeplink_path}'. Expected to contain '{expected_path_contains}'."
    )

    if expected_domain != "battery":
        assert "battery>background usage limits" not in deeplink_path.lower(), (
            f"Query '{query}' leaked into Battery Background Limits! Path: {deeplink_path}"
        )
