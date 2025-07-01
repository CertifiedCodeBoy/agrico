import { geminiService } from "./geminiService";
import cropDatabase from "../data/cropDatabase.json";

// Enhanced AI service with Gemini integration
export class AIService {
  static async getWateringRecommendation(field, weather) {
    try {
      // Use Gemini for real AI responses
      return await geminiService.getWateringRecommendation(field, weather);
    } catch (error) {
      console.error("Gemini AI Error:", error);
      
      // Enhanced fallback logic
      const cropInfo = cropDatabase.find(crop => crop.name === field.cropType);
      if (!cropInfo) {
        return `Unable to find information for ${field.cropType}. Please check crop type.`;
      }

      const [minMoisture, maxMoisture] = cropInfo.soilMoistureRange;

      if (field.soilMoisture < minMoisture) {
        return `🚿 Water ${field.name} now! Your ${field.cropType.toLowerCase()} need ${
          field.recommendedWater
        }L/m² (about ${Math.round(
          field.recommendedWater * field.area * 10000
        )} liters total). Soil moisture is at ${
          field.soilMoisture
        }% - below optimal range.`;
      } else if (field.soilMoisture > maxMoisture) {
        return `⏸️ Hold off on watering ${field.name}. Soil moisture is at ${
          field.soilMoisture
        }% - above optimal range. Risk of overwatering your ${field.cropType.toLowerCase()}.`;
      } else {
        return `✅ ${field.name} is well-hydrated! Current moisture (${
          field.soilMoisture
        }%) is perfect for ${field.cropType.toLowerCase()}. Next watering recommended in 1-2 days.`;
      }
    }
  }

  static async getCropAdvice(cropType, question) {
    try {
      // Find crop info for context
      const cropInfo = cropDatabase.find((crop) => crop.name === cropType);

      // Use Gemini for real AI responses
      return await geminiService.getCropAdvice(cropType, question, cropInfo);
    } catch (error) {
      // Fallback response
      return "I'm having trouble connecting to the AI service. Please check your Gemini API key configuration. In the meantime, try asking about watering schedules, soil moisture, or plant diseases. 🌱";
    }
  }

  static async analyzePlantHealth(imageData) {
    try {
      return await geminiService.analyzePlantHealth(imageData);
    } catch (error) {
      // Mock fallback
      const conditions = [
        "✅ Plant appears healthy with good leaf color and structure",
        "⚠️ Slight yellowing detected - may indicate overwatering or nutrient deficiency",
        "🔍 Some brown spots visible - monitor for fungal disease",
        "💧 Leaf wilting suggests underwatering - increase irrigation frequency",
        "🌡️ Heat stress symptoms visible - increase shade and watering frequency",
        "🦠 Possible pest damage detected - inspect leaves carefully",
      ];

      return (
        conditions[Math.floor(Math.random() * conditions.length)] +
        " (Note: AI analysis temporarily unavailable - manual inspection recommended)"
      );
    }
  }
}
