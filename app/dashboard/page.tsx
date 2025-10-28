"use client"

import { useState } from "react"
import dynamic from 'next/dynamic'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ImageIcon, Zap, Wind, Mic } from "lucide-react"
import UploadPanel from "@/components/dashboard/upload-panel"
import DashboardHeader from "@/components/dashboard/dashboard-header"
const AnalysisResults = dynamic(() => import('@/components/dashboard/analysis-results'), { ssr: false })
const RealTimeSensorMonitor = dynamic(() => import('@/components/dashboard/real-time-sensor-monitor'), { ssr: false })
const QuickSensorEntry = dynamic(() => import('@/components/dashboard/quick-sensor-entry'), { ssr: false })
const WeatherFetcher = dynamic(() => import('@/components/dashboard/weather-fetcher'), { ssr: false })
import Tooltip from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import AlertSystem from "@/components/dashboard/alert-system"
import RecommendationsEngine from "@/components/dashboard/recommendations-engine"
import TrainingStatus from "@/components/dashboard/training-status"

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
  const [modalityResults, setModalityResults] = useState<Record<string, any>>({})
  const [liveSensorReadings, setLiveSensorReadings] = useState<{
    moisture: number
    temperature: number
    humidity: number
    ph: number
  } | null>(null)
  const [liveSensorDataSeries, setLiveSensorDataSeries] = useState<any[] | null>(null)
  const [lastPredictInfo, setLastPredictInfo] = useState<{ category: string; time: string; preview: string } | null>(null)

  const handleFileUpload = (category: string, count: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [category]: prev[category] + count,
    }))
  }

  const handlePredictResult = (category: string, data: any) => {
  // Map backend response to analysisResults shape. Support multiple shapes:
    //  - { overall, vision, audio, sensor } (model-manager fallback or aggregated result)
    //  - { results: { filename: { predictions: [...] } } } or array of per-file results
    //  - single sensor payload {moisture, temperature, humidity, ph} or series
    const payload = data?.result || data

    // conservative defaults
    let vision = 65
    let audio = 60
    let sensor = 70

    try {
      if (payload) {
        // special-case Open-Meteo-like weather payloads: compute a simple weather score from hourly data
        if (category === 'weather' && payload.hourly) {
          try {
            // Prefer server-provided weatherScore when model/server calculates it
            if (payload.weatherScore !== undefined) {
              sensor = Number(payload.weatherScore)
            } else {
              const hourly = payload.hourly
              const temps: number[] = hourly.temperature_2m || []
              const hums: number[] = hourly.relativehumidity_2m || []
              const prec: number[] = hourly.precipitation || []
              const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
              const variance = (arr: number[]) => {
                if (!arr.length) return 0
                const m = avg(arr)
                return arr.reduce((s, v) => s + (v - m) * (v - m), 0) / arr.length
              }

              const avgTemp = avg(temps)
              const tempVar = Math.sqrt(variance(temps))
              const avgHum = avg(hums)
              const humVar = Math.sqrt(variance(hums))
              const totalPrecip = prec.length ? prec.reduce((a: number, b: number) => a + b, 0) : 0
              // PM2.5 array may be present as pm2_5 or pm25 depending on API
              const pmArr: number[] = hourly.pm2_5 || hourly.pm25 || []
              const avgPM25 = (pmArr.length ? pmArr.reduce((a, b) => a + b, 0) / pmArr.length : undefined)

              // Tuned weighted scoring (more sensitive)
              // Increase multipliers so deviations and variability reduce score more noticeably.
              const tempPenalty = Math.min(80, Math.abs(avgTemp - 25) * 3 + tempVar * 1.0)
              const humPenalty = avgHum < 50 ? (50 - avgHum) * 0.8 + humVar * 0.5 : humVar * 0.5
              const precipPenalty = Math.min(60, totalPrecip * 0.3)

              let weatherScore = 100 - tempPenalty - humPenalty - precipPenalty
              // apply AQI-style penalty: mild for 25-50, larger for >50
              if (avgPM25 !== undefined) {
                if (avgPM25 > 150) weatherScore -= 30
                else if (avgPM25 > 100) weatherScore -= 20
                else if (avgPM25 > 50) weatherScore -= 10
                else if (avgPM25 > 25) weatherScore -= 5
              }
              weatherScore = Math.max(0, Math.min(100, Math.round(weatherScore)))
              sensor = Math.round(weatherScore)

              // expose pm2_5 back into payload for UI
              if (avgPM25 !== undefined) payload.avgPM25 = Number(avgPM25.toFixed(2))

              // send to server debug logger for calibration (non-blocking)
              try {
                fetch('/api/debug/weather-log', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ payload, weatherScore: sensor, ts: new Date().toISOString() }),
                }).catch(() => {})
              } catch (e) {}
            }
          } catch (err) {
            console.error('Error computing weather score', err)
          }
        }

        // 1) direct aggregate shape from model-manager fallback or server
        if (typeof payload === 'object' && (payload.vision !== undefined || payload.audio !== undefined || payload.sensor !== undefined || payload.overall !== undefined)) {
          vision = Number(payload.vision ?? vision)
          audio = Number(payload.audio ?? audio)
          sensor = Number(payload.sensor ?? sensor)

          // map sensor readings if present directly
          if (category === 'sensors' && (payload.moisture !== undefined || payload.temperature !== undefined || payload.humidity !== undefined || payload.ph !== undefined)) {
            setLiveSensorReadings({
              moisture: Number(payload.moisture ?? 0),
              temperature: Number(payload.temperature ?? 0),
              humidity: Number(payload.humidity ?? 0),
              ph: Number(payload.ph ?? 0),
            })
          }

        } else {
          // 2) more complex shapes: results keyed by filename or arrays
          const predictions = payload?.results || payload
          const all = Array.isArray(predictions) ? predictions : Object.values(predictions || {})

          all.forEach((p: any) => {
            // skip primitive entries (numbers, strings) when object was an aggregate map
            if (p === null || typeof p === 'number' || typeof p === 'string') return

            const preds = p?.predictions || p?.result?.predictions || []
            preds.forEach((pr: any) => {
              const cls = (pr.class || pr.label || '').toString()
              const sc = Number(pr.score ?? pr.confidence ?? 0)
              if (cls.toLowerCase().includes('leaf') || cls.toLowerCase().includes('disease')) vision = Math.max(vision, sc || 0)
              if (cls.toLowerCase().includes('sound') || cls.toLowerCase().includes('stress')) audio = Math.max(audio, sc || 0)
              if (category === 'sensors') sensor = Math.max(sensor, sc || 0)
            })

            // If the backend returned sensor readings directly, map them to live display
            if (category === 'sensors') {
              // Common payload shapes: p may be an object with keys, or p.raw may contain readings
              const candidate = p?.raw && typeof p.raw === 'object' ? p.raw : p
              if (candidate && (candidate.moisture !== undefined || candidate.temperature !== undefined || candidate.humidity !== undefined || candidate.ph !== undefined)) {
                // if candidate is an array of readings
                if (Array.isArray(candidate)) {
                  const latest = candidate[candidate.length - 1]
                  if (latest) {
                    setLiveSensorReadings({
                      moisture: Number(latest.moisture ?? 0),
                      temperature: Number(latest.temperature ?? 0),
                      humidity: Number(latest.humidity ?? 0),
                      ph: Number(latest.ph ?? 0),
                    })
                    setLiveSensorDataSeries(candidate)
                  }
                } else {
                  setLiveSensorReadings({
                    moisture: Number(candidate.moisture ?? 0),
                    temperature: Number(candidate.temperature ?? 0),
                    humidity: Number(candidate.humidity ?? 0),
                    ph: Number(candidate.ph ?? 0),
                  })
                }
              }
            }
          })
        }
      }
    } catch (e) {
      console.error('Error mapping predictions', e)
    }

    // store this modality's raw payload so we can gate the multimodal analysis until all modalities are present
    setModalityResults((prev) => ({ ...prev, [category]: data }))

    // Determine required modalities
    const required = ['images', 'audio', 'sensors', 'weather']
    const missing = required.filter((m) => !((m in modalityResults) || m === category))
    if (missing.length > 0) {
      // do not compute overall yet; update debug preview and exit
      const overall = Math.round((vision + audio + sensor) / 3)
      setLastPredictInfo((prev) => prev || { category, time: new Date().toISOString(), preview: JSON.stringify(data).slice(0, 200) })
      // show partial analysis only in debug, but do not set analysisResults
      return
    }

    const overall = Math.round((vision + audio + sensor) / 3)
    setAnalysisResults({ score: overall, riskData: { vision: Math.round(vision), audio: Math.round(audio), sensor: Math.round(sensor) } })
    try {
      const preview = JSON.stringify(data && data.result ? data.result : data).slice(0, 400)
      setLastPredictInfo({ category, time: new Date().toISOString(), preview })
    } catch (e) {
      setLastPredictInfo({ category, time: new Date().toISOString(), preview: 'unserializable' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TrainingStatus />
        {/* Main Content */}
        
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
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Real-Time Sensor Monitoring</h2>
            <Tooltip content={<>Sensor readings come from uploaded CSV/JSON sensor files (timestamp, soil_moisture, temperature, humidity, ph). Use ISO timestamps and numeric values.</>}>
              <Info className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <div className="grid lg:grid-cols-3 gap-4 items-start">
            <RealTimeSensorMonitor currentReadings={liveSensorReadings ?? undefined} sensorData={liveSensorDataSeries ?? undefined} />
            <div className="lg:col-span-2 space-y-4">
              <QuickSensorEntry onResult={handlePredictResult} onUpload={handleFileUpload} />
              <WeatherFetcher onResult={handlePredictResult} />
            </div>
          </div>
          <div className="mt-3">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm text-gray-600 font-medium">Last prediction (debug)</p>
              {lastPredictInfo ? (
                <div className="text-xs text-gray-700 mt-2">
                  <p>Category: {lastPredictInfo.category}</p>
                  <p>Time: {new Date(lastPredictInfo.time).toLocaleString()}</p>
                  <pre className="mt-2 p-2 bg-white border rounded text-xs overflow-auto">{lastPredictInfo.preview}</pre>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">No prediction results received yet. Try Quick Sensor Entry or upload sensor CSV/JSON.</p>
              )}
            </div>
          </div>
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
            onResult={handlePredictResult}
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
            onResult={handlePredictResult}
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
            onResult={handlePredictResult}
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
            onResult={handlePredictResult}
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

        {analysisResults ? (
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
        ) : (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Multimodal Analysis</h2>
            <div className="p-6 border rounded bg-yellow-50">
              <p className="font-medium">Analysis withheld — missing data from these modalities:</p>
              <ul className="mt-3 list-disc ml-6 text-sm text-gray-700">
                {['images', 'audio', 'sensors', 'weather'].filter((m) => !(m in modalityResults)).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <p className="text-xs text-gray-600 mt-3">Upload the missing modalities or use Quick Sensor Entry / Weather Analyze to include data, then the Multimodal Analysis will appear.</p>
            </div>
            <div className="mt-4 p-4 border rounded bg-white">
              <h3 className="font-semibold mb-2">Weather Score Bands</h3>
              <ul className="text-sm text-gray-700">
                <li><strong>0–30</strong> Severe risk — urgent action (irrigate/drain/protect)</li>
                <li><strong>31–50</strong> High risk — scout & take corrective measures</li>
                <li><strong>51–70</strong> Moderate risk — monitor closely</li>
                <li><strong>71–85</strong> Good — mostly favorable</li>
                <li><strong>86–100</strong> Optimal — ideal conditions</li>
              </ul>
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