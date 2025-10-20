"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Eye } from "lucide-react"
import { useState } from "react"

export default function DroneImageryPanel() {
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  return (
    <Card className="border-blue-200 overflow-hidden">
      <div className="bg-blue-500 text-white px-6 py-4 font-semibold flex items-center gap-2">
        <Eye className="w-5 h-5" />
        Drone Imagery
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-600 mb-6">Multispectral and thermal imaging for stress pattern detection</p>
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 mb-4">
          <Upload className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <p className="font-medium text-gray-900 mb-1">Upload Drone/Crop Image</p>
          <p className="text-xs text-gray-600 mb-4">JPG, PNG, JPEG (Max 8MB)</p>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="drone-input" />
          <label htmlFor="drone-input">
            <Button
              asChild
              variant="outline"
              className="border-blue-400 text-blue-600 hover:bg-blue-100 cursor-pointer bg-transparent"
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
