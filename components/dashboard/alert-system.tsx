"use client"

import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Alert {
  id: string
  level: "critical" | "warning" | "info" | "success"
  title: string
  message: string
  timestamp: Date
  actionable?: boolean
}

interface AlertSystemProps {
  score: number
  riskData?: { vision: number; audio: number; sensor: number }
}

export default function AlertSystem({ score, riskData }: AlertSystemProps) {
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = []

    if (score < 40) {
      alerts.push({
        id: "critical-health",
        level: "critical",
        title: "Critical Crop Health Alert",
        message: "Immediate intervention required. Crop health score is critically low.",
        timestamp: new Date(),
        actionable: true,
      })
    } else if (score < 60) {
      alerts.push({
        id: "warning-health",
        level: "warning",
        title: "Crop Health Warning",
        message: "Crop health is declining. Monitor closely and consider preventive measures.",
        timestamp: new Date(),
        actionable: true,
      })
    }

    if (riskData) {
      if (riskData.vision > 70) {
        alerts.push({
          id: "vision-risk",
          level: "warning",
          title: "Visual Stress Detected",
          message: "Drone imagery shows signs of plant stress or disease patterns.",
          timestamp: new Date(),
          actionable: true,
        })
      }

      if (riskData.audio > 65) {
        alerts.push({
          id: "audio-risk",
          level: "warning",
          title: "Acoustic Anomalies Detected",
          message: "Ultrasonic sensors detected unusual stress sounds from plants.",
          timestamp: new Date(),
          actionable: true,
        })
      }

      if (riskData.sensor > 60) {
        alerts.push({
          id: "sensor-risk",
          level: "info",
          title: "Soil Conditions Suboptimal",
          message: "Soil moisture, temperature, or pH levels are outside optimal ranges.",
          timestamp: new Date(),
          actionable: true,
        })
      }
    }

    if (alerts.length === 0) {
      alerts.push({
        id: "all-good",
        level: "success",
        title: "All Systems Optimal",
        message: "Crop health is excellent. Continue current management practices.",
        timestamp: new Date(),
        actionable: false,
      })
    }

    return alerts
  }

  const alerts = generateAlerts()

  const getAlertIcon = (level: string) => {
    switch (level) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getAlertStyles = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "success":
        return "bg-green-50 border-green-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert.id} className={`p-4 border ${getAlertStyles(alert.level)}`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.level)}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{alert.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-2">{alert.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
