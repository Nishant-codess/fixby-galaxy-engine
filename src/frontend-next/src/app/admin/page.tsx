"use client";

import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analyticsUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL || 
          (typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname)
            ? `${window.location.origin}/v1/analytics`
            : "http://localhost:8000/v1/analytics");

        const res = await fetch(analyticsUrl, {
          headers: { "X-API-Key": "test-api-key-123" }
        });
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
    const intv = setInterval(fetchData, 3000);
    return () => clearInterval(intv);
  }, []);

  if (!data) return <div className="p-10 text-white">Loading telemetry...</div>;

  const topCats = Object.entries(data.top_complaint_categories || {}).map(([name, val]) => ({ name, value: val })).sort((a, b) => (b.value as number) - (a.value as number));
  const pipelines = Object.entries(data.pipeline_source_breakdown || {}).map(([name, val]) => ({ name, value: val }));
  const PIE_COLORS = ["#34C759", "#3E91FF", "#AF52DE", "#FF9500", "#FF2D55"];

  return (
    <div className="min-h-screen bg-[#000] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Fixby AI Analytics</h1>
        <p className="text-gray-400 mb-8">Real-time Galaxy Fleet Health</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Queries" value={data.total_queries} />
          <StatCard title="Cache Hit Rate" value={`${data.cache_hit_rate_pct.toFixed(1)}%`} sub={`${data.cache_hits} hits`} />
          <StatCard title="Avg Latency" value={`${data.avg_latency_ms.toFixed(0)}ms`} />
          <StatCard title="p95 Latency" value={`${data.latency_p95_ms.toFixed(0)}ms`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1C1C1E] p-6 rounded-3xl border border-[#2C2C2E]">
            <h2 className="text-lg font-medium mb-6">Top Issue Domains</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCats} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" horizontal={false} />
                  <XAxis type="number" stroke="#8E8E93" />
                  <YAxis dataKey="name" type="category" stroke="#8E8E93" tick={{fill: '#8E8E93'}} />
                  <Tooltip contentStyle={{ background: '#2C2C2E', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="value" fill="#3E91FF" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1C1C1E] p-6 rounded-3xl border border-[#2C2C2E]">
            <h2 className="text-lg font-medium mb-6">Resolution Engine Source</h2>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pipelines} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                    {pipelines.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#2C2C2E', border: 'none', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub }: { title: string, value: string | number, sub?: string }) {
  return (
    <div className="bg-[#1C1C1E] p-6 rounded-3xl border border-[#2C2C2E] flex flex-col justify-center">
      <div className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">{title}</div>
      <div className="text-4xl font-semibold">{value}</div>
      {sub && <div className="text-sm text-gray-500 mt-2">{sub}</div>}
    </div>
  );
}
