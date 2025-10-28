import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

/**
 * Optional API key enforcement for report routes.
 * If REPORTS_API_KEY is set in env, callers must provide it via `x-api-key` or
 * `Authorization: Bearer <key>` header. If not set, the route is open.
 */
function requireApiKey(req: Request) {
  const configured = process.env.REPORTS_API_KEY
  if (!configured) return true
  const header = req.headers.get('x-api-key') || req.headers.get('authorization') || ''
  const key = header.startsWith('Bearer ') ? header.slice(7) : header
  return key === configured
}

export async function POST(req: Request) {
  try {
    if (!requireApiKey(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    const body = await req.json()
    const id = body?.id
    if (!id) return NextResponse.json({ ok: false, error: 'missing id' }, { status: 400 })

    const file = path.join(process.cwd(), 'logs', 'reports.json')
    try {
      await fs.access(file)
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'no reports' }, { status: 404 })
    }
    let arr: any[] = []
    try {
      const txt = await fs.readFile(file, 'utf8')
      arr = JSON.parse(txt || '[]')
    } catch (e) {
      arr = []
    }
    const before = arr.length
    arr = arr.filter((r: any) => String(r.id) !== String(id))
    if (arr.length === before) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
    await fs.writeFile(file, JSON.stringify(arr.slice(-200), null, 2))
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
