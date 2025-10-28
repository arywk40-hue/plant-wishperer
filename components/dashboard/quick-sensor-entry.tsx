"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Props {
  onResult?: (category: string, result: any) => void
  onUpload?: (category: string, count: number) => void
}

export default function QuickSensorEntry({ onResult, onUpload }: Props) {
  const [temperature, setTemperature] = useState<string>("")
  const [humidity, setHumidity] = useState<string>("")
  const [ph, setPh] = useState<string>("")
  const [moisture, setMoisture] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        moisture: Number(moisture || 0),
        temperature: Number(temperature || 0),
        humidity: Number(humidity || 0),
        ph: Number(ph || 0),
        timestamp: new Date().toISOString(),
      }

      // send as a small JSON file in multipart form to reuse server logic
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      const form = new FormData()
      form.append('file', blob, 'quick-sensor.json')
      form.append('category', 'sensors')

      const res = await fetch('/api/model/predict', { method: 'POST', body: form })
      const data = await res.json()
      if (data && data.ok) {
        onUpload && onUpload('sensors', 1)
        onResult && onResult('sensors', data)
      } else {
        console.error('Predict failed', data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      // keep the values so user can tweak
    }
  }

  const handleDownloadCSV = () => {
    const headers = ['timestamp', 'moisture', 'temperature', 'humidity', 'ph']
    const row = [new Date().toISOString(), moisture || '', temperature || '', humidity || '', ph || '']
    const csv = `${headers.join(',')}\n${row.join(',')}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sensor-template.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-4 border-yellow-200">
      <h4 className="font-semibold text-gray-900 mb-2">Quick Sensor Entry</h4>
      <div className="grid grid-cols-2 gap-2">
        <input className="p-2 border rounded" placeholder="Temperature (°C)" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
        <input className="p-2 border rounded" placeholder="Humidity (%)" value={humidity} onChange={(e) => setHumidity(e.target.value)} />
        <input className="p-2 border rounded" placeholder="Soil Moisture (%)" value={moisture} onChange={(e) => setMoisture(e.target.value)} />
        <input className="p-2 border rounded" placeholder="pH" value={ph} onChange={(e) => setPh(e.target.value)} />
      </div>
      <div className="flex gap-2 mt-3">
        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Sending...' : 'Send Quick Entry'}
        </Button>
        <Button variant="outline" onClick={() => { setTemperature(''); setHumidity(''); setPh(''); setMoisture('') }}>
          Clear
        </Button>
        <Button variant="outline" onClick={handleDownloadCSV}>
          Download CSV
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">You can also convert a CSV with these fields and upload via the Sensor Data panel.</p>
    </Card>
  )
}
