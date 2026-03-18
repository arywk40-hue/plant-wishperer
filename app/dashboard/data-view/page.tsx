"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search, Eye, EyeOff } from "lucide-react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  buildDataViewRows,
  buildRiskDistribution,
  normalizeSavedReports,
  type SavedReportEntry,
} from "@/lib/report-utils"

export default function DataViewPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [viewMode, setViewMode] = useState<"table" | "chart">("table")
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

  const normalizedReports = normalizeSavedReports(savedReports).filter((report) => report.type !== "Summary")
  const tableData = buildDataViewRows(normalizedReports)
  const filteredData = tableData.filter((row) => {
    const matchesSearch =
      row.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.date.includes(searchTerm) ||
      row.status.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterType === "all") return matchesSearch
    if (filterType === "healthy") return matchesSearch && row.status === "Healthy"
    if (filterType === "monitor") return matchesSearch && row.status === "Monitor"
    if (filterType === "alert") return matchesSearch && row.status === "Alert"
    return matchesSearch
  })
  const filteredIds = new Set(filteredData.map((row) => String(row.id)))
  const filteredReports = normalizedReports.filter((report) => filteredIds.has(String(report.id)))
  const scatterData = filteredData.map((row) => ({
    x: row.sensorRisk,
    y: row.healthScore,
    field: row.field,
  }))
  const riskDistribution = buildRiskDistribution(filteredReports)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Data View</h1>
          <p className="text-gray-600">Explore saved crop-health analyses from your report history</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by field, date, or status..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {["all", "healthy", "monitor", "alert"].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                onClick={() => setFilterType(type)}
                className={filterType === type ? "bg-green-600 hover:bg-green-700" : "border-green-200"}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "bg-green-600 hover:bg-green-700" : "border-green-200"}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "chart" ? "default" : "outline"}
              onClick={() => setViewMode("chart")}
              className={viewMode === "chart" ? "bg-green-600 hover:bg-green-700" : "border-green-200"}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {tableData.length === 0 && (
          <Card className="p-6 border-green-200 mb-8">
            <p className="text-sm text-gray-600">
              No saved analysis records are available yet. Run the dashboard analysis flow to populate this page.
            </p>
          </Card>
        )}

        {viewMode === "table" && filteredData.length > 0 && (
          <Card className="border-green-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50 border-green-200">
                    <TableHead className="text-green-900">Date</TableHead>
                    <TableHead className="text-green-900">Field</TableHead>
                    <TableHead className="text-green-900">Health Score</TableHead>
                    <TableHead className="text-green-900">Vision Risk</TableHead>
                    <TableHead className="text-green-900">Audio Risk</TableHead>
                    <TableHead className="text-green-900">Sensor Risk</TableHead>
                    <TableHead className="text-green-900">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row.id} className="border-green-100 hover:bg-green-50">
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell>{row.field}</TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">{row.healthScore}</span>
                      </TableCell>
                      <TableCell>{row.visionRisk}%</TableCell>
                      <TableCell>{row.audioRisk}%</TableCell>
                      <TableCell>{row.sensorRisk}%</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            row.status === "Healthy"
                              ? "bg-green-100 text-green-800"
                              : row.status === "Monitor"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {row.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {viewMode === "table" && tableData.length > 0 && filteredData.length === 0 && (
          <Card className="p-6 border-green-200">
            <p className="text-sm text-gray-600">No saved records match the current filters.</p>
          </Card>
        )}

        {viewMode === "chart" && tableData.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="p-6 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sensor Risk vs Health Score</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Sensor Risk %" />
                  <YAxis dataKey="y" name="Health Score" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter name="Reports" data={scatterData} fill="#16a34a" />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
