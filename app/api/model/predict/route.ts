import { NextResponse } from "next/server"
import { predictFromFiles } from "@/lib/model-manager"
import fs from "fs"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const files: { path: string; originalname?: string }[] = []

    for (const entry of formData.entries()) {
      const [key, value] = entry as [string, any]
      if (value && typeof value === "object" && value instanceof File) {
        // Note: In Next.js Edge runtime, File is available; saving is environment specific.
        // We'll write to a temp file for Node server environments.
  const arrayBuffer = await value.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const tmpPath = `/tmp/${Date.now()}-${value.name}`
  fs.writeFileSync(tmpPath, buffer)
  files.push({ path: tmpPath, originalname: value.name })
      }
    }

  // read optional category
  const category = formData.get("category") as string | null
  const result = await predictFromFiles(files, category || undefined)
    return NextResponse.json({ ok: true, result })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
