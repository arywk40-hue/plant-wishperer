"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ImageIcon, Zap, Wind, Mic } from "lucide-react"
import UploadPanel from "@/components/dashboard/upload-panel"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import AnalysisResults from "@/components/dashboard/analysis-results"
import RealTimeSensorMonitor from "@/components/dashboard/real-time-sensor-monitor"
import AlertSystem from "@/components/dashboard/alert-system"
import RecommendationsEngine from "@/components/dashboard/recommendations-engine"

export default function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, number>>({
    images: 0,
    audio: 0,
    sensors: 0,
    weather: 0,
  })

  const [analysisResults, setAnalysisResults] = useState<{
    score: number
    riskData: { vision: number; audio: number; sensor: number }
  } | null>(null)

  const handleFileUpload = (category: string, count: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [category]: prev[category] + count,
    }))

    if (uploadedFiles.images > 0 || uploadedFiles.audio > 0 || uploadedFiles.sensors > 0 || uploadedFiles.weather > 0) {
      const visionScore = Math.min(100, 60 + Math.random() * 30)
      const audioScore = Math.min(100, 55 + Math.random() * 35)
      const sensorScore = Math.min(100, 65 + Math.random() * 25)
      const overallScore = Math.round((visionScore + audioScore + sensorScore) / 3)

      setAnalysisResults({
        score: overallScore,
        riskData: {
          vision: Math.round(visionScore),
          audio: Math.round(audioScore),
          sensor: Math.round(sensorScore),
        },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Field Monitoring Dashboard</h1>
          <p className="text-gray-600">Upload and analyze crop health data from your fields</p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-Time Sensor Monitoring</h2>
          <RealTimeSensorMonitor />
        </div>

        {/* Upload Panels Grid - Now 4 columns for multimodal data */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <UploadPanel
            title="Crop Images"
            description="Upload drone or camera images for visual analysis"
            icon={ImageIcon}
            color="bg-blue-100 text-blue-600"
            fileType="image/*"
            category="images"
            onUpload={handleFileUpload}
            uploadedCount={uploadedFiles.images}
          />

          <UploadPanel
            title="Plant Audio"
            description="Upload plant acoustic recordings for stress analysis"
            icon={Mic}
            color="bg-purple-100 text-purple-600"
            fileType="audio/*"
            category="audio"
            onUpload={handleFileUpload}
            uploadedCount={uploadedFiles.audio}
          />

          <UploadPanel
            title="Sensor Data"
            description="Upload soil moisture, temperature, and humidity readings"
            icon={Zap}
            color="bg-yellow-100 text-yellow-600"
            fileType=".csv,.json"
            category="sensors"
            onUpload={handleFileUpload}
            uploadedCount={uploadedFiles.sensors}
          />

          <UploadPanel
            title="Weather Data"
            description="Upload weather patterns and environmental conditions"
            icon={Wind}
            color="bg-cyan-100 text-cyan-600"
            fileType=".csv,.json"
            category="weather"
            onUpload={handleFileUpload}
            uploadedCount={uploadedFiles.weather}
          />
        </div>

        {/* Quick Stats - Updated for 4 modalities */}
        <div className="grid md:grid-cols-5 gap-4 mb-12">
          <Card className="p-6 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Total Uploads</p>
            <p className="text-3xl font-bold text-green-600">
              {uploadedFiles.images + uploadedFiles.audio + uploadedFiles.sensors + uploadedFiles.weather}
            </p>
          </Card>
          <Card className="p-6 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Images Analyzed</p>
            <p className="text-3xl font-bold text-blue-600">{uploadedFiles.images}</p>
          </Card>
          <Card className="p-6 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Audio Recordings</p>
            <p className="text-3xl font-bold text-purple-600">{uploadedFiles.audio}</p>
          </Card>
          <Card className="p-6 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Sensor Readings</p>
            <p className="text-3xl font-bold text-yellow-600">{uploadedFiles.sensors}</p>
          </Card>
          <Card className="p-6 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Weather Updates</p>
            <p className="text-3xl font-bold text-cyan-600">{uploadedFiles.weather}</p>
          </Card>
        </div>

        {analysisResults && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Multimodal Analysis Results</h2>
            <AnalysisResults score={analysisResults.score} riskData={analysisResults.riskData} />

            <div className="grid lg:grid-cols-2 gap-8 mt-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Active Alerts</h3>
                <AlertSystem score={analysisResults.score} riskData={analysisResults.riskData} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
                <RecommendationsEngine score={analysisResults.score} riskData={analysisResults.riskData} />
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity - Updated with Audio section */}
        <Card className="p-8 border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {uploadedFiles.images + uploadedFiles.audio + uploadedFiles.sensors + uploadedFiles.weather === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No uploads yet. Start by uploading crop images, audio recordings, or sensor data above.
              </p>
            ) : (
              <>
                {uploadedFiles.images > 0 && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFiles.images} crop image(s) uploaded</p>
                        <p className="text-sm text-gray-600">Ready for visual analysis</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                    >
                      View
                    </Button>
                  </div>
                )}
                
                {uploadedFiles.audio > 0 && (
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <Mic className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFiles.audio} audio recording(s) uploaded</p>
                        <p className="text-sm text-gray-600">Ready for acoustic stress analysis</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                    >
                      View
                    </Button>
                  </div>
                )}

                {uploadedFiles.sensors > 0 && (
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFiles.sensors} sensor reading(s) processed</p>
                        <p className="text-sm text-gray-600">Environmental data analyzed</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 bg-transparent"
                    >
                      View
                    </Button>
                  </div>
                )}
                
                {uploadedFiles.weather > 0 && (
                  <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="flex items-center gap-3">
                      <Wind className="w-5 h-5 text-cyan-600" />
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFiles.weather} weather update(s) recorded</p>
                        <p className="text-sm text-gray-600">Climate conditions tracked</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cyan-200 text-cyan-600 hover:bg-cyan-50 bg-transparent"
                    >
                      View
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Multimodal Explanation Section */}
        <Card className="p-8 border-green-200 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How Multimodal AI Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Vision Analysis</h3>
              <p className="text-sm text-gray-600">Detects visible diseases, pests, and nutrient deficiencies</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Audio Analysis</h3>
              <p className="text-sm text-gray-600">Detects plant stress through ultrasonic sounds before visible symptoms</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sensor Data</h3>
              <p className="text-sm text-gray-600">Monitors soil conditions, temperature, and environmental factors</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wind className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Weather Data</h3>
              <p className="text-sm text-gray-600">Tracks climate patterns and their impact on crop health</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}