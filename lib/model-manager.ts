import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import FormData from "form-data"

const NEUTRAL_MODEL_SCORE = 65

type UploadFile = { path: string; originalname?: string }

export type TrainingJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled"

interface TrainingJobRecord {
  datasetPath: string
  epochs?: number
  status: TrainingJobStatus
  progress: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  error?: string
}

function normalizeCategory(category?: string) {
  if (category === "images" || category === "image") return "image"
  if (category === "audio") return "audio"
  if (category === "sensors" || category === "sensor") return "sensor"
  if (category === "weather") return "weather"
  return undefined
}

function getJobsDir() {
  return path.join(process.cwd(), "model-jobs")
}

function createNeutralResult(normalizedCategory?: string) {
  return {
    overall: NEUTRAL_MODEL_SCORE,
    vision: normalizedCategory === "audio" ? 0 : NEUTRAL_MODEL_SCORE,
    audio: normalizedCategory === "image" ? 0 : NEUTRAL_MODEL_SCORE,
    sensor: normalizedCategory === "image" || normalizedCategory === "audio" ? 0 : NEUTRAL_MODEL_SCORE,
    source: "neutral_fallback",
    recommendations: [
      "Connect a model server with MODEL_SERVER_URL to replace the neutral fallback for image and audio analysis.",
    ],
  }
}

function getTrainingProgress(status?: string, progress?: number) {
  if (typeof progress === "number") return progress
  if (status === "completed") return 100
  if (status === "running") return 50
  if (status === "queued") return 10
  return 0
}

function parseSensorSeries(files: UploadFile[]) {
  let sensorSeries: Array<{ time: string; moisture: number; temperature: number; humidity: number; ph: number }> = []
  const moistureVals: number[] = []
  const tempVals: number[] = []
  const humVals: number[] = []
  const phVals: number[] = []

  for (const file of files) {
    if (!fs.existsSync(file.path)) continue
    const txt = fs.readFileSync(file.path, "utf8")

    try {
      const parsed = JSON.parse(txt)
      if (Array.isArray(parsed)) {
        const arr = parsed.map((row: any) => ({
          time: row.timestamp || row.time || new Date().toISOString(),
          moisture: Number(row.soil_moisture ?? row.moisture ?? row.moisture_pct ?? 0),
          temperature: Number(row.temperature ?? row.temp ?? 0),
          humidity: Number(row.humidity ?? row.hum ?? 0),
          ph: Number(row.ph ?? 0),
        }))
        sensorSeries = sensorSeries.concat(arr)
      } else if (typeof parsed === "object" && parsed !== null) {
        sensorSeries.push({
          time: parsed.timestamp || parsed.time || new Date().toISOString(),
          moisture: Number(parsed.soil_moisture ?? parsed.moisture ?? parsed.moisture_pct ?? 0),
          temperature: Number(parsed.temperature ?? parsed.temp ?? 0),
          humidity: Number(parsed.humidity ?? parsed.hum ?? 0),
          ph: Number(parsed.ph ?? 0),
        })
      }
    } catch {
      const lines = txt
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
      if (lines.length <= 1) continue

      const headers = lines[0].split(/,|;|\t/).map((header) => header.trim())
      for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
        const cols = lines[rowIndex].split(/,|;|\t/).map((col) => col.trim())
        const obj: Record<string, string> = {}
        for (let headerIndex = 0; headerIndex < headers.length; headerIndex++) {
          obj[headers[headerIndex]] = cols[headerIndex]
        }
        sensorSeries.push({
          time: obj.timestamp || obj.time || new Date().toISOString(),
          moisture: Number(obj.soil_moisture ?? obj.moisture ?? obj.moisture_pct ?? 0),
          temperature: Number(obj.temperature ?? obj.temp ?? 0),
          humidity: Number(obj.humidity ?? obj.hum ?? 0),
          ph: Number(obj.ph ?? 0),
        })
      }
    }
  }

  sensorSeries.forEach((reading) => {
    if (!Number.isNaN(reading.moisture)) moistureVals.push(reading.moisture)
    if (!Number.isNaN(reading.temperature)) tempVals.push(reading.temperature)
    if (!Number.isNaN(reading.humidity)) humVals.push(reading.humidity)
    if (!Number.isNaN(reading.ph)) phVals.push(reading.ph)
  })

  return { sensorSeries, moistureVals, tempVals, humVals, phVals }
}

