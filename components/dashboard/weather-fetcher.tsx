"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  onResult?: (category: string, result: any) => void
}

export default function WeatherFetcher({ onResult }: Props) {
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [message, setMessage] = useState<string | null>(null)

  const fetchWeather = async () => {
    setMessage(null)
    if (!lat || !lon) {
      setMessage('Please provide latitude and longitude or use "Use my location".')
      return
    }
    setLoading(true)
    try {
      const parsedLat = normalizeCoordinate(lat)
      const parsedLon = normalizeCoordinate(lon)
      if (Number.isNaN(parsedLat) || Number.isNaN(parsedLon)) {
        setMessage('Could not parse coordinates. Please enter decimal degrees or use the location button.')
        setLoading(false)
        return
      }
      const res = await fetch(`/api/weather/last7?lat=${encodeURIComponent(String(parsedLat))}&lon=${encodeURIComponent(String(parsedLon))}`)
      const data = await res.json()
      if (data && data.ok) {
        setSummary(data.result)
      } else {
        console.error('Weather fetch failed', data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const analyzeWeather = () => {
    // If we have a fetched summary, prefer that. Otherwise attempt a quick fetch; if that fails compute a simple score.
    const doSend = (payload: any) => {
      // include a weatherScore if not present. Use empty arrays as fallback when hourly is missing.
      if (payload.weatherScore === undefined) {
        try {
          const hourly = payload.hourly || {}
          const temps: number[] = Array.isArray(hourly.temperature_2m) ? hourly.temperature_2m : []
          const hums: number[] = Array.isArray(hourly.relativehumidity_2m) ? hourly.relativehumidity_2m : []
          const prec: number[] = Array.isArray(hourly.precipitation) ? hourly.precipitation : []
          const pmArr: number[] = Array.isArray(hourly.pm2_5) ? hourly.pm2_5 : Array.isArray(hourly.pm25) ? hourly.pm25 : []

          const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN)
          const variance = (arr: number[]) => {
            if (!arr.length) return 0
            const m = avg(arr)
            return arr.reduce((s, v) => s + (v - m) * (v - m), 0) / arr.length
          }

          // Use neutral defaults when data is missing so we don't harshly penalize empty payloads
          const hasTemps = temps.length > 0
          const hasHums = hums.length > 0
          const avgTemp = hasTemps ? avg(temps) : 25 // neutral 25°C
          const tempVar = hasTemps ? Math.sqrt(variance(temps)) : 0
          const avgHum = hasHums ? avg(hums) : 65 // neutral comfortable humidity
          const humVar = hasHums ? Math.sqrt(variance(hums)) : 0
          const totalPrecip = prec.length ? prec.reduce((a: number, b: number) => a + b, 0) : 0

          // Apply penalties only when there is data to justify them
          const tempPenalty = hasTemps ? Math.min(80, Math.abs(avgTemp - 25) * 2 + tempVar * 0.8) : 0
          const humPenalty = hasHums ? (avgHum < 50 ? (50 - avgHum) * 0.6 + humVar * 0.4 : humVar * 0.4) : 0
          const precipPenalty = prec.length ? Math.min(60, totalPrecip * 0.25) : 0

          let weatherScore = 100 - tempPenalty - humPenalty - precipPenalty

          // PM2.5 penalty (apply gradually and cap)
          const avgPM25 = (pmArr.length ? pmArr.reduce((a, b) => a + b, 0) / pmArr.length : undefined)
          if (avgPM25 !== undefined && !Number.isNaN(avgPM25)) {
            // softer penalty curve
            if (avgPM25 > 150) weatherScore -= 25
            else if (avgPM25 > 100) weatherScore -= 15
            else if (avgPM25 > 50) weatherScore -= 8
            else if (avgPM25 > 25) weatherScore -= 4
            payload.avgPM25 = Number((avgPM25).toFixed(2))
          }

          // If no meaningful input data was present, produce a neutral mid-high score
          const hadAnyData = hasTemps || hasHums || prec.length || (avgPM25 !== undefined)
          if (!hadAnyData) {
            weatherScore = 72
          }

          weatherScore = Math.max(0, Math.min(100, Math.round(weatherScore)))
          payload.weatherScore = weatherScore
        } catch (err) {
          // ignore
        }
      }
      onResult && onResult('weather', { result: payload })
      setMessage('Analyzed: weatherScore=' + (payload.weatherScore ?? 'n/a'))
    }

    if (summary) {
      doSend(summary)
      return
    }

    // no summary fetched: try a quick fetch if coordinates provided
    const parsedLat = normalizeCoordinate(lat)
    const parsedLon = normalizeCoordinate(lon)
    if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLon)) {
      setLoading(true)
      fetch(`/api/weather/last7?lat=${encodeURIComponent(String(parsedLat))}&lon=${encodeURIComponent(String(parsedLon))}`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d.ok && d.result) doSend(d.result)
          else doSend({ hourly: { temperature_2m: [], relativehumidity_2m: [], precipitation: [] } })
        })
        .catch(() => doSend({ hourly: { temperature_2m: [], relativehumidity_2m: [], precipitation: [] } }))
        .finally(() => setLoading(false))
    } else {
      // no coords: compute a neutral payload
      doSend({ hourly: { temperature_2m: [], relativehumidity_2m: [], precipitation: [] } })
    }
  }

  // Attempt to use browser geolocation to fill lat/lon. Handles permission and errors.
  const useMyLocation = () => {
    setMessage(null)
    if (!navigator || !navigator.geolocation) {
      setMessage('Geolocation is not available in this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude
        const longitude = pos.coords.longitude
        setLat(String(Number(latitude.toFixed(6))))
        setLon(String(Number(longitude.toFixed(6))))
        setMessage('Location detected. Click Fetch Weather.')
      },
      (err) => {
        console.error('Geolocation error', err)
        setMessage('Could not get location: ' + (err.message || 'permission denied'))
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }

  // Normalize strings like "31.78425° N" or "31.78425 N" to decimal degrees.
  function normalizeCoordinate(input: string): number {
    if (!input) return NaN
    const s = String(input).trim()
    // detect N/S/E/W
    const nsMatch = s.match(/([NnSs])$/)
    const ewMatch = s.match(/([EeWw])$/)
    let value = s
    // remove directional letters and degree symbol
    value = value.replace(/[°\s\u00B0]/g, '').replace(/[NnSsEeWw]/g, '')
    // replace comma with dot for locales
    value = value.replace(/,/g, '.')
    const n = Number(value)
    if (Number.isNaN(n)) return NaN
    if (nsMatch) {
      const dir = nsMatch[1].toUpperCase()
      return dir === 'S' ? -Math.abs(n) : Math.abs(n)
    }
    if (ewMatch) {
      const dir = ewMatch[1].toUpperCase()
      return dir === 'W' ? -Math.abs(n) : Math.abs(n)
    }
    return n
  }

  return (
    <Card className="p-4 border-cyan-200">
      <h4 className="font-semibold text-gray-900 mb-2">Weather (last 7 days)</h4>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input className="p-2 border rounded" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
        <input className="p-2 border rounded" placeholder="Longitude" value={lon} onChange={(e) => setLon(e.target.value)} />
      </div>
      <div className="flex gap-2">
          <Button variant="outline" onClick={useMyLocation}>Use my location</Button>
          <Button variant="outline" onClick={fetchWeather} disabled={loading}>{loading ? 'Fetching...' : 'Fetch Weather'}</Button>
          <Button onClick={analyzeWeather} disabled={loading}>{loading ? 'Working...' : 'Analyze'}</Button>
        </div>
      {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
      {summary && (
        <div className="mt-3 text-sm text-gray-600">
          <p>Data fetched for {summary.latitude}, {summary.longitude}. Use Analyze to include into the multimodal analysis.</p>
          {summary.avgPM25 !== undefined && (
            <p className="mt-1 text-xs text-red-600">Avg PM2.5 (last 7 days): {summary.avgPM25} µg/m³ — high values reduce weather score</p>
          )}
        </div>
      )}
    </Card>
  )
}
