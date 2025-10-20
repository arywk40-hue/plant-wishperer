"use client"

import type React from "react"

import { Lightbulb, Droplets, Thermometer, Leaf, Bug, Wind } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Recommendation {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  icon: React.ReactNode
  timeframe: string
  category: string
}

import { RECOMMENDATION_TRIGGERS } from "@/config/analysis-config"

interface RecommendationsEngineProps {
  score: number
  riskData?: { vision: number; audio: number; sensor: number }
}

export default function RecommendationsEngine({ score, riskData }: RecommendationsEngineProps) {
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = []

  // Soil moisture recommendations
  if (riskData && riskData.sensor > RECOMMENDATION_TRIGGERS.sensorIrrigation) {
      recommendations.push({
        id: "irrigation",
        title: "Adjust Irrigation Schedule",
        description: "Soil moisture levels are suboptimal. Increase irrigation frequency or duration.",
        priority: "high",
        icon: <Droplets className="w-5 h-5" />,
        timeframe: "Within 24 hours",
        category: "Irrigation",
      })
    }

    // Disease prevention
  if (riskData && riskData.vision > RECOMMENDATION_TRIGGERS.visionDisease) {
      recommendations.push({
        id: "disease-prevention",
        title: "Apply Preventive Fungicide",
        description: "Visual analysis suggests early signs of fungal stress. Apply preventive treatment.",
        priority: "high",
        icon: <Bug className="w-5 h-5" />,
        timeframe: "Within 48 hours",
        category: "Disease Management",
      })
    }

    // Temperature management
  if (riskData && riskData.sensor > RECOMMENDATION_TRIGGERS.sensorTemperature) {
      recommendations.push({
        id: "temperature",
        title: "Monitor Temperature Fluctuations",
        description: "Temperature variations detected. Ensure proper ventilation and shade management.",
        priority: "medium",
        icon: <Thermometer className="w-5 h-5" />,
        timeframe: "Ongoing",
        category: "Climate Control",
      })
    }

    // Nutrient management
  if (score < RECOMMENDATION_TRIGGERS.scoreNutrient) {
      recommendations.push({
        id: "nutrients",
        title: "Nutrient Supplementation",
        description: "Consider applying balanced fertilizer to support crop recovery.",
        priority: "medium",
        icon: <Leaf className="w-5 h-5" />,
        timeframe: "Within 1 week",
        category: "Nutrition",
      })
    }

    // Pest monitoring
  if (riskData && riskData.audio > RECOMMENDATION_TRIGGERS.audioPest) {
      recommendations.push({
        id: "pest-monitoring",
        title: "Increase Pest Monitoring",
        description: "Acoustic analysis suggests potential pest activity. Increase field inspections.",
        priority: "medium",
        icon: <Bug className="w-5 h-5" />,
        timeframe: "Daily",
        category: "Pest Management",
      })
    }

    // General maintenance
  if (score > RECOMMENDATION_TRIGGERS.maintenanceScore) {
      recommendations.push({
        id: "maintenance",
        title: "Maintain Current Practices",
        description: "Crop health is excellent. Continue current management and monitoring schedule.",
        priority: "low",
        icon: <Wind className="w-5 h-5" />,
        timeframe: "Ongoing",
        category: "General",
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  const recommendations = generateRecommendations()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <div className="space-y-4">
      {recommendations.length === 0 ? (
        <Card className="p-8 text-center border-green-200 bg-green-50">
          <Lightbulb className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-700">No specific recommendations at this time.</p>
        </Card>
      ) : (
        recommendations.map((rec) => (
          <Card key={rec.id} className="p-6 border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-green-600 mt-1">{rec.icon}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  </div>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-500">{rec.category}</span>
                  <span className="text-xs text-gray-500">{rec.timeframe}</span>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
