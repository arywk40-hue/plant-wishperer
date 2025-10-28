import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

/**
 * Optional API key enforcement for report routes.
 * See `REPORTS_API_KEY` env var notes in save route.
 */
function requireApiKey(req: Request) {
  const configured = process.env.REPORTS_API_KEY
  if (!configured) return true
  const header = req.headers.get('x-api-key') || req.headers.get('authorization') || ''
  const key = header.startsWith('Bearer ') ? header.slice(7) : header
  return key === configured
}

export async function GET(req: Request) {
  try {
    if (!requireApiKey(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const file = path.join(process.cwd(), 'logs', 'reports.json')
    try {
      await fs.access(file)
    } catch (e) {
      return NextResponse.json({ ok: true, reports: [] })
    }
    const txt = await fs.readFile(file, 'utf8')
    const arr = JSON.parse(txt || '[]')
    return NextResponse.json({ ok: true, reports: arr })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
