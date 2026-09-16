# Benchmark Results — Mai Batata Hun Engine

### Core Performance & SLA (measured, not asserted)
- **Total Queries Evaluated:** 100
- **Cache Hit Rate:** 90.0%
- **Live vs Mock:** 100 live / 0 mock-fallback (mock-fallback > 0 means the real pipeline threw — investigate before trusting any other number here)
- **Latency P50:** 0.0 ms
- **Latency P95:** 115.9 ms
- **Latency P99:** 244.2 ms

### Samsung Rubric Compliance (computed from actual response content)
- **URL Leaks Detected:** 0 (target: 0)
- **Safety Ordering Violations:** 0 (target: 0)
- **Auto Actions With Bound Deeplink:** 100
