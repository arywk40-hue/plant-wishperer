"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Eye, Mic, Droplets, AlertCircle, CheckCircle2, TrendingDown } from "lucide-react"
import { RISK_LEVEL_THRESHOLDS } from "@/config/analysis-config"

interface AnalysisResultsProps {
  score: number
  riskData: {
    vision: number
    audio: number
    sensor: number
  }
  predictions?: Array<{ source: string; class: string; score: number }>
}

export default function AnalysisResults({ score, riskData, predictions }: AnalysisResultsProps) {
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { label: "Excellent Condition", color: "bg-green-600", textColor: "text-green-600" }
    if (score >= 70) return { label: "Good Condition", color: "bg-yellow-500", textColor: "text-yellow-600" }
    if (score >= 50) return { label: "Fair Condition", color: "bg-orange-500", textColor: "text-orange-600" }
    return { label: "Poor Condition", color: "bg-red-600", textColor: "text-red-600" }
  }

  const status = getHealthStatus(score)

  const getRiskLevel = (value: number) => {
  if (value >= RISK_LEVEL_THRESHOLDS.low) return { label: "Low Risk", color: "text-green-600", bgColor: "bg-green-50" }
  if (value >= RISK_LEVEL_THRESHOLDS.moderate) return { label: "Moderate Risk", color: "text-yellow-600", bgColor: "bg-yellow-50" }
  if (value >= RISK_LEVEL_THRESHOLDS.high) return { label: "High Risk", color: "text-orange-600", bgColor: "bg-orange-50" }
  return { label: "Critical Risk", color: "text-red-600", bgColor: "bg-red-50" }
  }

  const visionRisk = getRiskLevel(riskData.vision)
  const audioRisk = getRiskLevel(riskData.audio)
  const sensorRisk = getRiskLevel(riskData.sensor)

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className="border-green-200 overflow-hidden">
        <div className={`${status.color} text-white px-6 py-8 text-center`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-4xl">🧠</div>
            <h2 className="text-2xl font-bold">Multimodal AI Analysis</h2>
          </div>
          <div className="text-6xl font-bold mb-4">{score}/100</div>
          <Badge className={`${status.color} text-white border-0 text-base px-4 py-2`}>{status.label}</Badge>
          <p className="text-sm mt-4 opacity-90">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </Card>

      {/* Risk Assessment Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Vision Analysis */}
        <Card className={`p-6 border-2 ${visionRisk.bgColor} border-blue-200`}>
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Vision Analysis</h3>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Health Score</span>
              <span className="text-2xl font-bold text-blue-600">{riskData.vision}</span>
            </div>
            <Progress value={riskData.vision} className="h-2" />
          </div>
          <p className={`text-sm font-medium ${visionRisk.color}`}>{visionRisk.label}</p>
          <p className="text-xs text-gray-600 mt-2">Drone & camera imagery analysis</p>
        </Card>

        {/* Audio Analysis */}
        <Card className={`p-6 border-2 ${audioRisk.bgColor} border-cyan-200`}>
          <div className="flex items-center gap-3 mb-4">
            <Mic className="w-6 h-6 text-cyan-600" />
            <h3 className="font-semibold text-gray-900">Acoustic Analysis</h3>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Health Score</span>
              <span className="text-2xl font-bold text-cyan-600">{riskData.audio}</span>
            </div>
            <Progress value={riskData.audio} className="h-2" />
          </div>
          <p className={`text-sm font-medium ${audioRisk.color}`}>{audioRisk.label}</p>
          <p className="text-xs text-gray-600 mt-2">Ultrasonic stress detection</p>
        </Card>

        {/* Sensor Analysis */}
        <Card className={`p-6 border-2 ${sensorRisk.bgColor} border-yellow-200`}>
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Sensor Analysis</h3>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Health Score</span>
              <span className="text-2xl font-bold text-yellow-600">{riskData.sensor}</span>
            </div>
            <Progress value={riskData.sensor} className="h-2" />
          </div>
          <p className={`text-sm font-medium ${sensorRisk.color}`}>{sensorRisk.label}</p>
          <p className="text-xs text-gray-600 mt-2">Soil & environmental data</p>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card className="p-6 border-green-200">
        {predictions && predictions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Detailed Predictions</h4>
            <ul className="space-y-2">
              {predictions.map((p: { source: string; class: string; score: number }, idx: number) => (
                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border">
                  <div>
                    <div className="text-sm font-medium">{p.source}</div>
                    <div className="text-xs text-gray-500">{p.class}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">{Math.round(p.score * 100) / 100}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-green-600" />
          Key Insights
        </h3>
        <div className="space-y-3">
          {score >= 80 && (
            <div className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Crop Health Optimal</p>
                <p className="text-sm text-gray-600">
                  All systems indicate healthy crop development. Continue current management practices.
                </p>
              </div>
            </div>
          )}
          {score >= 60 && score < 80 && (
            <div className="flex gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Monitor Closely</p>
                <p className="text-sm text-gray-600">
                  Some indicators show minor stress. Increase monitoring frequency and adjust irrigation if needed.
                </p>
              </div>
            </div>
          )}
          {score < 60 && (
            <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Immediate Action Required</p>
                <p className="text-sm text-gray-600">
                  Significant stress detected. Review environmental conditions and consider intervention measures.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
