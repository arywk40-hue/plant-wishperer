"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Leaf, MessageCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { DEFAULT_DATASET_PATH } from "@/config/analysis-config"

export default function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null)
  const [trainingStatus, setTrainingStatus] = useState<string | null>(null)

  // Poll training status when a job is present
  useEffect(() => {
    if (!trainingJobId) return
    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch(`/api/model/train/status?jobId=${trainingJobId}`)
        const data = await res.json()
        if (!cancelled) setTrainingStatus(data?.status || "unknown")
        if (data?.status && data.status !== "running") {
          setTimeout(() => setTrainingJobId(null), 3000)
        }
      } catch (e) {
        console.error(e)
      }
      if (!cancelled) setTimeout(poll, 3000)
    }
    poll()
    return () => {
      cancelled = true
    }
  }, [trainingJobId])

  const triggerTraining = async () => {
    try {
      setIsTraining(true)
      const res = await fetch('/api/model/train', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ datasetPath: DEFAULT_DATASET_PATH, epochs: 3 }) })
      const data = await res.json()
      if (data?.jobId) {
        setTrainingJobId(data.jobId)
        setTrainingStatus('queued')
        try {
          localStorage.setItem('trainingJobId', data.jobId)
        } catch (e) {
          // ignore
        }
      } else {
        alert('Training enqueue failed')
      }
    } catch (err) {
      console.error(err)
      alert('Error queuing training job')
    } finally {
      setIsTraining(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="w-8 h-8 text-green-600" />
          <span className="text-2xl font-bold text-green-700">PlantWhisperer Pro++</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-green-600 font-medium hover:text-green-700 transition">
            Dashboard
          </Link>
          <Link href="/dashboard/reports" className="text-gray-600 hover:text-green-600 transition">
            Reports
          </Link>
          <Link href="/dashboard/data-view" className="text-gray-600 hover:text-green-600 transition">
            Data View
          </Link>
          <Link href="/dashboard/settings" className="text-gray-600 hover:text-green-600 transition">
            Settings
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings">
            <Button
              variant="outline"
              className="hidden sm:inline-flex border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
            >
              Export Data
            </Button>
          </Link>
          <Button onClick={triggerTraining} className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2">
            {isTraining ? 'Enqueuing...' : 'Train Model'}
          </Button>
          <Link href="/dashboard/assistant">
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              AI Assistant
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
