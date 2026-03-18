export interface SavedReportEntry {
  id: number | string
  createdAt?: string
  payload?: Record<string, any>
}

export interface NormalizedReport {
  id: number | string
  title: string
  createdAt: string
  type: string
  status: string
  score: number
  vision: number
  audio: number
  sensor: number
  field: string
  diseaseDetectionData: Array<{ name: string; count: number; severity: string }>
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

function coerceNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeDate(dateLike?: string) {
  const parsed = dateLike ? new Date(dateLike) : new Date()
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function severityRank(severity: string) {
  if (severity === "High") return 3
  if (severity === "Medium") return 2
  return 1
}

export function getHealthStatusLabel(score: number) {
  if (score >= 80) return "Healthy"
  if (score >= 60) return "Monitor"
  return "Alert"
}

export function getSeverityLabel(score: number) {
  if (score >= 80) return "Low"
  if (score >= 60) return "Medium"
  return "High"
}

function deriveFallbackDetections(report: Omit<NormalizedReport, "diseaseDetectionData">) {
  const detections: Array<{ name: string; count: number; severity: string }> = []

  if (report.vision < 60) {
    detections.push({ name: "Visual Stress", count: 1, severity: getSeverityLabel(report.vision) })
  }
  if (report.audio < 60) {
    detections.push({ name: "Acoustic Stress", count: 1, severity: getSeverityLabel(report.audio) })
  }
  if (report.sensor < 60) {
    detections.push({ name: "Environmental Stress", count: 1, severity: getSeverityLabel(report.sensor) })
  }

  if (detections.length === 0) {
    detections.push({ name: "Healthy Signals", count: 1, severity: "Low" })
  }

  return detections
}

export function normalizeSavedReports(entries: SavedReportEntry[]) {
  return entries
    .map((entry) => {
      const payload = entry.payload || {}
      const healthTrendData = Array.isArray(payload.healthTrendData) ? payload.healthTrendData : []
      const latestTrend = healthTrendData.length > 0 ? healthTrendData[healthTrendData.length - 1] : null
      const savedReports = Array.isArray(payload.reports) ? payload.reports : []
      const seededReport = savedReports.length > 0 ? savedReports[0] : null
      const createdAt = normalizeDate(payload.date || entry.createdAt).toISOString()
      const score = coerceNumber(
        payload.score,
        coerceNumber(payload.scores?.overall, coerceNumber(latestTrend?.score, coerceNumber(seededReport?.score, 0))),
      )
      const vision = coerceNumber(
        payload.riskData?.vision,
        coerceNumber(payload.scores?.vision, coerceNumber(latestTrend?.vision, score)),
      )
      const audio = coerceNumber(
        payload.riskData?.audio,
        coerceNumber(payload.scores?.audio, coerceNumber(latestTrend?.audio, score)),
      )
      const sensor = coerceNumber(
        payload.riskData?.sensor,
        coerceNumber(payload.scores?.sensor, coerceNumber(latestTrend?.sensor, score)),
      )
      const baseReport = {
        id: entry.id,
        title: payload.title || seededReport?.title || "Analysis Report",
        createdAt,
        type: payload.type || seededReport?.type || "Analysis",
        status: payload.status || seededReport?.status || getHealthStatusLabel(score),
        score,
        vision,
        audio,
        sensor,
        field: payload.fieldId || payload.field || "Primary Field",
      }
      const diseaseDetectionData = Array.isArray(payload.diseaseDetectionData) && payload.diseaseDetectionData.length > 0
        ? payload.diseaseDetectionData.map((item: any) => ({
            name: item?.name || "Unlabeled Finding",
            count: Math.max(1, coerceNumber(item?.count, 1)),
            severity: item?.severity || "Medium",
          }))
        : deriveFallbackDetections(baseReport)

      return {
        ...baseReport,
        diseaseDetectionData,
      } satisfies NormalizedReport
    })
    .sort((a, b) => normalizeDate(b.createdAt).getTime() - normalizeDate(a.createdAt).getTime())
}

export function filterReportsByPeriod(reports: NormalizedReport[], period: string) {
  const now = Date.now()
  const cutoffByPeriod: Record<string, number> = {
    "7d": now - 7 * DAY_IN_MS,
    "30d": now - 30 * DAY_IN_MS,
    "90d": now - 90 * DAY_IN_MS,
    "1y": now - 365 * DAY_IN_MS,
  }

  const cutoff = cutoffByPeriod[period]
  if (!cutoff) return reports
  return reports.filter((report) => normalizeDate(report.createdAt).getTime() >= cutoff)
}

export function buildHealthTrendData(reports: NormalizedReport[]) {
  return [...reports]
    .sort((a, b) => normalizeDate(a.createdAt).getTime() - normalizeDate(b.createdAt).getTime())
    .map((report) => ({
      date: normalizeDate(report.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      score: report.score,
      vision: report.vision,
      audio: report.audio,
      sensor: report.sensor,
    }))
}

export function buildDiseaseDetectionData(reports: NormalizedReport[]) {
  const aggregate = new Map<string, { name: string; count: number; severity: string }>()

  reports.forEach((report) => {
    report.diseaseDetectionData.forEach((item) => {
      const current = aggregate.get(item.name)
      if (!current) {
        aggregate.set(item.name, { ...item })
        return
      }

      current.count += item.count
      if (severityRank(item.severity) > severityRank(current.severity)) {
        current.severity = item.severity
      }
    })
  })

  return Array.from(aggregate.values()).sort((a, b) => b.count - a.count)
}

export function buildDataViewRows(reports: NormalizedReport[]) {
  return reports.map((report) => ({
    id: report.id,
    date: normalizeDate(report.createdAt).toISOString().slice(0, 10),
    field: report.field,
    healthScore: report.score,
    visionRisk: report.vision,
    audioRisk: report.audio,
    sensorRisk: report.sensor,
    status: report.status,
  }))
}

export function buildRiskDistribution(reports: NormalizedReport[]) {
  const counts = {
    "Low Risk": 0,
    "Medium Risk": 0,
    "High Risk": 0,
  }

  reports.forEach((report) => {
    if (report.score >= 80) counts["Low Risk"] += 1
    else if (report.score >= 60) counts["Medium Risk"] += 1
    else counts["High Risk"] += 1
  })

  const total = reports.length || 1

  return [
    { name: "Low Risk", value: Math.round((counts["Low Risk"] / total) * 100), color: "#16a34a" },
    { name: "Medium Risk", value: Math.round((counts["Medium Risk"] / total) * 100), color: "#eab308" },
    { name: "High Risk", value: Math.round((counts["High Risk"] / total) * 100), color: "#dc2626" },
  ]
}
