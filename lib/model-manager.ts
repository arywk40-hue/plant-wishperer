// Lightweight model manager placeholder. In production, replace with real model loading and job queue.
import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import FormData from "form-data"
import crypto from 'crypto'

export async function predictFromFiles(files: { path: string; originalname?: string }[], category?: string) {
  const modelServer = process.env.MODEL_SERVER_URL
  if (modelServer) {
    // Forward multipart files to the model server /predict endpoints.
    // For simplicity, send the first file to /predict/image, second to /predict/audio, etc.
    try {
      const results: any = {}
      // Determine target endpoint based on category, otherwise use heuristic by file index
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        const endpoint = category === "image" ? "image" : category === "audio" ? "audio" : category === "sensor" ? "sensor" : (i === 0 ? "image" : i === 1 ? "audio" : "sensor")
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

  // Fallback deterministic behavior
  // Use file metadata (name + size + mtime) to generate stable pseudo-random scores per upload.
  const scores: number[] = []
  // sensor aggregate holders
  let sensorSeries: any[] = []
  let moistureVals: number[] = []
  let tempVals: number[] = []
  let humVals: number[] = []
  let phVals: number[] = []

  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    try {
      const stat = fs.existsSync(f.path) ? fs.statSync(f.path) : null
      const seed = `${f.originalname || path.basename(f.path || '')}:${stat ? stat.size : '0'}:${stat ? stat.mtimeMs : Date.now()}`
      const h = crypto.createHash('md5').update(seed).digest('hex')
      // take a slice of the hash and convert to integer
      const num = parseInt(h.slice(0, 8), 16)
      // map to 40-100 range
      const score = 40 + (num % 61)
      scores.push(score)

      // If category is sensors, attempt to parse the file contents and extract readings
      if (category === 'sensors' && fs.existsSync(f.path)) {
        const txt = fs.readFileSync(f.path, 'utf8')
        // try JSON first
        try {
          const parsed = JSON.parse(txt)
          if (Array.isArray(parsed)) {
            // array of readings
            const arr = parsed.map((r: any) => ({
              time: r.timestamp || r.time || new Date().toISOString(),
              moisture: Number(r.soil_moisture ?? r.moisture ?? r.moisture_pct ?? 0),
              temperature: Number(r.temperature ?? r.temp ?? 0),
              humidity: Number(r.humidity ?? r.hum ?? 0),
              ph: Number(r.ph ?? 0),
            }))
            sensorSeries = sensorSeries.concat(arr)
            arr.forEach((s) => {
              if (!Number.isNaN(s.moisture)) moistureVals.push(s.moisture)
              if (!Number.isNaN(s.temperature)) tempVals.push(s.temperature)
              if (!Number.isNaN(s.humidity)) humVals.push(s.humidity)
              if (!Number.isNaN(s.ph)) phVals.push(s.ph)
            })
          } else if (typeof parsed === 'object' && parsed !== null) {
            // single reading object
            const r = {
              time: parsed.timestamp || parsed.time || new Date().toISOString(),
              moisture: Number(parsed.soil_moisture ?? parsed.moisture ?? parsed.moisture_pct ?? 0),
              temperature: Number(parsed.temperature ?? parsed.temp ?? 0),
              humidity: Number(parsed.humidity ?? parsed.hum ?? 0),
              ph: Number(parsed.ph ?? 0),
            }
            sensorSeries.push(r)
            if (!Number.isNaN(r.moisture)) moistureVals.push(r.moisture)
            if (!Number.isNaN(r.temperature)) tempVals.push(r.temperature)
            if (!Number.isNaN(r.humidity)) humVals.push(r.humidity)
            if (!Number.isNaN(r.ph)) phVals.push(r.ph)
          }
        } catch (e) {
          // not JSON, try CSV simple parse
          const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
          if (lines.length > 1) {
            const headers = lines[0].split(/,|;|\t/).map(h => h.trim())
            for (let li = 1; li < lines.length; li++) {
              const cols = lines[li].split(/,|;|\t/).map(c => c.trim())
              const obj: any = {}
              for (let hi = 0; hi < headers.length; hi++) obj[headers[hi]] = cols[hi]
              const r = {
                time: obj.timestamp || obj.time || new Date().toISOString(),
                moisture: Number(obj.soil_moisture ?? obj.moisture ?? obj.moisture_pct ?? 0),
                temperature: Number(obj.temperature ?? obj.temp ?? 0),
                humidity: Number(obj.humidity ?? obj.hum ?? 0),
                ph: Number(obj.ph ?? 0),
              }
              sensorSeries.push(r)
              if (!Number.isNaN(r.moisture)) moistureVals.push(r.moisture)
              if (!Number.isNaN(r.temperature)) tempVals.push(r.temperature)
              if (!Number.isNaN(r.humidity)) humVals.push(r.humidity)
              if (!Number.isNaN(r.ph)) phVals.push(r.ph)
            }
          }
        }
      }
    } catch (err) {
      // fallback if stat fails
      scores.push(60)
    }
  }

  // If no files provided, produce a pseudo-random but deterministic result using time bucket
  if (scores.length === 0) {
    const t = Math.floor(Date.now() / (1000 * 60)) // minute bucket
    const h = crypto.createHash('md5').update(String(t)).digest('hex')
    const num = parseInt(h.slice(0, 8), 16)
    scores.push(50 + (num % 51))
  }

  // Compute averages for sensor readings if available
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined)
  const avgMoisture = avg(moistureVals)
  const avgTemp = avg(tempVals)
  const avgHum = avg(humVals)
  const avgPh = avg(phVals)

  // If we have sensor averages, compute a simple sensor score from ranges
  let sensorScoreFromReadings: number | undefined = undefined
  if (avgMoisture !== undefined || avgTemp !== undefined || avgHum !== undefined || avgPh !== undefined) {
    // start at 100 and penalize deviations from ideal ranges
    let sscore = 100
    if (avgMoisture !== undefined) {
      // ideal 40-70
      const idealCenter = 55
      sscore -= Math.min(40, Math.abs(avgMoisture - idealCenter) * 0.6)
    }
    if (avgTemp !== undefined) {
      // ideal center 25
      sscore -= Math.min(30, Math.abs(avgTemp - 25) * 1.5)
    }
    if (avgHum !== undefined) {
      // ideal 50-80
      if (avgHum < 50) sscore -= (50 - avgHum) * 0.5
      else if (avgHum > 80) sscore -= (avgHum - 80) * 0.3
    }
    if (avgPh !== undefined) {
      // ideal 6.0-7.0
      if (avgPh < 6) sscore -= (6 - avgPh) * 5
      else if (avgPh > 7) sscore -= (avgPh - 7) * 5
    }
    sensorScoreFromReadings = Math.max(10, Math.min(100, Math.round(sscore)))
  }

  // Build result object
  const result: any = {
    overall: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    vision: scores[0] ?? 65,
    audio: scores[1] ?? 60,
    sensor: sensorScoreFromReadings ?? (scores[2] ?? 55),
    recommendations: [] as string[],
  }

  if (avgMoisture !== undefined) result.moisture = Number(Number(avgMoisture).toFixed(2))
  if (avgTemp !== undefined) result.temperature = Number(Number(avgTemp).toFixed(2))
  if (avgHum !== undefined) result.humidity = Number(Number(avgHum).toFixed(2))
  if (avgPh !== undefined) result.ph = Number(Number(avgPh).toFixed(2))
  if (sensorSeries.length) result.sensorDataSeries = sensorSeries

  // Simple deterministic recommendation logic
  const low = Math.min(result.vision ?? 100, result.audio ?? 100, result.sensor ?? 100)
  if (low === result.vision) result.recommendations.push('Vision model suggests visual inspection of leaves for disease.')
  if (low === result.audio) result.recommendations.push('Audio model suggests checking for plant stress sounds near deployment time.')
  if (low === result.sensor) result.recommendations.push('Sensor data indicates environmental tuning (water/nutrients) may help.')

  return result
}

export async function enqueueTrainingJob(opts: { datasetPath: string; epochs?: number }) {
  // Save metadata; in production use a queue like Bull/Redis
  const jobsDir = path.join(process.cwd(), "model-jobs")
  if (!fs.existsSync(jobsDir)) fs.mkdirSync(jobsDir)
  const jobId = `job-${Date.now()}`
  const jobObj = { ...opts, status: 'queued', createdAt: new Date().toISOString() }
  fs.writeFileSync(path.join(jobsDir, `${jobId}.json`), JSON.stringify(jobObj))
  return { jobId }
}
