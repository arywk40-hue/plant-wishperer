// Centralized configuration for analysis thresholds, weights and assistant settings
export const DEFAULT_WEIGHTS = {
  vision: 0.35,
  audio: 0.25,
  sensor: 0.4,
}

export const HEALTH_STATUS_THRESHOLDS = {
  excellent: 85,
  good: 70,
  fair: 55,
  poor: 40,
}

export const SEVERITY_THRESHOLDS = {
  info: 70,
  warning: 50,
}

export const RISK_LEVEL_THRESHOLDS = {
  low: 80,
  moderate: 60,
  high: 40,
}

export const ANOMALY_LIMITS = {
  moisture: { min: 20, max: 90 },
  temperature: { min: 5, max: 45 },
  ph: { min: 4, max: 9 },
}

export const RECOMMENDATION_TRIGGERS = {
  sensorIrrigation: 50,
  visionDisease: 60,
  sensorTemperature: 55,
  audioPest: 55,
  scoreNutrient: 70,
  maintenanceScore: 75,
}

// Assistant / Gemini config (placeholder - keep keys out of source control)
export const ASSISTANT_CONFIG = {
  provider: "gemini",
  apiKeyEnv: "GEMINI_API_KEY",
  defaultModel: "gpt-4o-mini",
}

// Optionally set a provider URL for server-side API calls. Leave empty to require
// the environment to provide ASSISTANT_API_URL (recommended for production).
export const ASSISTANT_API_URL = ""

export const DEFAULT_DATASET_PATH = "/data/dataset.csv"
