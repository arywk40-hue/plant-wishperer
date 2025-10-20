import { NextResponse } from "next/server"
import { enqueueTrainingJob } from "@/lib/model-manager"
import { DEFAULT_DATASET_PATH } from "@/config/analysis-config"

export async function POST(req: Request) {
  try {
    const body = await req.json()
  const datasetPath = body?.datasetPath || DEFAULT_DATASET_PATH
    const epochs = body?.epochs || 5
    const job = await enqueueTrainingJob({ datasetPath, epochs })
    return NextResponse.json({ ...job })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
