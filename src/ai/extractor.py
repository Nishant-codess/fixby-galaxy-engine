"""
src/ai/extractor.py

Domain-specific, multi-resolution plan generator.
Returns 2-4 ranked solutions per query with confidence scores
and detailed step-by-step instructions.
"""
from typing import List, Dict
from contracts.schema import Goal, Action, StepGroup, ActionCategory

# ──────────────────────────────────────────────────────────────
# Domain → multiple resolution paths (Task 2.1 + 4.1)
# Each domain has 2-4 ranked solutions with steps and deeplink IDs
# ──────────────────────────────────────────────────────────────
DOMAIN_RESOLUTION_MAP: Dict[str, List[Dict]] = {
    "battery.rapid_drain": [
        {
            "title": "Battery drain",
            "confidence": 0.92,
            "actions": [
                {
                    "name": "Limit Background Apps",
                    "description": "It will restrict background app activity",
                    "category": "auto",
                    "deeplink_id": "DL_BG_LIMITS",
                    "steps": [
                        "Open Settings on your Galaxy device",
                        "Tap Battery",
                        "Tap Background usage limits",
                        "Turn on 'Put unused apps to sleep'"
                    ]
                },
                {
                    "name": "Enable Battery Protection",
                    "description": "It will extend overall battery lifespan",
                    "category": "auto",
                    "deeplink_id": "DL_BATTERY_PROTECT",
                    "steps": [
                        "Open Settings",
                        "Tap Battery",
                        "Tap Battery protection",
                        "Select Adaptive mode"
                    ]
                },
                {
                    "name": "Optimize Device",
                    "description": "It will clean background processes automatically",
                    "category": "auto",
                    "deeplink_id": "DL_DEVICE_CARE_OPTIMIZE",
                    "steps": [
                        "Open Settings",
                        "Tap Device care",
                        "Tap Optimize now",
                        "Wait for optimization to complete"
                    ]
                },
            ]
        },
    ],
    "battery.overheating": [
        {
            "title": "Device overheating",
            "confidence": 0.90,
            "actions": [
                {
                    "name": "Optimize Device Performance",
                    "description": "It will reduce CPU load significantly",
                    "category": "auto",
                    "deeplink_id": "DL_DEVICE_CARE_OPTIMIZE",
                    "steps": [
                        "Open Settings",
                        "Tap Device care",
                        "Tap Optimize now",
                        "Close all background apps"
                    ]
                },
                {
                    "name": "Limit Background Usage",
                    "description": "It will prevent background battery drain",
                    "category": "auto",
                    "deeplink_id": "DL_BG_LIMITS",
                    "steps": [
                        "Open Settings",
                        "Tap Battery",
                        "Tap Background usage limits",
                        "Put heavy apps to deep sleep"
                    ]
                },
                {
                    "name": "Reduce Display Refresh Rate",
                    "description": "It will lower processor workload effectively",
                    "category": "auto",
                    "deeplink_id": "DL_DISPLAY_MOTION",
                    "steps": [
                        "Open Settings",
                        "Tap Display",
                        "Tap Motion smoothness",
                        "Select Standard (60Hz)"
                    ]
                },
            ]
        },
    ],
    "battery.unexpected_shutdown": [
        {
            "title": "Unexpected shutdown",
            "confidence": 0.85,
            "actions": [
                {
                    "name": "Check Battery Health",
                    "description": "It will show battery health status",
                    "category": "auto",
                    "deeplink_id": "DL_BATTERY_CARE",
                    "steps": [
                        "Open Settings",
                        "Tap Battery",
                        "Check battery usage details",
                        "Look for abnormal drain patterns"
                    ]
                },
                {
                    "name": "Optimize Device",
                    "description": "It will clear problematic background processes",
                    "category": "auto",
                    "deeplink_id": "DL_DEVICE_CARE_OPTIMIZE",
                    "steps": [
                        "Open Settings",
                        "Tap Device care",
                        "Tap Optimize now",
                        "Restart your device after optimization"
                    ]
                },
                {
                    "name": "Check Software Update",
                    "description": "It will install latest stability patches",
                    "category": "auto",
                    "deeplink_id": "DL_SOFTWARE_UPDATE",
                    "steps": [
                        "Open Settings",
                        "Tap Software update",
                        "Tap Download and install",
                        "Install any available updates"
                    ]
                },
            ]
        },
    ],
    "battery.slow_charging": [
        {
            "title": "Slow charging",
            "confidence": 0.88,
            "actions": [
                {
                    "name": "Enable Fast Charging",
                    "description": "It will enable fast charging mode",
                    "category": "auto",
                    "deeplink_id": "DL_CHARGING_SETTINGS",
                    "steps": [
                        "Open Settings",
                        "Tap Battery",
                        "Tap Charging settings",
                        "Enable Fast charging and Super fast charging"
                    ]
                },
                {
                    "name": "Check Battery Protection",
                    "description": "It will adjust charging speed limits",
                    "category": "auto",
                    "deeplink_id": "DL_BATTERY_PROTECT",
                    "steps": [
                        "Open Settings",
                        "Tap Battery",
                        "Tap Battery protection",
                        "Check if protection is limiting charge speed"
                    ]
                },
            ]
        },
    ],
    "display.dark_mode": [
        {
            "title": "Dark mode",
            "confidence": 0.95,
            "actions": [
                {
                    "name": "Toggle Dark Mode",
                    "description": "It will enable dark mode theme",
                    "category": "auto",
                    "deeplink_id": "DL_DARK_MODE",
                    "steps": [
                        "Open Settings",
                        "Tap Display",
                        "Tap Dark mode",
                        "Toggle Dark mode ON"
                    ]
                },
            ]
        },
    ],
    "display.gesture_navigation": [
        {
            "title": "Navigation gestures",
            "confidence": 0.93,
            "actions": [
                {
                    "name": "Configure Navigation Bar",
                    "description": "It will set correct swipe gestures",
                    "category": "auto",
                    "deeplink_id": "DL_NAVIGATION_BAR",
                    "steps": [
                        "Open Settings",
                        "Tap Display",
                        "Tap Navigation bar",
                        "Select Swipe gestures or Buttons"
                    ]
                },
            ]
        },
    ],
    "display.motion_stutter": [
        {
            "title": "Screen stutter",
            "confidence": 0.90,
            "actions": [
                {
                    "name": "Adjust Refresh Rate",
                    "description": "It will enable smooth 120Hz display",
                    "category": "auto",
                    "deeplink_id": "DL_DISPLAY_MOTION",
                    "steps": [
                        "Open Settings",
                        "Tap Display",
                        "Tap Motion smoothness",
                        "Select Adaptive (120Hz)"
                    ]
                },
            ]
        },
    ],
    "display.touch_unresponsive": [
        {
            "title": "Touch sensitivity",
            "confidence": 0.88,
            "actions": [
                {
                    "name": "Increase Touch Sensitivity",
                    "description": "It will improve touch screen response",
                    "category": "auto",
                    "deeplink_id": "DL_DISPLAY_TOUCH",
                    "steps": [
                        "Open Settings",
                        "Tap Display",
                        "Tap Touch sensitivity",
                        "Toggle Touch sensitivity ON"
                    ]
                },
            ]
        },
    ],
    "display.brightness": [
        {
            "title": "Brightness adjustment",
            "confidence": 0.92,
            "actions": [
                {
                    "name": "Adjust Brightness Settings",
                    "description": "It will configure screen brightness levels",
                    "category": "auto",
                    "deeplink_id": "DL_DISPLAY_BRIGHTNESS",
                    "steps": [
                        "Open Settings",
                        "Tap Display",
                        "Adjust the brightness slider",
                        "Toggle Adaptive brightness ON/OFF"
                    ]
                },
            ]
        },
    ],
    "camera.crash_or_slow": [
        {
            "title": "Camera issues",
            "confidence": 0.91,
            "actions": [
                {
                    "name": "Clear Camera Cache",
                    "description": "It will reset camera app data",
                    "category": "auto",
                    "deeplink_id": "DL_CAMERA_SETTINGS",
                    "steps": [
                        "Open Settings",
                        "Tap Apps",
                        "Find and tap Camera",
                        "Tap Storage, then Clear cache"
                    ]
                },
                {
                    "name": "Check Camera Permissions",
                    "description": "It will verify camera app permissions",
                    "category": "auto",
                    "deeplink_id": "DL_CAMERA_SETTINGS",
                    "steps": [
                        "Open Settings",
                        "Tap Apps",
                        "Find and tap Camera",
                        "Tap Permissions and enable all"
                    ]
                },
                {
                    "name": "Clean Camera Lens",
                    "description": "It will improve photo clarity significantly",
                    "category": "manual",
                    "deeplink_id": None,
                    "steps": [
                        "Use a soft microfiber cloth",
                        "Gently wipe the camera lens",
                        "Check for scratches or smudges",
                        "Try taking a photo to test"
                    ]
                },
                {
                    "name": "Update Camera Software",
                    "description": "It will install latest camera fixes",
                    "category": "auto",
                    "deeplink_id": "DL_SOFTWARE_UPDATE",
                    "steps": [
                        "Open Settings",
                        "Tap Software update",
                        "Tap Download and install",
                        "Restart device after update"
                    ]
                },
            ]
        },
    ],
    "performance.general_lag": [
        {
            "title": "Device performance",
            "confidence": 0.88,
            "actions": [
                {
                    "name": "Clear RAM Memory",
                    "description": "It will free up device memory",
                    "category": "auto",
                    "deeplink_id": "DL_DEVICE_CARE_MEMORY",
                    "steps": [
                        "Open Settings",
                        "Tap Device care",
                        "Tap Memory",
                        "Tap Clean now"
                    ]
                },
                {
                    "name": "Optimize Device",
                    "description": "It will scan and fix performance",
                    "category": "auto",
                    "deeplink_id": "DL_DEVICE_CARE_OPTIMIZE",
                    "steps": [
                        "Open Settings",
                        "Tap Device care",
                        "Tap Optimize now",
                        "Wait for optimization to finish"
                    ]
                },
                {
                    "name": "Reduce Refresh Rate",
                    "description": "It will lower display processing load",
                    "category": "auto",
                    "deeplink_id": "DL_DISPLAY_MOTION",
                    "steps": [
                        "Open Settings",
                        "Tap Display",
                        "Tap Motion smoothness",
                        "Select Standard (60Hz)"
                    ]
                },
            ]
        },
    ],
    "performance.app_crash": [
        {
            "title": "App crash fix",
            "confidence": 0.87,
            "actions": [
                {
                    "name": "Clear App Cache",
                    "description": "It will reset problematic app data",
                    "category": "auto",
                    "deeplink_id": "DL_APPS_MANAGEMENT",
                    "steps": [
                        "Open Settings",
                        "Tap Apps",
                        "Find the crashing app",
                        "Tap Storage, then Clear cache"
                    ]
                },
                {
                    "name": "Check Software Updates",
                    "description": "It will install latest stability patches",
                    "category": "auto",
                    "deeplink_id": "DL_SOFTWARE_UPDATE",
                    "steps": [
                        "Open Settings",
                        "Tap Software update",
                        "Tap Download and install",
                        "Update if available"
                    ]
                },
            ]
        },
    ],
    "performance.storage_pressure": [
        {
            "title": "Storage cleanup",
            "confidence": 0.93,
            "actions": [
                {
                    "name": "Clean Device Storage",
                    "description": "It will free up storage space",
                    "category": "auto",
                    "deeplink_id": "DL_DEVICE_CARE_STORAGE",
                    "steps": [
                        "Open Settings",
                        "Tap Device care",
                        "Tap Storage",
                        "Delete unnecessary files and apps"
                    ]
                },
                {
                    "name": "Clear App Caches",
                    "description": "It will remove cached temporary files",
                    "category": "auto",
                    "deeplink_id": "DL_APPS_MANAGEMENT",
                    "steps": [
                        "Open Settings",
                        "Tap Apps",
                        "Sort by size (largest first)",
                        "Clear cache for large apps"
                    ]
                },
            ]
        },
    ],
    "connectivity.wifi_drop": [
        {
            "title": "Wi-Fi connectivity",
            "confidence": 0.90,
            "actions": [
                {
                    "name": "Reset Wi-Fi Settings",
                    "description": "It will fix Wi-Fi connection issues",
                    "category": "auto",
                    "deeplink_id": "DL_WIFI_SETTINGS",
                    "steps": [
                        "Open Settings",
                        "Tap Connections",
                        "Tap Wi-Fi",
                        "Forget the network and reconnect"
                    ]
                },
                {
                    "name": "Reset Network Settings",
                    "description": "It will reset all network configurations",
                    "category": "auto",
                    "deeplink_id": "DL_RESET_NETWORK",
                    "steps": [
                        "Open Settings",
                        "Tap General management",
                        "Tap Reset",
                        "Tap Reset network settings"
                    ]
                },
            ]
        },
    ],
    "connectivity.bluetooth": [
        {
            "title": "Bluetooth connection",
            "confidence": 0.91,
            "actions": [
                {
                    "name": "Reset Bluetooth Pairing",
                    "description": "It will fix Bluetooth connection issues",
                    "category": "auto",
                    "deeplink_id": "DL_BLUETOOTH_SETTINGS",
                    "steps": [
                        "Open Settings",
                        "Tap Connections",
                        "Tap Bluetooth",
                        "Unpair and re-pair the device"
                    ]
                },
                {
                    "name": "Reset Network Settings",
                    "description": "It will reset all Bluetooth pairings",
                    "category": "auto",
                    "deeplink_id": "DL_RESET_NETWORK",
                    "steps": [
                        "Open Settings",
                        "Tap General management",
                        "Tap Reset",
                        "Tap Reset network settings"
                    ]
                },
            ]
        },
    ],
    "connectivity.mobile_data": [
        {
            "title": "Mobile data fix",
            "confidence": 0.88,
            "actions": [
                {
                    "name": "Check Mobile Data Settings",
                    "description": "It will verify mobile data configuration",
                    "category": "auto",
                    "deeplink_id": "DL_MOBILE_DATA",
                    "steps": [
                        "Open Settings",
                        "Tap Connections",
                        "Tap Mobile networks",
                        "Ensure Mobile data is toggled ON"
                    ]
                },
                {
                    "name": "Reset Network Settings",
                    "description": "It will reset all network configurations",
                    "category": "auto",
                    "deeplink_id": "DL_RESET_NETWORK",
                    "steps": [
                        "Open Settings",
                        "Tap General management",
                        "Tap Reset",
                        "Tap Reset network settings"
                    ]
                },
            ]
        },
    ],
    "connectivity.hotspot": [
        {
            "title": "Hotspot settings",
            "confidence": 0.90,
            "actions": [
                {
                    "name": "Configure Mobile Hotspot",
                    "description": "It will set up hotspot sharing",
                    "category": "auto",
                    "deeplink_id": "DL_HOTSPOT",
                    "steps": [
                        "Open Settings",
                        "Tap Connections",
                        "Tap Mobile hotspot and tethering",
                        "Toggle Mobile hotspot ON"
                    ]
                },
            ]
        },
    ],
    "privacy.location": [
        {
            "title": "Location settings",
            "confidence": 0.94,
            "actions": [
                {
                    "name": "Toggle Location Services",
                    "description": "It will manage location access settings",
                    "category": "auto",
                    "deeplink_id": "DL_LOCATION",
                    "steps": [
                        "Open Settings",
                        "Tap Location",
                        "Toggle Location ON or OFF",
                        "Manage app location permissions below"
                    ]
                },
            ]
        },
    ],
    "privacy.permissions": [
        {
            "title": "App permissions",
            "confidence": 0.90,
            "actions": [
                {
                    "name": "Manage App Permissions",
                    "description": "It will adjust app permission settings",
                    "category": "auto",
                    "deeplink_id": "DL_PRIVACY",
                    "steps": [
                        "Open Settings",
                        "Tap Security and privacy",
                        "Tap Permission manager",
                        "Select the permission to manage"
                    ]
                },
            ]
        },
    ],
    "sound.volume_issue": [
        {
            "title": "Sound settings",
            "confidence": 0.90,
            "actions": [
                {
                    "name": "Adjust Sound Settings",
                    "description": "It will configure volume and sound",
                    "category": "auto",
                    "deeplink_id": "DL_SOUND",
                    "steps": [
                        "Open Settings",
                        "Tap Sounds and vibration",
                        "Adjust volume sliders as needed",
                        "Check sound mode (Sound/Vibrate/Silent)"
                    ]
                },
            ]
        },
    ],
    "notifications.not_showing": [
        {
            "title": "Notification settings",
            "confidence": 0.89,
            "actions": [
                {
                    "name": "Check Notification Settings",
                    "description": "It will fix notification display issues",
                    "category": "auto",
                    "deeplink_id": "DL_NOTIFICATIONS",
                    "steps": [
                        "Open Settings",
                        "Tap Notifications",
                        "Check app notification settings",
                        "Disable Do Not Disturb if active"
                    ]
                },
            ]
        },
    ],
    "software.update": [
        {
            "title": "Software update",
            "confidence": 0.95,
            "actions": [
                {
                    "name": "Check Software Update",
                    "description": "It will find available system updates",
                    "category": "auto",
                    "deeplink_id": "DL_SOFTWARE_UPDATE",
                    "steps": [
                        "Open Settings",
                        "Tap Software update",
                        "Tap Download and install",
                        "Follow on-screen instructions"
                    ]
                },
            ]
        },
    ],
    "accounts.sync": [
        {
            "title": "Account sync",
            "confidence": 0.88,
            "actions": [
                {
                    "name": "Manage Account Sync",
                    "description": "It will fix account synchronization issues",
                    "category": "auto",
                    "deeplink_id": "DL_ACCOUNTS",
                    "steps": [
                        "Open Settings",
                        "Tap Accounts and backup",
                        "Select your account",
                        "Toggle Sync settings ON"
                    ]
                },
            ]
        },
    ],
}


