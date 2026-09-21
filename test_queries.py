import json
from src.core.pipeline import run_troubleshoot_pipeline

queries = [
    {
        "q": "My phone is suddenly acting super slow and lagging when I open apps.",
        "telemetry": {"storageUsed": 98, "temperature": 32, "batteryLevel": 80, "signalStrength": "Excellent"}
    },
    {
        "q": "The back of my phone is burning up while I'm playing Genshin Impact.",
        "telemetry": {"storageUsed": 50, "temperature": 65, "batteryLevel": 15, "signalStrength": "Excellent"}
    },
    {
        "q": "My internet is incredibly slow, TikTok videos keep buffering.",
        "telemetry": {"storageUsed": 50, "temperature": 32, "batteryLevel": 80, "signalStrength": "Weak"}
    },
    {
        "q": "I feel like my battery drops too fast during the day.",
        "telemetry": {"storageUsed": 50, "temperature": 32, "batteryLevel": 12, "signalStrength": "Excellent"}
    },
    {
        "q": "I feel like my battery drops too fast during the day.",
        "telemetry": {"storageUsed": 50, "temperature": 32, "batteryLevel": 95, "signalStrength": "Excellent"}
    },
    {
        "q": "My apps keep randomly crashing back to the home screen.",
        "telemetry": {"storageUsed": 98, "temperature": 32, "batteryLevel": 80, "signalStrength": "Excellent"}
    }
]

for idx, t in enumerate(queries):
    print(f"\n--- TEST {idx+1} ---")
    print(f"Query: {t['q']}")
    print(f"Telemetry: {t['telemetry']}")
    res = run_troubleshoot_pipeline(t['q'], json.dumps(t['telemetry']))
    
    print(f"Escalation Level: {res.meta.hardware_escalation}")
    for i, ctx in enumerate(res.response.contexts):
        print(f"  Goal {i+1}: {ctx.title}")
        for action in ctx.actions:
            print(f"    Action: {action.actionName}")
            if action.stepGroups and action.stepGroups[0].actionableDeeplink:
                print(f"    Link: {action.stepGroups[0].actionableDeeplink.deeplink}")
