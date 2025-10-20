"use client"

import { Card } from "@/components/ui/card"
import { Droplets } from "lucide-react"
import { useState } from "react"

export default function SoilSensorsPanel() {
  const [sensorData, setSensorData] = useState({
    moisture: 45,
    temperature: 28,
    humidity: 60,
    ph: 6.5,
  })

  const handleSliderChange = (key: string, value: number) => {
    setSensorData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const getOptimalRange = (key: string) => {
    const ranges: Record<string, string> = {
      moisture: "40-70%",
      temperature: "20-32°C",
      humidity: "50-80%",
      ph: "6.0-7.0",
    }
    return ranges[key]
  }

  return (
    <Card className="border-yellow-200 overflow-hidden">
      <div className="bg-yellow-500 text-white px-6 py-4 font-semibold flex items-center gap-2">
        <Droplets className="w-5 h-5" />
        Soil Sensors
      </div>
      <div className="p-6 space-y-6">
        <p className="text-sm text-gray-600">Continuous monitoring of root-level conditions</p>

        {/* Soil Moisture */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium text-gray-900">Soil Moisture</label>
            <span className="text-lg font-bold text-gray-900">{sensorData.moisture}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sensorData.moisture}
            onChange={(e) => handleSliderChange("moisture", Number.parseInt(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Optimal: {getOptimalRange("moisture")}</p>
        </div>

        {/* Temperature */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium text-gray-900">Temperature</label>
            <span className="text-lg font-bold text-gray-900">{sensorData.temperature}°C</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={sensorData.temperature}
            onChange={(e) => handleSliderChange("temperature", Number.parseInt(e.target.value))}
            className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">Optimal: {getOptimalRange("temperature")}</p>
        </div>

        {/* Humidity */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium text-gray-900">Humidity</label>
            <span className="text-lg font-bold text-gray-900">{sensorData.humidity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sensorData.humidity}
            onChange={(e) => handleSliderChange("humidity", Number.parseInt(e.target.value))}
            className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-xs text-gray-500 mt-1">Optimal: {getOptimalRange("humidity")}</p>
        </div>

        {/* pH Level */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium text-gray-900">pH Level</label>
            <span className="text-lg font-bold text-gray-900">{sensorData.ph}</span>
          </div>
          <input
            type="range"
            min="0"
            max="14"
            step="0.1"
            value={sensorData.ph}
            onChange={(e) => handleSliderChange("ph", Number.parseFloat(e.target.value))}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">Optimal: {getOptimalRange("ph")}</p>
        </div>
      </div>
    </Card>
  )
}
