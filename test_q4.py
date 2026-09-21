import json
from src.core.pipeline import run_troubleshoot_pipeline

q = "I feel like my battery drops too fast during the day."
telemetry = {"storageUsed": 50, "temperature": 32, "batteryLevel": 12, "signalStrength": "Excellent"}

res = run_troubleshoot_pipeline(q, json.dumps(telemetry))
print(f"Meta: {res.meta}")
for ctx in res.response.contexts:
    print(ctx.title)
