export interface SensorReading {
  moisture: number
  temperature: number
  humidity: number
  ph: number
  timestamp: Date
}

export interface CropAnalysis {
  id: string
  fieldId: string
  timestamp: Date
  visionScore: number
  audioScore: number
  sensorScore: number
  overallScore: number
  riskFactors: string[]
  recommendations: string[]
}

// Parse CSV sensor data
export function parseSensorCSV(csvContent: string): SensorReading[] {
  const lines = csvContent.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim())
    const row: Record<string, string> = {}

    headers.forEach((header, index) => {
      row[header] = values[index]
    })

    return {
      moisture: Number.parseFloat(row.moisture || "0"),
      temperature: Number.parseFloat(row.temperature || "0"),
      humidity: Number.parseFloat(row.humidity || "0"),
      ph: Number.parseFloat(row.ph || "0"),
      timestamp: new Date(row.timestamp || Date.now()),
    }
  })
}

// Calculate statistics from sensor readings
export function calculateSensorStats(readings: SensorReading[]) {
  if (readings.length === 0) return null

  const moistureValues = readings.map((r) => r.moisture)
  const temperatureValues = readings.map((r) => r.temperature)
  const humidityValues = readings.map((r) => r.humidity)
  const phValues = readings.map((r) => r.ph)

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const min = (arr: number[]) => Math.min(...arr)
  const max = (arr: number[]) => Math.max(...arr)

  return {
    moisture: { avg: avg(moistureValues), min: min(moistureValues), max: max(moistureValues) },
    temperature: { avg: avg(temperatureValues), min: min(temperatureValues), max: max(temperatureValues) },
    humidity: { avg: avg(humidityValues), min: min(humidityValues), max: max(humidityValues) },
    ph: { avg: avg(phValues), min: min(phValues), max: max(phValues) },
  }
}

// Detect anomalies in sensor data
import { ANOMALY_LIMITS } from "@/config/analysis-config"

export function detectAnomalies(readings: SensorReading[]): string[] {
  const anomalies: string[] = []
  const stats = calculateSensorStats(readings)

  if (!stats) return anomalies

  // Check for extreme values using centralized limits
  readings.forEach((reading) => {
    if (reading.moisture < ANOMALY_LIMITS.moisture.min || reading.moisture > ANOMALY_LIMITS.moisture.max) {
      anomalies.push(`Extreme moisture level: ${reading.moisture}%`)
    }
    if (reading.temperature < ANOMALY_LIMITS.temperature.min || reading.temperature > ANOMALY_LIMITS.temperature.max) {
      anomalies.push(`Extreme temperature: ${reading.temperature}°C`)
    }
    if (reading.ph < ANOMALY_LIMITS.ph.min || reading.ph > ANOMALY_LIMITS.ph.max) {
      anomalies.push(`Extreme pH level: ${reading.ph}`)
    }
  })

  return [...new Set(anomalies)] // Remove duplicates
}
