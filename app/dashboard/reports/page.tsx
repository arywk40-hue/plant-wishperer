"use client"

import { useEffect, useState } from "react"
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
import {
  buildDiseaseDetectionData,
  buildHealthTrendData,
  filterReportsByPeriod,
  normalizeSavedReports,
  type SavedReportEntry,
} from "@/lib/report-utils"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [savedReports, setSavedReports] = useState<SavedReportEntry[]>([])

  useEffect(() => {
    let cancelled = false

    fetch("/api/reports/list")
      .then((response) => response.json())
      .then((json) => {
        if (!cancelled && json.ok && Array.isArray(json.reports)) {
          setSavedReports(json.reports)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const normalizedReports = normalizeSavedReports(savedReports)
  const analysisReports = normalizedReports.filter((report) => report.type !== "Summary")
  const filteredReports = filterReportsByPeriod(analysisReports, selectedPeriod)
  const healthTrendData = buildHealthTrendData(filteredReports)
  const diseaseDetectionData = buildDiseaseDetectionData(filteredReports)

  const downloadJson = (filename: string, payload: unknown) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const handleGenerateReport = async () => {
    if (filteredReports.length === 0) return

    const scoreAverage = Math.round(
      filteredReports.reduce((sum, report) => sum + report.score, 0) / filteredReports.length,
    )
    const payload = {
      title: `${selectedPeriod.toUpperCase()} Summary`,
      date: new Date().toISOString(),
      type: "Summary",
      status: "Complete",
      score: scoreAverage,
      healthTrendData,
      diseaseDetectionData,
      reports: filteredReports.map((report) => ({
        id: report.id,
        title: report.title,
        date: report.createdAt,
        type: report.type,
        status: report.status,
        score: report.score,
      })),
    }

    downloadJson(`plant-report-${Date.now()}.json`, payload)

    try {
      const response = await fetch("/api/reports/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await response.json()
      if (json.ok && json.entry) {
        setSavedReports((current) => [...current, json.entry])
      }
    } catch (error) {
      console.error("Generate report failed", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analysis Reports</h1>
          <p className="text-gray-600">View saved analysis history and generated trend summaries for your crops</p>
        </div>

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

        <Card className="p-6 border-green-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Health Score Trend</h2>
            <p className="text-sm text-gray-500">{filteredReports.length} report(s) in range</p>
          </div>
          {healthTrendData.length > 0 ? (
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
          ) : (
            <p className="text-sm text-gray-600">
              No saved analysis reports were found for this period yet. Complete a full dashboard run to populate this chart.
            </p>
          )}
        </Card>

        <Card className="p-6 border-green-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detection Summary</h2>
          {diseaseDetectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diseaseDetectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" name="Detection Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-600">
              No detection summaries are available yet. Saved reports with visual, audio, or environmental findings will appear here.
            </p>
          )}
        </Card>

        <Card className="p-6 border-green-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Saved Reports</h2>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              onClick={handleGenerateReport}
              disabled={filteredReports.length === 0}
            >
              <Download className="w-4 h-4" />
              Generate Report
            </Button>
          </div>

          <div className="space-y-4">
            {normalizedReports.length === 0 && (
              <p className="text-sm text-gray-600">
                No reports have been saved yet. Run a multimodal analysis from the dashboard to start building history.
              </p>
            )}

            {normalizedReports.map((report) => {
              const rawPayload = savedReports.find((entry) => String(entry.id) === String(report.id))?.payload ?? report

              return (
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
                        {new Date(report.createdAt).toLocaleString()} • {report.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{report.score}</p>
                      <p className="text-xs text-gray-600">Health Score</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                        onClick={() => downloadJson(`plant-report-${report.id}.json`, rawPayload)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (!confirm("Delete this report? This cannot be undone.")) return
                          try {
                            const response = await fetch("/api/reports/delete", {
                              method: "POST",
                              headers: { "content-type": "application/json" },
                              body: JSON.stringify({ id: report.id }),
                            })
                            const json = await response.json()
                            if (json.ok) {
                              setSavedReports((current) => current.filter((entry) => String(entry.id) !== String(report.id)))
                            } else {
                              alert(`Delete failed: ${json.error || "unknown"}`)
                            }
                          } catch {
                            alert("Delete failed")
                          }
                        }}
                        className="bg-red-50 text-red-600 border-red-100"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </main>
    </div>
  )
}
