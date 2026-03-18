import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const jobId = body?.jobId
    if (!jobId) return NextResponse.json({ ok: false, error: "jobId required" }, { status: 400 })

    const jobsDir = path.join(process.cwd(), "model-jobs")
    const jobPath = path.join(jobsDir, `${jobId}.json`)
    if (!fs.existsSync(jobPath)) return NextResponse.json({ ok: false, error: "job not found" }, { status: 404 })

    const content = JSON.parse(fs.readFileSync(jobPath, "utf-8"))
    content.status = "cancelled"
    content.progress = 0
    content.completedAt = new Date().toISOString()
    fs.writeFileSync(jobPath, JSON.stringify(content, null, 2))
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
