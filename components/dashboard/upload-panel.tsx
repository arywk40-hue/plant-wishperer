"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, CheckCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface UploadPanelProps {
  title: string
  description: string
  icon: LucideIcon
  color: string
  fileType: string
  category: string
  onUpload: (category: string, count: number) => void
  uploadedCount: number
}

export default function UploadPanel({
  title,
  description,
  icon: Icon,
  color,
  fileType,
  category,
  onUpload,
  uploadedCount,
}: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      simulateUpload(files.length)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      simulateUpload(files.length)
    }
  }

  const simulateUpload = async (fileCount: number) => {
    setIsUploading(true)
    // Upload files to model predict endpoint
    try {
      const input = fileInputRef.current
      const form = new FormData()
      if (input && input.files) {
        Array.from(input.files).forEach((f) => form.append("file", f))
      } else {
        // nothing selected, create placeholders
        form.append("file", new Blob([""], { type: "text/plain" }), "placeholder.txt")
      }

      const res = await fetch("/api/model/predict", { method: "POST", body: form })
      const data = await res.json()
      if (data && data.ok) {
        // call onUpload with file count and update possible UI
        onUpload(category, fileCount)
      } else {
        console.error("Predict failed", data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <Card
      className={`p-8 border-2 transition-all cursor-pointer ${
        isDragging ? "border-green-500 bg-green-50" : "border-green-200 hover:border-green-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input ref={fileInputRef} type="file" multiple accept={fileType} onChange={handleFileSelect} className="hidden" />

      <div className="text-center">
        <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center mx-auto mb-4`}>
          {isUploading ? (
            <div className="animate-spin">
              <Upload className="w-8 h-8" />
            </div>
          ) : uploadedCount > 0 ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <Icon className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        {uploadedCount > 0 && (
          <p className="text-sm font-medium text-green-600 mb-4">{uploadedCount} file(s) uploaded</p>
        )}

        <Button className="bg-green-600 hover:bg-green-700 text-white w-full" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Select Files or Drag & Drop"}
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          {fileType === "image/*" ? "PNG, JPG, GIF up to 50MB" : "CSV, JSON files up to 100MB"}
        </p>
      </div>
    </Card>
  )
}
