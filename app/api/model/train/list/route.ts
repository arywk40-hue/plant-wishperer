import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const jobsDir = path.join(process.cwd(), "model-jobs")
    if (!fs.existsSync(jobsDir)) return NextResponse.json({ ok: true, jobs: [] })
    const files = fs.readdirSync(jobsDir).filter((f) => f.endsWith(".json"))
    const jobs = files.map((f) => {
      const content = JSON.parse(fs.readFileSync(path.join(jobsDir, f), "utf-8"))
      return { id: f.replace(/\.json$/, ""), ...content }
    })
    return NextResponse.json({ ok: true, jobs })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
