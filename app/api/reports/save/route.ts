import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

type SavedReport = {
  title?: string
  date?: string
  type?: string
  score?: number
  healthTrendData?: any
  diseaseDetectionData?: any
}

function isValidReportPayload(obj: any): obj is SavedReport {
  if (!obj || typeof obj !== 'object') return false
  // basic checks: must include either healthTrendData or diseaseDetectionData or reports summary
  if (obj.healthTrendData || obj.diseaseDetectionData || obj.reports) return true
  // or a minimal report summary
  if (typeof obj.score === 'number' || typeof obj.title === 'string') return true
  return false
}

/**
 * Optional API key enforcement for report routes.
 *
 * Behavior:
 * - If the environment variable REPORTS_API_KEY is NOT set, the routes are open (no auth).
 * - If REPORTS_API_KEY is set, the request must include the key in the `x-api-key` header
 *   or the `Authorization: Bearer <key>` header. Requests without the correct key return 401.
 */
function requireApiKey(req: Request) {
  const configured = process.env.REPORTS_API_KEY
  if (!configured) return true
  const header = req.headers.get('x-api-key') || req.headers.get('authorization') || ''
  // allow Bearer <key>
  const key = header.startsWith('Bearer ') ? header.slice(7) : header
  return key === configured
}

export async function POST(req: Request) {
  try {
    // optional API key enforcement
    if (!requireApiKey(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const body = await req.json()

    if (!isValidReportPayload(body)) {
      return NextResponse.json({ ok: false, error: 'invalid report payload' }, { status: 400 })
    }

    const logsDir = path.join(process.cwd(), 'logs')
    try {
      await fs.access(logsDir)
    } catch (e) {
      await fs.mkdir(logsDir)
    }
    const file = path.join(logsDir, 'reports.json')
    let arr: any[] = []
    try {
      const txt = await fs.readFile(file, 'utf8')
      arr = JSON.parse(txt || '[]')
    } catch (e) {
      arr = []
    }
    const entry = { id: Date.now(), createdAt: new Date().toISOString(), payload: body }
    arr.push(entry)
    await fs.writeFile(file, JSON.stringify(arr.slice(-200), null, 2))
    return NextResponse.json({ ok: true, entry })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
