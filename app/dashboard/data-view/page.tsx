"use client"

import { useState } from "react"
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

export default function DataViewPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [viewMode, setViewMode] = useState<"table" | "chart">("table")

  // Mock data for table view
  const tableData = [
    {
      id: 1,
      date: "2025-01-20",
      field: "Field A",
      healthScore: 82,
      visionRisk: 18,
      audioRisk: 16,
      sensorRisk: 18,
      status: "Healthy",
    },
    {
      id: 2,
      date: "2025-01-19",
      field: "Field B",
      healthScore: 78,
      visionRisk: 22,
      audioRisk: 20,
      sensorRisk: 22,
      status: "Monitor",
    },
    {
      id: 3,
      date: "2025-01-18",
      field: "Field A",
      healthScore: 76,
      visionRisk: 24,
      audioRisk: 22,
      sensorRisk: 24,
      status: "Monitor",
    },
    {
      id: 4,
      date: "2025-01-17",
      field: "Field C",
      healthScore: 85,
      visionRisk: 15,
      audioRisk: 12,
      sensorRisk: 15,
      status: "Healthy",
    },
    {
      id: 5,
      date: "2025-01-16",
      field: "Field B",
      healthScore: 72,
      visionRisk: 28,
      audioRisk: 25,
      sensorRisk: 28,
      status: "Alert",
    },
  ]

  // Mock data for scatter plot
  const scatterData = [
    { x: 18, y: 82, field: "Field A" },
    { x: 22, y: 78, field: "Field B" },
    { x: 24, y: 76, field: "Field A" },
    { x: 15, y: 85, field: "Field C" },
    { x: 28, y: 72, field: "Field B" },
    { x: 20, y: 80, field: "Field A" },
    { x: 25, y: 75, field: "Field C" },
  ]

  // Mock data for risk distribution
  const riskDistribution = [
    { name: "Low Risk", value: 35, color: "#16a34a" },
    { name: "Medium Risk", value: 45, color: "#eab308" },
    { name: "High Risk", value: 20, color: "#dc2626" },
  ]

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Data View</h1>
          <p className="text-gray-600">Explore and visualize your crop health data</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by field, date, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Table View */}
        {viewMode === "table" && (
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

        {/* Chart View */}
        {viewMode === "chart" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Scatter Plot */}
            <Card className="p-6 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Risk vs Health Score</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Risk %" />
                  <YAxis dataKey="y" name="Health Score" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter name="Fields" data={scatterData} fill="#16a34a" />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            {/* Risk Distribution */}
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

        {/* Data Summary */}
        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <Card className="p-6 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Total Records</p>
            <p className="text-3xl font-bold text-green-600">{filteredData.length}</p>
          </Card>
          <Card className="p-6 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Average Health Score</p>
            <p className="text-3xl font-bold text-green-600">
              {Math.round(filteredData.reduce((sum, row) => sum + row.healthScore, 0) / filteredData.length)}
            </p>
          </Card>
          <Card className="p-6 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Healthy Fields</p>
            <p className="text-3xl font-bold text-green-600">
              {filteredData.filter((r) => r.status === "Healthy").length}
            </p>
          </Card>
          <Card className="p-6 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Alert Fields</p>
            <p className="text-3xl font-bold text-red-600">{filteredData.filter((r) => r.status === "Alert").length}</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
