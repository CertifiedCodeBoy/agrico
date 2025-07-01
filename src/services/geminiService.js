// Create src/services/geminiService.js
class GeminiService {
    constructor() {
      this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      this.model = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";
      this.baseURL = "https://generativelanguage.googleapis.com/v1beta/models";
      
      if (!this.apiKey) {
        console.warn("Gemini API key not found. AI features will be limited.");
      }
    }
  
    async generateResponse(prompt, context = "") {
      if (!this.apiKey) {
        throw new Error("Gemini API key not configured");
      }
  
      try {
        const response = await fetch(
          `${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: context ? `${context}\n\n${prompt}` : prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 500,
                responseMimeType: "text/plain",
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                  category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE",
                },
              ],
            }),
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Gemini API Error:", errorData);
          throw new Error(
            `Gemini API error: ${response.status} - ${
              errorData.error?.message || "Unknown error"
            }`
          );
        }
  
        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
          throw new Error("No response generated from Gemini API");
        }
  
        const responseText = data.candidates[0].content.parts[0].text;
        
        return {
          response: responseText,
          context: "", // Gemini doesn't return context like Ollama
        };
      } catch (error) {
        console.error("Gemini API Error:", error);
        
        if (error.message.includes("API key")) {
          throw new Error("Invalid Gemini API key. Please check your configuration.");
        } else if (error.message.includes("quota")) {
          throw new Error("Gemini API quota exceeded. Please try again later.");
        } else if (error.message.includes("network")) {
          throw new Error("Network error connecting to Gemini API. Please check your internet connection.");
        }
        
        throw new Error("Failed to connect to Gemini AI service.");
      }
    }
  
    // Check if Gemini is properly configured
    async checkConnection() {
      if (!this.apiKey) {
        return {
          status: "not-configured",
          models: [],
          message: "Gemini API key not configured",
        };
      }
  
      try {
        // Test with a simple prompt
        await this.generateResponse("Hello, this is a connection test. Please respond with 'OK'.");
        
        return {
          status: "connected",
          models: [this.model],
          message: "Gemini API connected successfully",
        };
      } catch (error) {
        console.error("Gemini connection test failed:", error);
        return {
          status: "disconnected",
          models: [],
          message: error.message,
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
        return "I'm having trouble connecting to the AI service. Please check your Gemini API configuration and try again. 🤖";
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
        return "Unable to analyze plant health right now. Please check your Gemini API configuration. 🌱";
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
        return `💧 Based on ${field.soilMoisture}% soil moisture, consider watering ${field.name} with ${field.recommendedWater}L/m². Gemini AI analysis temporarily unavailable.`;
      }
    }
  }
  
  export const geminiService = new GeminiService();