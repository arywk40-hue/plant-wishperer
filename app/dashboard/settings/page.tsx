"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download, Database, Bell, Shield, FileJson, FileText } from "lucide-react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const [exportFormat, setExportFormat] = useState("csv")
  const [notifications, setNotifications] = useState({
    alerts: true,
    reports: true,
    recommendations: true,
    weekly: true,
  })

  const handleExport = (format: string) => {
    // Simulate data export
    const mockData = {
      timestamp: new Date().toISOString(),
      format: format,
      records: 1250,
      fields: ["date", "health_score", "vision_risk", "audio_risk", "sensor_risk", "recommendations"],
    }

    const dataStr =
      format === "csv"
        ? "date,health_score,vision_risk,audio_risk,sensor_risk\n2025-01-20,82,19,16,18\n2025-01-19,78,22,20,22"
        : JSON.stringify(mockData, null, 2)

    const element = document.createElement("a")
    element.setAttribute(
      "href",
      `data:text/${format === "csv" ? "csv" : "json"};charset=utf-8,${encodeURIComponent(dataStr)}`,
    )
    element.setAttribute("download", `crop-health-data.${format === "csv" ? "csv" : "json"}`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account, data, and preferences</p>
        </div>

        {/* Data Export Section */}
        <Card className="p-8 border-green-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Data Export</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Download your crop health data in various formats for analysis and model training
          </p>

          <div className="space-y-4 mb-8">
            <div>
              <Label className="text-base font-semibold mb-4 block">Select Export Format</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setExportFormat("csv")}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    exportFormat === "csv" ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">CSV Format</p>
                      <p className="text-sm text-gray-600">Compatible with Excel, Python, R</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setExportFormat("json")}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    exportFormat === "json" ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileJson className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">JSON Format</p>
                      <p className="text-sm text-gray-600">Structured data with metadata</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Data Range</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date" className="text-sm text-gray-600">
                    Start Date
                  </Label>
                  <Input type="date" id="start-date" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-sm text-gray-600">
                    End Date
                  </Label>
                  <Input type="date" id="end-date" className="mt-2" />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Select Fields to Export</Label>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { id: "date", label: "Date" },
                  { id: "health_score", label: "Health Score" },
                  { id: "vision_risk", label: "Vision Risk" },
                  { id: "audio_risk", label: "Audio Risk" },
                  { id: "sensor_risk", label: "Sensor Risk" },
                  { id: "recommendations", label: "Recommendations" },
                ].map((field) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Checkbox id={field.id} defaultChecked />
                    <Label htmlFor={field.id} className="text-gray-700 cursor-pointer">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => handleExport(exportFormat)}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent">
              Schedule Export
            </Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-8 border-green-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              { id: "alerts", label: "Critical Alerts", desc: "Get notified about critical crop health issues" },
              { id: "reports", label: "Report Generation", desc: "Receive notifications when reports are ready" },
              { id: "recommendations", label: "Recommendations", desc: "Get notified about new recommendations" },
              { id: "weekly", label: "Weekly Summary", desc: "Receive weekly crop health summaries" },
            ].map((notif) => (
              <div
                key={notif.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-semibold text-gray-900">{notif.label}</p>
                  <p className="text-sm text-gray-600">{notif.desc}</p>
                </div>
                <Checkbox
                  checked={notifications[notif.id as keyof typeof notifications]}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({
                      ...prev,
                      [notif.id]: checked,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-8 border-green-200">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Security & Privacy</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">Data Encryption</p>
              <p className="text-sm text-gray-600 mb-4">All your data is encrypted in transit and at rest</p>
              <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent">
                View Security Details
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">Data Retention</p>
              <p className="text-sm text-gray-600 mb-4">
                Your data is retained for 2 years for analysis and model training
              </p>
              <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent">
                Manage Retention
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
