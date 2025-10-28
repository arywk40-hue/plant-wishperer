"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function TrainingStatus() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    let cancelled = false
    const pollJob = async () => {
      try {
        // find any queued job file by asking the status route without id (not implemented) - fallback: noop
        // Instead, poll if jobId known (header sets jobId into localStorage)
        const stored = localStorage.getItem("trainingJobId")
        if (stored) setJobId(stored)
        if (!stored) return
        const res = await fetch(`/api/model/train/status?jobId=${stored}`)
        const json = await res.json()
        if (!cancelled) {
          setStatus(json?.status || "unknown")
          // naive progress mapping
          setProgress(json?.status === "running" ? 50 : json?.status === "completed" ? 100 : json?.status === "queued" ? 10 : 0)
          if (json?.status === "completed" || json?.status === "failed") {
            localStorage.removeItem("trainingJobId")
            setTimeout(() => {
              setJobId(null)
              setStatus(null)
              setProgress(0)
            }, 3000)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setTimeout(pollJob, 3000)
      }
    }
    pollJob()
    return () => {
      cancelled = true
    }
  }, [])

  if (!jobId) return null

  return (
    <Card className="mb-6 p-4 border-green-200">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm text-gray-600">Training Job</div>
          <div className="font-medium">{jobId}</div>
        </div>
        <div className="text-sm text-gray-600">{status || "queued"}</div>
      </div>
      <div className="flex items-center gap-4">
        <Progress value={progress} className="h-2 flex-1" />
        <button
          className="px-3 py-1 text-sm bg-red-600 text-white rounded"
          onClick={async () => {
            try {
              await fetch('/api/model/train/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId }) })
              localStorage.removeItem('trainingJobId')
              setStatus('cancelled')
              setTimeout(() => {
                setJobId(null)
                setStatus(null)
                setProgress(0)
              }, 1500)
            } catch (e) {
              console.error(e)
            }
          }}
        >
          Cancel
        </button>
      </div>
    </Card>
  )
}
