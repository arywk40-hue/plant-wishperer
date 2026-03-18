import { NextResponse } from "next/server"
import { getTrainingJob } from "@/lib/model-manager"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const jobId = url.searchParams.get("jobId")
    if (!jobId) return NextResponse.json({ ok: false, error: "jobId required" }, { status: 400 })

    const job = getTrainingJob(jobId)
    if (!job) return NextResponse.json({ ok: false, error: "job not found" }, { status: 404 })

    return NextResponse.json({ ok: true, status: job.status, progress: job.progress, job })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
