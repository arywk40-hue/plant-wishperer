"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Droplets, Thermometer, Wind, Zap } from "lucide-react"

interface SensorReading {
  time: string
  moisture: number
  temperature: number
  humidity: number
  ph: number
}

export default function RealTimeSensorMonitor() {
  const [sensorData, setSensorData] = useState<SensorReading[]>([])
  const [currentReadings, setCurrentReadings] = useState({
    moisture: 45,
    temperature: 28,
    humidity: 60,
    ph: 6.5,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

      // Generate realistic sensor variations
      const newMoisture = Math.max(30, Math.min(80, currentReadings.moisture + (Math.random() - 0.5) * 3))
      const newTemp = Math.max(15, Math.min(40, currentReadings.temperature + (Math.random() - 0.5) * 1.5))
      const newHumidity = Math.max(40, Math.min(90, currentReadings.humidity + (Math.random() - 0.5) * 2))
      const newPh = Math.max(5.5, Math.min(7.5, currentReadings.ph + (Math.random() - 0.5) * 0.2))

      setCurrentReadings({
        moisture: Math.round(newMoisture * 10) / 10,
        temperature: Math.round(newTemp * 10) / 10,
        humidity: Math.round(newHumidity * 10) / 10,
        ph: Math.round(newPh * 10) / 10,
      })

      setSensorData((prev) => [
        ...prev.slice(-19),
        {
          time: timeString,
          moisture: Math.round(newMoisture * 10) / 10,
          temperature: Math.round(newTemp * 10) / 10,
          humidity: Math.round(newHumidity * 10) / 10,
          ph: Math.round(newPh * 10) / 10,
        },
      ])
    }, 3000)

    return () => clearInterval(interval)
  }, [currentReadings])

  const getStatusColor = (value: number, min: number, max: number) => {
    if (value < min || value > max) return "text-red-600"
    if (Math.abs(value - (min + max) / 2) < (max - min) * 0.2) return "text-green-600"
    return "text-yellow-600"
  }

  return (
    <div className="space-y-6">
      {/* Current Readings Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Soil Moisture */}
        <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Soil Moisture</h3>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Live</span>
          </div>
          <div className="mb-2">
            <p className={`text-3xl font-bold ${getStatusColor(currentReadings.moisture, 40, 70)}`}>
              {currentReadings.moisture}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentReadings.moisture}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Optimal: 40-70%</p>
        </Card>

        {/* Temperature */}
        <Card className="p-6 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Temperature</h3>
            </div>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Live</span>
          </div>
          <div className="mb-2">
            <p className={`text-3xl font-bold ${getStatusColor(currentReadings.temperature, 20, 32)}`}>
              {currentReadings.temperature}°C
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (currentReadings.temperature / 40) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Optimal: 20-32°C</p>
        </Card>

        {/* Humidity */}
        <Card className="p-6 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold text-gray-900">Humidity</h3>
            </div>
            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">Live</span>
          </div>
          <div className="mb-2">
            <p className={`text-3xl font-bold ${getStatusColor(currentReadings.humidity, 50, 80)}`}>
              {currentReadings.humidity}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentReadings.humidity}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Optimal: 50-80%</p>
        </Card>

        {/* pH Level */}
        <Card className="p-6 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">pH Level</h3>
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Live</span>
          </div>
          <div className="mb-2">
            <p className={`text-3xl font-bold ${getStatusColor(currentReadings.ph, 6.0, 7.0)}`}>{currentReadings.ph}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (currentReadings.ph / 8) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Optimal: 6.0-7.0</p>
        </Card>
      </div>

      {/* Moisture Trend Chart */}
      {sensorData.length > 0 && (
        <Card className="p-6 border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Soil Moisture Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sensorData}>
              <defs>
                <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="moisture" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMoisture)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Temperature & Humidity Trend Chart */}
      {sensorData.length > 0 && (
        <Card className="p-6 border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature & Humidity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                dot={false}
                strokeWidth={2}
                name="Temperature (°C)"
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#06b6d4"
                dot={false}
                strokeWidth={2}
                name="Humidity (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}