export async function predictFromFiles(files: UploadFile[], category?: string) {
  const normalizedCategory = normalizeCategory(category)
  const modelServer = process.env.MODEL_SERVER_URL
  if (modelServer) {
    try {
      const results: any = {}
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        const endpoint =
          normalizedCategory === "image"
            ? "image"
            : normalizedCategory === "audio"
              ? "audio"
              : normalizedCategory === "sensor"
                ? "sensor"
                : i === 0
                  ? "image"
                  : i === 1
                    ? "audio"
                    : "sensor"
        const url = `${modelServer}/predict/${endpoint}`
        const form = new FormData()
        form.append("file", fs.createReadStream(f.path), { filename: f.originalname })
        const res = await fetch(url, {
          method: "POST",
          headers: form.getHeaders(),
          body: form as any,
        })
        const json = await res.json()
        results[f.originalname || `file${i}`] = json
      }
      return { ok: true, results }
    } catch (err: any) {
      return { ok: false, error: err.message }
    }
  }

  if (normalizedCategory !== "sensor") {
    return createNeutralResult(normalizedCategory)
  }

  const { sensorSeries, moistureVals, tempVals, humVals, phVals } = parseSensorSeries(files)

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined)
  const avgMoisture = avg(moistureVals)
  const avgTemp = avg(tempVals)
  const avgHum = avg(humVals)
  const avgPh = avg(phVals)

  let sensorScoreFromReadings: number | undefined = undefined
  if (avgMoisture !== undefined || avgTemp !== undefined || avgHum !== undefined || avgPh !== undefined) {
    let sscore = 100
    if (avgMoisture !== undefined) {
      const idealCenter = 55
      sscore -= Math.min(40, Math.abs(avgMoisture - idealCenter) * 0.6)
    }
    if (avgTemp !== undefined) {
      sscore -= Math.min(30, Math.abs(avgTemp - 25) * 1.5)
    }
    if (avgHum !== undefined) {
      if (avgHum < 50) sscore -= (50 - avgHum) * 0.5
      else if (avgHum > 80) sscore -= (avgHum - 80) * 0.3
    }
    if (avgPh !== undefined) {
      if (avgPh < 6) sscore -= (6 - avgPh) * 5
      else if (avgPh > 7) sscore -= (avgPh - 7) * 5
    }
    sensorScoreFromReadings = Math.max(10, Math.min(100, Math.round(sscore)))
  }

  const result: any = {
    overall: sensorScoreFromReadings ?? NEUTRAL_MODEL_SCORE,
    vision: 0,
    audio: 0,
    sensor: sensorScoreFromReadings ?? NEUTRAL_MODEL_SCORE,
    source: sensorScoreFromReadings !== undefined ? "sensor_parser" : "neutral_fallback",
    recommendations: [] as string[],
  }

  if (avgMoisture !== undefined) result.moisture = Number(Number(avgMoisture).toFixed(2))
  if (avgTemp !== undefined) result.temperature = Number(Number(avgTemp).toFixed(2))
  if (avgHum !== undefined) result.humidity = Number(Number(avgHum).toFixed(2))
  if (avgPh !== undefined) result.ph = Number(Number(avgPh).toFixed(2))
  if (sensorSeries.length) result.sensorDataSeries = sensorSeries

  if (sensorScoreFromReadings === undefined) {
    result.recommendations.push("No usable sensor readings were found in the uploaded file.")
  } else {
    result.recommendations.push("Sensor data indicates environmental tuning (water/nutrients) may help.")
  }

  return result
}

export async function enqueueTrainingJob(opts: { datasetPath: string; epochs?: number }) {
  const jobsDir = getJobsDir()
  if (!fs.existsSync(jobsDir)) fs.mkdirSync(jobsDir)
  const jobId = `job-${Date.now()}`
  const jobObj: TrainingJobRecord = {
    ...opts,
    status: "queued",
    progress: 0,
    createdAt: new Date().toISOString(),
  }
  fs.writeFileSync(path.join(jobsDir, `${jobId}.json`), JSON.stringify(jobObj, null, 2))
  return { jobId }
}

export function getTrainingJob(jobId: string) {
  const jobPath = path.join(getJobsDir(), `${jobId}.json`)
  if (!fs.existsSync(jobPath)) return null

  const content = JSON.parse(fs.readFileSync(jobPath, "utf-8"))
  const status = (content.status || "completed") as TrainingJobStatus
  return {
    ...content,
    status,
    progress: getTrainingProgress(status, content.progress),
  }
}
