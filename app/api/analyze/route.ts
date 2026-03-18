import { type NextRequest, NextResponse } from "next/server"

interface AnalysisRequest {
  imageData?: string
  audioData?: string
  sensorData?: {
    moisture: number
    temperature: number
    humidity: number
    ph: number
  }
}

interface AnalysisResult {
  overallScore: number
  visionScore: number
  audioScore: number
  sensorScore: number
  riskFactors: string[]
  recommendations: string[]
  timestamp: string
}

const NEUTRAL_MODEL_SCORE = 65

async function fetchRemoteScore(endpoint: "image" | "audio", rawData: string) {
  const modelServer = process.env.MODEL_SERVER_URL
  if (!modelServer) return null

  const response = await fetch(`${modelServer}/predict/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: rawData }),
  })

  if (!response.ok) {
    throw new Error(`Model server returned ${response.status} for ${endpoint}`)
  }

  const payload = await response.json()
  const score =
    payload?.score ??
    payload?.result?.score ??
    payload?.healthScore ??
    payload?.overall ??
    payload?.confidence

  return typeof score === "number" ? Math.round(Math.max(0, Math.min(100, score))) : null
}

async function analyzeVisionData(imageData?: string): Promise<number> {
  if (!imageData) return 0

  try {
    const score = await fetchRemoteScore("image", imageData)
    if (score !== null) return score
  } catch (error) {
    console.error("Vision model server error:", error)
  }

  return NEUTRAL_MODEL_SCORE
}

async function analyzeAudioData(audioData?: string): Promise<number> {
  if (!audioData) return 0

  try {
    const score = await fetchRemoteScore("audio", audioData)
    if (score !== null) return score
  } catch (error) {
    console.error("Audio model server error:", error)
  }

  return NEUTRAL_MODEL_SCORE
}

function analyzeSensorData(sensorData?: {
  moisture: number
  temperature: number
  humidity: number
  ph: number
}): number {
  if (!sensorData) return 0

  // Optimal ranges for crops
  const optimalRanges = {
    moisture: { min: 40, max: 70 },
    temperature: { min: 20, max: 30 },
    humidity: { min: 50, max: 80 },
    ph: { min: 6.0, max: 7.0 },
  }

  let score = 100
  const deviations = []

  // Check moisture
  if (sensorData.moisture < optimalRanges.moisture.min || sensorData.moisture > optimalRanges.moisture.max) {
    const deviation = Math.min(
      Math.abs(sensorData.moisture - optimalRanges.moisture.min),
      Math.abs(sensorData.moisture - optimalRanges.moisture.max),
    )
    score -= Math.min(20, deviation * 0.5)
    deviations.push("moisture")
  }

  // Check temperature
  if (
    sensorData.temperature < optimalRanges.temperature.min ||
    sensorData.temperature > optimalRanges.temperature.max
  ) {
    const deviation = Math.min(
      Math.abs(sensorData.temperature - optimalRanges.temperature.min),
      Math.abs(sensorData.temperature - optimalRanges.temperature.max),
    )
    score -= Math.min(20, deviation * 2)
    deviations.push("temperature")
  }

  // Check humidity
  if (sensorData.humidity < optimalRanges.humidity.min || sensorData.humidity > optimalRanges.humidity.max) {
    const deviation = Math.min(
      Math.abs(sensorData.humidity - optimalRanges.humidity.min),
      Math.abs(sensorData.humidity - optimalRanges.humidity.max),
    )
    score -= Math.min(15, deviation * 0.3)
    deviations.push("humidity")
  }

  // Check pH
  if (sensorData.ph < optimalRanges.ph.min || sensorData.ph > optimalRanges.ph.max) {
    const deviation = Math.abs(sensorData.ph - 6.5)
    score -= Math.min(15, deviation * 5)
    deviations.push("pH")
  }

  return Math.max(0, Math.round(score))
}

function generateRiskFactors(visionScore: number, audioScore: number, sensorScore: number): string[] {
  const risks: string[] = []

  if (visionScore > 70) risks.push("Visual stress patterns detected")
  if (audioScore > 65) risks.push("Acoustic anomalies indicating plant stress")
  if (sensorScore < 50) risks.push("Suboptimal soil conditions")
  if (visionScore > 80) risks.push("Potential disease infection")
  if (audioScore > 75) risks.push("Severe pest activity suspected")

  return risks.slice(0, 3) // Return top 3 risks
}

function generateRecommendations(visionScore: number, audioScore: number, sensorScore: number): string[] {
  const recommendations: string[] = []

  if (sensorScore < 60) recommendations.push("Adjust irrigation schedule")
  if (visionScore > 70) recommendations.push("Apply preventive fungicide treatment")
  if (audioScore > 65) recommendations.push("Increase pest monitoring frequency")
  if (sensorScore < 50) recommendations.push("Check soil pH and nutrient levels")
  if (visionScore > 80) recommendations.push("Consult agricultural specialist")

  return recommendations.slice(0, 3) // Return top 3 recommendations
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()

    const visionScore = await analyzeVisionData(body.imageData)
    const audioScore = await analyzeAudioData(body.audioData)
    const sensorScore = analyzeSensorData(body.sensorData)

    // Calculate overall score
    const overallScore = Math.round((visionScore + audioScore + sensorScore) / 3)

    // Generate insights
    const riskFactors = generateRiskFactors(visionScore, audioScore, sensorScore)
    const recommendations = generateRecommendations(visionScore, audioScore, sensorScore)

    const result: AnalysisResult = {
      overallScore,
      visionScore,
      audioScore,
      sensorScore,
      riskFactors,
      recommendations,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
