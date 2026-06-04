"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Database,
  RefreshCw,
  AlertTriangle,
  Terminal,
  Loader2,
  Lock,
  ArrowLeft
} from "lucide-react"

import { Button } from "@/components/ui/button"

export default function AdminDiagnosticsPage() {
  const { data: session } = useSession()
  const adminEmails = ["official.heartmindai@gmail.com", "dhirajwarangane@gmail.com"]

  // Diagnostics Tab states
  const [diagLoading, setDiagLoading] = useState(false)
  const [diagRetrying, setDiagRetrying] = useState(false)
  const [diagData, setDiagData] = useState<any>(null)
  const [diagError, setDiagError] = useState<string | null>(null)

  // API Monitoring states
  const [apiLogs, setApiLogs] = useState<any[]>([])
  const [testingKeys, setTestingKeys] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [logsLoading, setLogsLoading] = useState(false)

  const fetchDiagnostics = async (isRetry = false) => {
    if (isRetry) {
      setDiagRetrying(true)
    } else {
      setDiagLoading(true)
    }
    setDiagError(null)

    try {
      const res = await fetch(`/api/test-db${isRetry ? "?retry=true" : ""}`)
      const data = await res.json()
      setDiagData(data)
      if (!res.ok) {
        throw new Error(data.error || "Failed to load database diagnostics.")
      }
    } catch (err: any) {
      setDiagError(err.message || "An unexpected diagnostics error occurred.")
    } finally {
      setDiagLoading(false)
      setDiagRetrying(false)
    }
  }

  const fetchApiLogs = async () => {
    setLogsLoading(true)
    try {
      const res = await fetch("/api/admin/api-logs")
      const data = await res.json()
      if (data.success) {
        setApiLogs(data.logs || [])
      }
    } catch (e) {
      console.error("Failed to fetch API logs:", e)
    } finally {
      setLogsLoading(false)
    }
  }

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all monitoring logs?")) return
    try {
      const res = await fetch("/api/admin/api-logs", { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setApiLogs([])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleTestKeys = async () => {
    setTestingKeys(true)
    try {
      const res = await fetch("/api/test-keys")
      const data = await res.json()
      if (data.success) {
        setTestResults(data)
        fetchApiLogs()
      } else {
        alert(data.error || "Failed to test API keys.")
      }
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setTestingKeys(false)
    }
  }

  useEffect(() => {
    if (session?.user && adminEmails.includes(session.user.email || "")) {
      fetchDiagnostics(false)
      fetchApiLogs()
    }
  }, [session])

  // Access check
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-zinc-400">Verifying administrator credentials...</p>
      </div>
    )
  }

  if (!adminEmails.includes(session.user.email || "")) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-white">Access Denied (403)</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          You do not have administrative privileges to view this diagnostics control panel.
        </p>
        <Button 
          onClick={() => window.location.href = "/dashboard"}
          className="bg-zinc-900 hover:bg-zinc-800 border border-white/[0.06] text-zinc-200 text-xs py-2 px-4 rounded-xl"
        >
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up select-none pb-12 px-4 pt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div className="space-y-1">
          <button 
            onClick={() => window.location.href = "/dashboard/settings"}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Settings
          </button>
          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-bold tracking-wider uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Lock className="w-3.5 h-3.5" />
            Admin Area Only
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Developer Diagnostics & API Monitor
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Secure tracking of rotated Gemini API keys, latency checks, and live database telemetry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: live API key monitoring & logs */}
        <div className="lg:col-span-8 rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-6 space-y-6 glass-strong">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/[0.04]">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                Gemini API Key Logs & Monitoring
              </h3>
              <p className="text-[10px] text-zinc-400">
                Real-time activity logs for your rotated Gemini API keys.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleTestKeys}
                disabled={testingKeys}
                className="bg-primary hover:bg-primary/90 text-white text-[10px] font-bold px-3 py-1.5 h-8 rounded-lg flex items-center gap-1 border border-white/5"
              >
                {testingKeys ? (
                  <>
                    <Loader2 className="w-3 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    Test Keys Live
                  </>
                )}
              </Button>
              <Button
                onClick={handleClearLogs}
                variant="ghost"
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-[10px] font-bold px-3 py-1.5 h-8 rounded-lg border border-rose-500/20"
              >
                Clear Logs
              </Button>
            </div>
          </div>

          {/* Key Statuses Summary if test results exist */}
          {testResults && (
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.04] space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                <span>Live Test Summary</span>
                <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Completed</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-zinc-950/40 rounded-lg border border-white/[0.02]">
                  <span className="text-zinc-500 text-[8px] uppercase block">Total Configured</span>
                  <span className="text-lg font-black text-white block pt-0.5">{testResults.summary?.totalTested || 0}</span>
                </div>
                <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                  <span className="text-emerald-500 text-[8px] uppercase block">Working Keys</span>
                  <span className="text-lg font-black text-emerald-400 block pt-0.5">{testResults.summary?.valid || 0}</span>
                </div>
                <div className="p-2 bg-rose-500/5 rounded-lg border border-rose-500/10">
                  <span className="text-rose-500 text-[8px] uppercase block">Failed Keys</span>
                  <span className="text-lg font-black text-rose-400 block pt-0.5">{testResults.summary?.invalid || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Logs Listing */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Activity Feed</span>
              {logsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />}
            </div>

            {apiLogs.length === 0 ? (
              <div className="text-center py-10 border border-white/[0.02] bg-zinc-900/10 rounded-xl space-y-1">
                <Database className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-[11px] text-zinc-400 font-semibold">No API logs captured yet.</p>
                <p className="text-[9px] text-zinc-500">Captured logs from chat uploads, coach messaging, and key checks will display here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-white/[0.04] bg-zinc-950/20 rounded-xl max-h-[350px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.04] bg-zinc-900/30 text-zinc-500 font-bold uppercase tracking-wider text-[9px] select-none">
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Endpoint</th>
                      <th className="px-4 py-3">Key (Masked)</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02] text-[11px]">
                    {apiLogs.map((log: any, idx: number) => {
                      const isSuccess = log.status === "success";
                      return (
                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-4 py-3 text-zinc-400 whitespace-nowrap font-mono text-[10px]">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="px-4 py-3 font-semibold text-zinc-200">
                            {log.endpoint}
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-400 text-[10px]">
                            {log.keyMasked}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border w-fit ${
                                isSuccess 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                              }`}>
                                {log.status}
                              </span>
                              {!isSuccess && log.error && (
                                <span className="text-[9px] text-rose-400/90 leading-tight italic block max-w-[200px] break-words pt-0.5">
                                  {log.error}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-zinc-300 font-mono text-[10px]">
                            {log.durationMs ? `${log.durationMs}ms` : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Database Diagnostics */}
        <div className="lg:col-span-4 rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-6 space-y-6 glass-strong">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Database className="w-4 h-4 text-zinc-400" />
              Database Diagnostics
            </h3>
            <button
              onClick={() => fetchDiagnostics(true)}
              disabled={diagRetrying}
              className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Force refresh database status"
            >
              <RefreshCw className={`w-3 h-3 ${diagRetrying ? "animate-spin" : ""}`} />
            </button>
          </div>

          {diagLoading ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-[9px] text-zinc-500">Pinging Database Cluster...</p>
            </div>
          ) : diagError ? (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Connection Failed
              </div>
              <p className="leading-normal">{diagError}</p>
            </div>
          ) : diagData ? (
            <div className="space-y-4">
              {/* Database Connection Status Card */}
              <div className="p-3.5 rounded-xl border bg-zinc-900/10 flex items-center justify-between border-white/[0.03]">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Connection State</span>
                  <span className="text-[11px] font-black text-white block">
                    {diagData.connection === "connected" ? "Connected 🟢" : "Fallback (db.json) 🟡"}
                  </span>
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  diagData.connection === "connected"
                    ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                    : "bg-amber-500/15 border-amber-500/25 text-amber-400"
                }`}>
                  {diagData.connection === "connected" ? "MongoDB Live" : "Local Mode"}
                </span>
              </div>

              {/* DB Latency & Collections */}
              <div className="space-y-2 text-[10px] font-semibold text-zinc-400">
                <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                  <span>Diagnostic Latency</span>
                  <span className="font-mono text-zinc-200">{diagData.latencyMs ? `${diagData.latencyMs}ms` : "N/A"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                  <span>User Records Count</span>
                  <span className="font-mono text-zinc-200">{diagData.stats?.users ?? 0}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                  <span>Analyses Captured</span>
                  <span className="font-mono text-zinc-200">{diagData.stats?.analyses ?? 0}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-zinc-600 text-[10px]">
              No database diagnostic data collected.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
