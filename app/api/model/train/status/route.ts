import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const jobId = url.searchParams.get("jobId")
    if (!jobId) return NextResponse.json({ ok: false, error: "jobId required" }, { status: 400 })

    const jobsDir = path.join(process.cwd(), "model-jobs")
    const jobPath = path.join(jobsDir, `${jobId}.json`)
    if (!fs.existsSync(jobPath)) return NextResponse.json({ ok: false, error: "job not found" }, { status: 404 })

    const content = JSON.parse(fs.readFileSync(jobPath, "utf-8"))
    return NextResponse.json({ ok: true, status: content.status || "unknown", job: content })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
