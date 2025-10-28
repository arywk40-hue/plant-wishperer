import { NextResponse } from 'next/server'

// Lightweight in-memory cache to reduce external Open-Meteo calls.
// Keys: `${lat},${lon},${startStr},${endStr}`. TTL: 10 minutes.
const weatherCache = new Map<string, { ts: number; data: any }>()
const WEATHER_TTL = 1000 * 60 * 10

// Simple wrapper around Open-Meteo (no API key) to fetch past 7 days hourly data and aggregate daily averages.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const lat = url.searchParams.get('lat')
    const lon = url.searchParams.get('lon')
    if (!lat || !lon) return NextResponse.json({ ok: false, error: 'Missing lat/lon' }, { status: 400 })

    const end = new Date()
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)

    const key = `${lat},${lon},${startStr},${endStr}`
    const cached = weatherCache.get(key)
    if (cached && Date.now() - cached.ts < WEATHER_TTL) {
      return NextResponse.json({ ok: true, result: cached.data, cached: true })
    }

    const api = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&start_date=${startStr}&end_date=${endStr}&hourly=temperature_2m,relativehumidity_2m,precipitation,pm2_5&timezone=UTC&air_quality=pm2_5`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch(api, { signal: controller.signal })
      clearTimeout(timeout)
      const json = await res.json()
      weatherCache.set(key, { ts: Date.now(), data: json })
      return NextResponse.json({ ok: true, result: json })
    } catch (err: any) {
      clearTimeout(timeout)
      return NextResponse.json({ ok: false, error: err.message || 'fetch error' }, { status: 502 })
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
