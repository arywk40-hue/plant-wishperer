import { GoogleGenAI, GenerateContentParameters } from "@google/genai";
import { ASSISTANT_CONFIG } from "@/config/analysis-config";

// --------------------------------------------------------------------------
// 1. KNOWLEDGE BASE INTERFACES AND DATA
// --------------------------------------------------------------------------

interface DiseaseInfo {
  symptoms: string;
  causes: string;
  treatment: string;
  prevention: string;
}

interface NutrientInfo {
  symptoms: string;
  treatment: string;
  sources: string;
}

interface PestInfo {
  symptoms: string;
  treatment: string;
  prevention: string;
}

interface PlantKnowledgeBase {
  diseases: Record<string, DiseaseInfo>;
  nutrients: Record<string, NutrientInfo>;
  pests: Record<string, PestInfo>;
  general: Record<string, string>;
}

const PLANT_KNOWLEDGE_BASE: PlantKnowledgeBase = {
  diseases: {
    "leaf rust": {
      symptoms: "Orange-brown pustules on leaves, yellowing foliage",
      causes: "Fungal infection, humid conditions",
      treatment: "Apply fungicide, improve air circulation, remove infected leaves",
      prevention: "Use resistant varieties, proper spacing, avoid overhead watering"
    },
    "powdery mildew": {
      symptoms: "White powdery spots on leaves and stems",
      causes: "Poor air circulation, high humidity",
      treatment: "Apply sulfur-based fungicide, neem oil",
      prevention: "Proper spacing, morning watering, resistant varieties"
    },
    "blight": {
      symptoms: "Dark spots on leaves, rapid wilting",
      causes: "Bacterial/fungal infection, wet conditions",
      treatment: "Copper-based fungicides, remove infected plants",
      prevention: "Crop rotation, proper drainage, sanitize tools"
    }
  },
  nutrients: {
    "nitrogen deficiency": {
      symptoms: "Yellowing of older leaves, stunted growth",
      treatment: "Apply nitrogen-rich fertilizer, compost",
      sources: "Fish emulsion, blood meal, composted manure"
    },
    "phosphorus deficiency": {
      symptoms: "Purple tint on leaves, poor root development",
      treatment: "Bone meal, rock phosphate, phosphorus fertilizer",
      sources: "Bone meal, fish bone, compost"
    },
    "potassium deficiency": {
      symptoms: "Brown leaf edges, weak stems",
      treatment: "Potassium sulfate, wood ash, kelp meal",
      sources: "Potash, banana peels, greensand"
    }
  },
  pests: {
    "aphids": {
      symptoms: "Curled leaves, sticky residue, sooty mold",
      treatment: "Neem oil, insecticidal soap, ladybugs",
      prevention: "Companion planting, reflective mulch, healthy soil"
    },
    "spider mites": {
      symptoms: "Fine webbing, yellow stippling on leaves",
      treatment: "Water spray, miticides, predatory mites",
      prevention: "Maintain humidity, avoid dust buildup"
    }
  },
  general: {
    "soil moisture": "Optimal soil moisture is when soil feels moist but not waterlogged. For most crops, maintain 25-35% moisture content.",
    "crop rotation": "Rotate crops every season to prevent soil depletion and reduce disease buildup. Follow heavy feeders with light feeders.",
    "companion planting": "Plant basil near tomatoes to repel pests. Marigolds deter nematodes. Beans fix nitrogen for neighboring plants."
  }
};

// --------------------------------------------------------------------------
// 2. RESPONSE INTERFACES AND LOCAL HANDLER
// --------------------------------------------------------------------------

export interface AssistantResponse {
  text: string; // Guaranteed to be a string
  source?: string;
  error?: string;
}

export interface AssistantRequest {
  prompt: string;
  model?: string;
}

function generateSmartResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Disease detection
  for (const [disease, info] of Object.entries(PLANT_KNOWLEDGE_BASE.diseases)) {
    if (lowerPrompt.includes(disease)) {
      return `**${disease.toUpperCase()}**\n\nSymptoms: ${info.symptoms}\nCauses: ${info.causes}\nTreatment: ${info.treatment}\nPrevention: ${info.prevention}`;
    }
  }

  // Nutrient issues
  for (const [deficiency, info] of Object.entries(PLANT_KNOWLEDGE_BASE.nutrients)) {
    if (lowerPrompt.includes(deficiency.split(' ')[0])) {
      return `**${deficiency.toUpperCase()}**\n\nSymptoms: ${info.symptoms}\nTreatment: ${info.treatment}\nSources: ${info.sources}`;
    }
  }

  // Pest problems
  for (const [pest, info] of Object.entries(PLANT_KNOWLEDGE_BASE.pests)) {
    if (lowerPrompt.includes(pest)) {
      return `**${pest.toUpperCase()}**\n\nSymptoms: ${info.symptoms}\nTreatment: ${info.treatment}\nPrevention: ${info.prevention}`;
    }
  }
  
  // Specific questions
  if (lowerPrompt.includes('optimal soil moisture')) {
    return PLANT_KNOWLEDGE_BASE.general["soil moisture"];
  }

  if (lowerPrompt.includes('train') || lowerPrompt.includes('model') || lowerPrompt.includes('data')) {
    return "To train models with your data in PlantWhisperer Pro:\n\n1. **Upload Data**: Go to Models → Upload in your dashboard\n2. **Data Types**: We accept drone images, sensor data, and acoustic recordings\n3. **Labeling**: Tag images with conditions (healthy, diseased, stressed)\n4. **Training**: Our system automatically trains on your labeled data\n5. **Monitoring**: Track model accuracy and retrain as needed\n\nWould you like specific guidance on any of these steps?";
  }

  if (lowerPrompt.includes('sensor') || lowerPrompt.includes('reading') || lowerPrompt.includes('moisture')) {
    return "**Sensor Reading Interpretation**:\n\n- **Soil Moisture**: Ideal 25-35% (varies by crop)\n- **pH Level**: 6.0-7.0 for most crops\n- **Nutrient Sensors**: N-P-K levels should match crop requirements\n- **Temperature**: Optimal range depends on crop type\n- **Acoustic Sensors**: Detect stress sounds before visible symptoms\n\nUpload your sensor data to the dashboard for automated analysis and recommendations.";
  }

  // Default response for other queries
  return `As your PlantWhisperer AI, I can help you with:

🌱 **Crop Disease Identification** - Describe symptoms or upload images
💧 **Water & Nutrient Management** - Optimal levels for your crops
🐛 **Pest Control** - Identification and organic treatments  
📊 **Sensor Data Interpretation** - Understanding your field readings
🤖 **Model Training** - How to train AI with your farm data
📈 **Best Practices** - Proven farming techniques

What specific challenge are you facing with your crops today?`;
}


// --------------------------------------------------------------------------
// 3. GEMINI API INTEGRATION LOGIC
// --------------------------------------------------------------------------

// Initialize the GoogleGenAI client (reads GEMINI_API_KEY from process.env)
const ai = new GoogleGenAI({});

export async function callAssistant(req: AssistantRequest): Promise<AssistantResponse> {
  
  // Check if API key is configured for external use
  const configuredApiKey =
    process.env[ASSISTANT_CONFIG.apiKeyEnv] ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;
  const isGeminiConfigured = !!configuredApiKey;

  if (!isGeminiConfigured) {
    console.log('Using local PlantWhisperer assistant (GEMINI_API_KEY not configured)');
    return { 
      text: generateSmartResponse(req.prompt),
      source: 'local_knowledge_base'
    };
  }

  // Use the external Gemini API
  try {
    const model = req.model || ASSISTANT_CONFIG.defaultModel;
    
    // Define the System Instruction (context for the model)
    const systemInstruction = `You are PlantWhisperer Pro, an AI agricultural assistant. Provide helpful, accurate advice about crop health, disease identification, farming best practices, and sensor data interpretation. The context of this application is early problem detection using drone imagery, soil sensors, and plant acoustics. Focus on practical, actionable advice.`;

    // Configure the request content
    const requestConfig: GenerateContentParameters = {
        model: model, 
        contents: [
            { role: "user", parts: [{ text: req.prompt }] }
        ],
        config: {
            systemInstruction: systemInstruction,
        }
    };
    
    // ✅ FIX: Use ai.models.generateContent(requestConfig)
    // This is the correct, stable pattern that resolves the TypeScript error.
    const response = await ai.models.generateContent(requestConfig);

    // ✅ FIX: Use nullish coalescing (??) to ensure the text is a string
    const responseText = response.text ?? "The model completed the request but returned an empty text response.";
    
    // Return path 2: Successful external API call (guaranteed string)
    return { 
      text: responseText,
      source: `gemini_api_${model}`
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('External Gemini API failed, falling back to local:', errorMessage);
    
    // Return path 3: API failure/fallback (always returns a string)
    return { 
      text: generateSmartResponse(req.prompt), // This function is guaranteed to return a string
      source: 'local_fallback',
      error: errorMessage
    };
  }
}