def extract_structured_plan(query: str, candidate_ids: List[str], siis_response: str) -> List[Goal]:
    """Generate domain-specific, multi-resolution plans.

    Returns 1-4 ranked Goal objects based on the classified domain,
    with detailed steps and appropriate deeplink IDs.
    """
    from src.core.taxonomy import SYMPTOM_TAXONOMY, classify_complaint_taxonomy

    categories, confidence = classify_complaint_taxonomy(query)

    # Reject out-of-scope queries (fridge, meaning of life, gibberish)
    lower = query.lower()
    has_match = any(any(kw in lower for kw in data["keywords"]) for data in SYMPTOM_TAXONOMY.values())
    if not has_match and len(lower.split()) > 2 and "phone" not in lower:
        return []

    goals = []
    seen_domains = set()

    for cat_id in categories[:3]:  # Process top 3 matched categories
        if cat_id in seen_domains:
            continue
        seen_domains.add(cat_id)

        resolutions = DOMAIN_RESOLUTION_MAP.get(cat_id, [])
        if not resolutions:
            # Fallback: generate a generic resolution from the taxonomy
            data = SYMPTOM_TAXONOMY.get(cat_id, {})
            deeplink_id = data.get("default_deeplink_id", candidate_ids[0] if candidate_ids else None)

            sg = StepGroup(steps=["Open Settings", "Navigate to the relevant section"])
            setattr(sg, "_deeplink_id_staging", deeplink_id)

            action = Action(
                actionName=f"Fix {data.get('subsystem', 'Device')} Issue",
                description=f"It will resolve {data.get('subsystem', 'device').lower()} issues quickly",
                stepGroups=[sg],
                category=ActionCategory.auto
            )
            goal = Goal(
                goal="Follow these steps to perform this Troubleshooting",
                title=f"{data.get('subsystem', 'Device')} fix",
                actions=[action],
                score=confidence * 0.7
            )
            goals.append(goal)
            continue

        for resolution in resolutions:
            actions = []
            for action_data in resolution["actions"]:
                sg = StepGroup(steps=action_data["steps"])
                deeplink_id = action_data.get("deeplink_id")
                setattr(sg, "_deeplink_id_staging", deeplink_id)

                category = ActionCategory.auto
                if action_data.get("category") == "manual":
                    category = ActionCategory.manual
                elif action_data.get("category") == "critical":
                    category = ActionCategory.critical

                action = Action(
                    actionName=action_data["name"],
                    description=action_data["description"],
                    stepGroups=[sg],
                    category=category
                )
                actions.append(action)

            goal = Goal(
                goal="Follow these steps to perform this Troubleshooting",
                title=resolution["title"],
                actions=actions,
                score=resolution["confidence"] * confidence
            )
            goals.append(goal)

    return goals if goals else []
