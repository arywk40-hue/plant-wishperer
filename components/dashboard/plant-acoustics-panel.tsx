"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic } from "lucide-react"
import { useState } from "react"

export default function PlantAcousticsPanel() {
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  return (
    <Card className="border-cyan-200 overflow-hidden">
      <div className="bg-cyan-500 text-white px-6 py-4 font-semibold flex items-center gap-2">
        <Mic className="w-5 h-5" />
        Plant Acoustics
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-600 mb-6">Ultrasonic sensors detect stress sounds before visible symptoms</p>
        <div className="border-2 border-dashed border-cyan-300 rounded-lg p-8 text-center bg-cyan-50 mb-4">
          <Mic className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <p className="font-medium text-gray-900 mb-1">Upload Plant Audio</p>
          <p className="text-xs text-gray-600 mb-4">WAV, MP3 (Max 10MB)</p>
          <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" id="audio-input" />
          <label htmlFor="audio-input">
            <Button
              asChild
              variant="outline"
              className="border-cyan-400 text-cyan-600 hover:bg-cyan-100 cursor-pointer bg-transparent"
            >
              <span>Choose File</span>
            </Button>
          </label>
        </div>
        {fileName && <p className="text-sm text-gray-600 text-center">Selected: {fileName}</p>}
      </div>
    </Card>
  )
}
