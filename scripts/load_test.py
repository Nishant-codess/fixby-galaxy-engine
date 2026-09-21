import asyncio
import httpx
import time
import statistics
import collections

URL_HEALTH = "http://localhost:8000/health"
URL_TROUBLESHOOT = "http://localhost:8000/v1/troubleshoot"
HEADERS = {"X-API-Key": "test-api-key-123"}
PAYLOAD = {"query": "battery draining fast"}

CONCURRENCY = 200
TOTAL_REQUESTS = 1000

async def fetch(client, url, method="GET", json=None, headers=None):
    start = time.time()
    try:
        if method == "GET":
            response = await client.get(url, headers=headers)
        else:
            response = await client.post(url, json=json, headers=headers)
        
        latency = time.time() - start
        return response.status_code, latency
    except Exception as e:
        return 0, time.time() - start

async def worker(client, queue, results):
    while True:
        task = await queue.get()
        if task is None:
            break
        
        url, method, json, headers = task
        status_code, latency = await fetch(client, url, method, json, headers)
        results.append((status_code, latency))
        queue.task_done()

async def run_load_test():
    print(f"Starting load test with {CONCURRENCY} concurrent workers...")
    
    queue = asyncio.Queue()
    results = []
    
    # Enqueue tasks (mix of health and troubleshoot)
    for i in range(TOTAL_REQUESTS):
        if i % 5 == 0:
            queue.put_nowait((URL_TROUBLESHOOT, "POST", PAYLOAD, HEADERS))
        else:
            queue.put_nowait((URL_HEALTH, "GET", None, None))
            
    limits = httpx.Limits(max_connections=1000, max_keepalive_connections=1000)
    async with httpx.AsyncClient(timeout=30.0, limits=limits) as client:
        workers = [
            asyncio.create_task(worker(client, queue, results))
            for _ in range(CONCURRENCY)
        ]
        
        start_time = time.time()
        await queue.join()
        end_time = time.time()
        
        # Stop workers
        for _ in range(CONCURRENCY):
            queue.put_nowait(None)
        await asyncio.gather(*workers)
        
    duration = end_time - start_time
    rps = TOTAL_REQUESTS / duration if duration > 0 else 0
    
    status_counts = collections.Counter(status for status, _ in results)
    print("\n--- Status Codes ---")
    for status, count in status_counts.items():
        print(f"  {status}: {count}")
    
    successes = sum(1 for status, _ in results if status == 200)
    rate_limited = sum(1 for status, _ in results if status == 429)
    errors = sum(1 for status, _ in results if status not in (200, 429))
    latencies = [lat * 1000 for _, lat in results]
    
    print("\n--- Load Test Results ---")
    print(f"Total Requests: {TOTAL_REQUESTS}")
    print(f"Concurrency:    {CONCURRENCY}")
    print(f"Time Taken:     {duration:.2f} seconds")
    print(f"RPS:            {rps:.2f} requests/sec")
    print(f"Successes:      {successes} (Status 200)")
    print(f"Rate Limited:   {rate_limited} (Status 429)")
    print(f"Errors/Other:   {errors}")
    
    if latencies:
        print("\nLatency Metrics (ms):")
        print(f"  Min:  {min(latencies):.2f} ms")
        print(f"  Avg:  {statistics.mean(latencies):.2f} ms")
        print(f"  P50:  {statistics.median(latencies):.2f} ms")
        try:
            print(f"  P95:  {statistics.quantiles(latencies, n=20)[18]:.2f} ms")
            print(f"  P99:  {statistics.quantiles(latencies, n=100)[98]:.2f} ms")
        except:
            pass

if __name__ == "__main__":
    asyncio.run(run_load_test())
