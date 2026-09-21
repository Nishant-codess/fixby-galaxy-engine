import json
telemetry = '{"storageUsed": 50, "temperature": 32, "batteryLevel": 95, "signalStrength": "Excellent"}'
_sd = json.loads(telemetry)
_bat = _sd.get("batteryLevel", 100)
_sto = _sd.get("storageUsed", 0)
_tmp = _sd.get("temperature", 30)
_sig = _sd.get("signalStrength", "Excellent")

_tier1_breaches = sum([
    _sto >= 95,
    _bat <= 15,
    _tmp >= 55,
    _sig in ("None", "Weak"),
])
print(f"sto: {_sto}, bat: {_bat}, tmp: {_tmp}, sig: {_sig}")
print(f"Breaches: {_tier1_breaches}")
