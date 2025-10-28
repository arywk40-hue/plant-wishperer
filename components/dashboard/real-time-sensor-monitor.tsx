"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { Droplets, Thermometer, Wind, Zap, Info } from "lucide-react"
import Tooltip from "@/components/ui/tooltip"

interface SensorReading {
  time: string
  moisture: number
  temperature: number
  humidity: number
  ph: number
}

interface SensorProps {
  currentReadings?: {
    moisture: number
    temperature: number
    humidity: number
    ph: number
  }
  sensorData?: SensorReading[]
}

export default function RealTimeSensorMonitor({ currentReadings: propReadings, sensorData: propSensorData }: SensorProps) {
  // No fallback placeholders: if no props supplied, show awaiting state
  const sensorData = propSensorData || []
  const currentReadings = propReadings || null

  const getStatusColor = (value: number, min: number, max: number) => {
    if (value < min || value > max) return "text-red-600"
    if (Math.abs(value - (min + max) / 2) < (max - min) * 0.2) return "text-green-600"
    return "text-yellow-600"
  }

  return (
    <div className="space-y-6">
      {!currentReadings && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 text-sm border border-yellow-200">
            Awaiting data
          </span>
        </div>
      )}
      {/* Current Readings Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Soil Moisture */}
        <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Soil Moisture
                <Tooltip
                  content={<>
                    CSV should contain headers: timestamp, soil_moisture, temperature, humidity, ph. Use numeric values and ISO timestamps.
                  </>}
                >
                  <Info className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </h3>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Live</span>
          </div>
          <div className="mb-2">
            {currentReadings ? (
              <p className={`text-3xl font-bold ${getStatusColor(currentReadings?.moisture ?? 0, 40, 70)}`}>
                {currentReadings.moisture}%
              </p>
            ) : (
              <p className="text-3xl font-bold text-gray-400">—</p>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentReadings ? currentReadings.moisture : 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Optimal: 40-70%</p>
        </Card>

        {/* Temperature */}
        <Card className="p-6 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">Temperature</h3>
            </div>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Live</span>
          </div>
          <div className="mb-2">
            {currentReadings ? (
              <p className={`text-3xl font-bold ${getStatusColor(currentReadings?.temperature ?? 0, 20, 32)}`}>
                {currentReadings.temperature}°C
              </p>
            ) : (
              <p className="text-3xl font-bold text-gray-400">—</p>
            )}
          </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentReadings ? Math.min(100, (currentReadings.temperature / 40) * 100) : 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Optimal: 20-32°C</p>
        </Card>

        {/* Humidity */}
        <Card className="p-6 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">Humidity</h3>
            </div>
            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">Live</span>
          </div>
          <div className="mb-2">
            {currentReadings ? (
              <p className={`text-3xl font-bold ${getStatusColor(currentReadings?.humidity ?? 0, 50, 80)}`}>
                {currentReadings.humidity}%
              </p>
            ) : (
              <p className="text-3xl font-bold text-gray-400">—</p>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentReadings ? currentReadings.humidity : 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Optimal: 50-80%</p>
        </Card>

        {/* pH Level */}
        <Card className="p-6 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">pH Level</h3>
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Live</span>
          </div>
          <div className="mb-2">
            {currentReadings ? (
              <p className={`text-3xl font-bold ${getStatusColor(currentReadings?.ph ?? 0, 6.0, 7.0)}`}>{currentReadings.ph}</p>
            ) : (
              <p className="text-3xl font-bold text-gray-400">—</p>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentReadings ? Math.min(100, (currentReadings.ph / 8) * 100) : 0}%` }}
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
              <RechartsTooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
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
              <RechartsTooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
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
