import { DEFAULT_WEIGHTS, HEALTH_STATUS_THRESHOLDS, SEVERITY_THRESHOLDS } from "@/config/analysis-config"

export interface HealthScore {
  overall: number
  vision: number
  audio: number
  sensor: number
}

export interface AnalysisMetadata {
  fieldId: string
  cropType: string
  analysisDate: Date
  dataPoints: number
}

// Calculate health score based on multiple factors
export function calculateHealthScore(
  visionScore: number,
  audioScore: number,
  sensorScore: number,
  weights = DEFAULT_WEIGHTS,
): HealthScore {
  const overall = Math.round(visionScore * weights.vision + audioScore * weights.audio + sensorScore * weights.sensor)

  return {
    overall: Math.min(100, Math.max(0, overall)),
    vision: Math.min(100, Math.max(0, visionScore)),
    audio: Math.min(100, Math.max(0, audioScore)),
    sensor: Math.min(100, Math.max(0, sensorScore)),
  }
}

// Determine health status based on score
export function getHealthStatus(score: number): "excellent" | "good" | "fair" | "poor" | "critical" {
  if (score >= HEALTH_STATUS_THRESHOLDS.excellent) return "excellent"
  if (score >= HEALTH_STATUS_THRESHOLDS.good) return "good"
  if (score >= HEALTH_STATUS_THRESHOLDS.fair) return "fair"
  if (score >= HEALTH_STATUS_THRESHOLDS.poor) return "poor"
  return "critical"
}

// Generate severity level for alerts
export function getSeverityLevel(score: number): "info" | "warning" | "critical" {
  if (score >= SEVERITY_THRESHOLDS.info) return "info"
  if (score >= SEVERITY_THRESHOLDS.warning) return "warning"
  return "critical"
}

// Format analysis results for display
export function formatAnalysisResults(scores: HealthScore, metadata: AnalysisMetadata): Record<string, unknown> {
  return {
    fieldId: metadata.fieldId,
    cropType: metadata.cropType,
    analysisDate: metadata.analysisDate.toISOString(),
    healthStatus: getHealthStatus(scores.overall),
    scores,
    severity: getSeverityLevel(scores.overall),
    dataPoints: metadata.dataPoints,
  }
}
