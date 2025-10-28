"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download, TrendingUp } from "lucide-react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [savedReports, setSavedReports] = useState<any[]>([])

  // load saved reports (client-side only)
  useEffect(() => {
    let cancelled = false
    fetch('/api/reports/list')
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && j.ok && Array.isArray(j.reports)) setSavedReports(j.reports.reverse())
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Mock data for health trends
  const healthTrendData = [
    { date: "Day 1", score: 72, vision: 70, audio: 75, sensor: 71 },
    { date: "Day 2", score: 74, vision: 72, audio: 76, sensor: 74 },
    { date: "Day 3", score: 76, vision: 75, audio: 78, sensor: 76 },
    { date: "Day 4", score: 75, vision: 74, audio: 77, sensor: 75 },
    { date: "Day 5", score: 78, vision: 77, audio: 80, sensor: 78 },
    { date: "Day 6", score: 80, vision: 79, audio: 82, sensor: 80 },
    { date: "Day 7", score: 82, vision: 81, audio: 84, sensor: 82 },
  ]

  const diseaseDetectionData = [
    { name: "Powdery Mildew", count: 3, severity: "Medium" },
    { name: "Leaf Spot", count: 2, severity: "Low" },
    { name: "Rust", count: 1, severity: "High" },
    { name: "Blight", count: 0, severity: "None" },
  ]

  const reports = [
    {
      id: 1,
      title: "Weekly Health Summary",
      date: "2025-01-20",
      type: "Summary",
      status: "Complete",
      score: 82,
    },
    {
      id: 2,
      title: "Disease Detection Report",
      date: "2025-01-19",
      type: "Disease",
      status: "Complete",
      score: 78,
    },
    {
      id: 3,
      title: "Sensor Data Analysis",
      date: "2025-01-18",
      type: "Sensor",
      status: "Complete",
      score: 85,
    },
    {
      id: 4,
      title: "Environmental Impact Assessment",
      date: "2025-01-17",
      type: "Environmental",
      status: "Complete",
      score: 88,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analysis Reports</h1>
          <p className="text-gray-600">View detailed analysis reports and trends for your crops</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {["7d", "30d", "90d", "1y"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? "bg-green-600 hover:bg-green-700" : "border-green-200"}
            >
              {period === "7d" ? "7 Days" : period === "30d" ? "30 Days" : period === "90d" ? "90 Days" : "1 Year"}
            </Button>
          ))}
        </div>

        {/* Health Trend Chart */}
  <Card className="p-6 border-green-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Health Score Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={2} name="Overall Score" />
              <Line type="monotone" dataKey="vision" stroke="#3b82f6" strokeWidth={2} name="Vision" />
              <Line type="monotone" dataKey="audio" stroke="#06b6d4" strokeWidth={2} name="Audio" />
              <Line type="monotone" dataKey="sensor" stroke="#eab308" strokeWidth={2} name="Sensor" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Disease Detection Chart */}
        <Card className="p-6 border-green-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Disease Detection Summary</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={diseaseDetectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" name="Detection Count" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Reports */}
        <Card className="p-6 border-green-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2" onClick={() => {
              try {
                const payload = { healthTrendData, diseaseDetectionData, reports }
                // download
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `plant-report-${Date.now()}.json`
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)

                // also persist to server
                fetch('/api/reports/save', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
                  .then((r) => r.json())
                  .then((j) => {
                    if (j.ok && j.entry) setSavedReports((s) => [j.entry, ...s])
                  })
                  .catch(() => {})
              } catch (e) {
                console.error('Generate report failed', e)
              }
            }}>
              <Download className="w-4 h-4" />
              Generate Report
            </Button>
          </div>

          <div className="space-y-4">
            {/* show persisted savedReports first, then seeded reports */}
            {savedReports.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-200 transition">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{r.payload?.title || 'Saved Report'}</h3>
                    <p className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{r.payload?.score ?? '-'}</p>
                    <p className="text-xs text-gray-600">Health Score</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(r.payload, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `plant-report-${r.id}.json`
                        document.body.appendChild(a)
                        a.click()
                        a.remove()
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (!confirm('Delete this report? This cannot be undone.')) return
                        try {
                          const res = await fetch('/api/reports/delete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: r.id }) })
                          const j = await res.json()
                          if (j.ok) setSavedReports((s) => s.filter((x) => x.id !== r.id))
                          else alert('Delete failed: ' + (j.error || 'unknown'))
                        } catch (e) {
                          alert('Delete failed')
                        }
                      }}
                      className="bg-red-50 text-red-600 border-red-100"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* fallback to seeded reports for display when no saved reports present */}
            {savedReports.length === 0 && reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-200 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600">
                      {report.date} • {report.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{report.score}</p>
                    <p className="text-xs text-gray-600">Health Score</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
