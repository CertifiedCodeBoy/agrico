class OllamaService {
  constructor() {
    this.baseURL = "http://localhost:11434";
    this.model = "llama3.2"; // You can change this to any model you have installed
  }

  async generateResponse(prompt, context = "") {
    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 500, // Changed from max_tokens to num_predict
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ollama API Error Response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();
      return {
        response: data.response,
        context: data.context,
      };
    } catch (error) {
      console.error("Ollama API Error:", error);
      throw new Error(
        "Failed to connect to Ollama. Make sure Ollama is running locally."
      );
    }
  }

  // Check if Ollama is running and what models are available
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        status: "connected",
        models: data.models || [],
      };
    } catch (error) {
      console.error("Ollama connection check failed:", error);
      return {
        status: "disconnected",
        models: [],
      };
    }
  }

  createCropPrompt(cropType, question, cropInfo) {
    const systemPrompt = `You are an expert agricultural AI assistant specializing in smart irrigation and crop management. You help farmers optimize their water usage and improve crop yields.

IMPORTANT GUIDELINES:
- Stay focused on agriculture, irrigation, crop care, and farming topics
- If asked about non-agricultural topics, politely redirect to farming questions
- Provide practical, actionable advice
- Keep responses concise but informative (max 3-4 sentences)
- Use emojis occasionally to make responses friendly
- Always consider water conservation and sustainable farming practices

CURRENT CROP CONTEXT:
- Crop: ${cropType}
- Watering Frequency: ${cropInfo?.wateringFrequency || "Unknown"}
- Optimal Soil Moisture: ${
      cropInfo?.soilMoistureRange
        ? `${cropInfo.soilMoistureRange[0]}-${cropInfo.soilMoistureRange[1]}%`
        : "Unknown"
    }
- Growth Stage: ${cropInfo?.growthStage || "Unknown"}

FARMER'S QUESTION: ${question}

Provide helpful advice specific to ${cropType} cultivation:`;

    return systemPrompt;
  }

  async getCropAdvice(cropType, question, cropInfo) {
    const prompt = this.createCropPrompt(cropType, question, cropInfo);

    try {
      const result = await this.generateResponse(prompt);
      return result.response;
    } catch (error) {
      console.error("getCropAdvice error:", error);
      return "I'm having trouble connecting to the AI service. Please check that Ollama is running and try again. 🤖";
    }
  }

  async analyzePlantHealth(imageDescription = "plant image") {
    const prompt = `As an agricultural AI expert, analyze this plant health scenario: ${imageDescription}

Provide a brief assessment covering:
- Overall plant health indicators
- Potential issues to watch for
- Recommended actions
- Watering/irrigation advice

Keep the response practical and under 3 sentences with emojis.`;

    try {
      const result = await this.generateResponse(prompt);
      return result.response;
    } catch (error) {
      console.error("analyzePlantHealth error:", error);
      return "Unable to analyze plant health right now. Please ensure Ollama is running. 🌱";
    }
  }

  async getWateringRecommendation(field, weather) {
    const prompt = `As a smart irrigation AI, provide watering advice for this field:

FIELD DATA:
- Field: ${field.name}
- Crop: ${field.cropType}
- Current Soil Moisture: ${field.soilMoisture}%
- Temperature: ${field.temperature}°C
- Area: ${field.area} hectares
- Last Watered: ${field.lastWatered}
- Recommended Water Amount: ${field.recommendedWater}L/m²

WEATHER: ${weather.forecast || "No weather data"}

Provide specific watering recommendation in 2-3 sentences with exact timing and amount. Use water drop emoji 💧 and include conservation tips.`;

    try {
      const result = await this.generateResponse(prompt);
      return result.response;
    } catch (error) {
      console.error("getWateringRecommendation error:", error);
      return `💧 Based on ${field.soilMoisture}% soil moisture, consider watering ${field.name} with ${field.recommendedWater}L/m². Ollama connection needed for AI analysis.`;
    }
  }
}

export const ollamaService = new OllamaService();
