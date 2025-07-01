import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  MapPin,
  Droplets,
  Thermometer,
  Calendar,
  Leaf,
  FlaskConical,
  Brain,
  CheckCircle,
  MessageCircle,
  Send,
} from "lucide-react";

const cropTypes = [
  "Tomatoes",
  "Wheat",
  "Potatoes",
  "Corn",
  "Rice",
  "Soybeans",
  "Lettuce",
  "Carrots",
  "Onions",
  "Peppers",
];

export default function AddFieldModal({
  isOpen,
  onClose,
  onAddField,
  existingFieldsCount = 0,
}) {
  const [formData, setFormData] = useState({
    name: "",
    cropType: "Tomatoes",
    area: "",
    pumpStatus: "off",
  });

  // Soil analysis data for first field
  const [soilAnalysis, setSoilAnalysis] = useState({
    potassium: "",
    phosphorus: "",
    nitrogen: "",
    pH: "",
    organicMatter: "",
    soilTexture: "loam",
  });

  const [currentStep, setCurrentStep] = useState(1); // 1: Soil Analysis, 2: AI Recommendations, 3: Field Details
  const [errors, setErrors] = useState({});
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiFieldAnalysis, setAiFieldAnalysis] = useState({
    health: "good",
    recommendedWater: 2.5,
    explanation: "",
  });
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");

  // Chat system states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isCustomCrop, setIsCustomCrop] = useState(false);
  const [customCropInput, setCustomCropInput] = useState("");

  const isFirstField = existingFieldsCount === 0;

  const soilTextureOptions = [
    "clay",
    "sandy clay",
    "silty clay",
    "clay loam",
    "sandy clay loam",
    "silty clay loam",
    "loam",
    "sandy loam",
    "silt loam",
    "loamy sand",
    "sand",
    "silt",
  ];

  // Get AI crop recommendations from Ollama
  const getAICropRecommendations = async (soilData) => {
    setIsLoadingAI(true);
    setAiError("");

    try {
      const prompt = `Based on the following soil analysis data, recommend suitable crops and provide analysis:

Soil Analysis:
- Potassium level: ${soilData.potassium} ppm  
- Phosphorus level: ${soilData.phosphorus} ppm
- Nitrogen level: ${soilData.nitrogen} ppm
- pH level: ${soilData.pH}
- Organic matter content: ${soilData.organicMatter}%
- Soil texture: ${soilData.soilTexture}

Please provide your response in this EXACT JSON format (take only format, data is just as an example) (you decide which crops, what water recommendation, and field health based on the analysis):
{
  "crops": ["crop 1", "crop 2", "crop 3", "crop 4"],
  "explanation": "Based on your soil analysis, these crops are recommended because...",
  "fieldHealth": "...",
  "recommendedWater": integer value (eg, 2.8),
  "waterExplanation": "The recommended water amount is based on soil texture and nutrient levels..."
}

Consider:
1. pH compatibility with crops
2. Nutrient requirements vs soil levels  
3. Soil texture drainage needs
4. Provide 8-12 crop recommendations
5. Field health should be: excellent, good, fair, or poor
6. Water recommendation in L/m² (typically 1.5-4.0)`;

      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2",
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to Ollama AI");
      }

      const data = await response.json();

      // Parse the AI response to extract the JSON
      let aiAnalysis = {};
      try {
        // Try to extract JSON from the response
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }

        // Validate the response structure
        if (!aiAnalysis.crops || !Array.isArray(aiAnalysis.crops)) {
          throw new Error("Invalid crops data");
        }

        setAiRecommendations(aiAnalysis.crops || []);
        setAiExplanation(aiAnalysis.explanation || "AI analysis completed.");
        setAiFieldAnalysis({
          health: aiAnalysis.fieldHealth || "good",
          recommendedWater: aiAnalysis.recommendedWater || 2.5,
          explanation:
            aiAnalysis.waterExplanation ||
            "Standard irrigation recommendation.",
        });

        setCurrentStep(2);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);

        // Fallback parsing
        const lines = data.response.split("\n").filter((line) => line.trim());
        const crops = lines
          .filter(
            (line) =>
              line.includes("Tomatoes") ||
              line.includes("Wheat") ||
              line.includes("Corn")
          )
          .map((line) => line.replace(/[^\w\s]/g, "").trim())
          .filter((crop) => crop.length > 0)
          .slice(0, 8);

        setAiRecommendations(
          crops.length > 0 ? crops : ["Tomatoes", "Lettuce", "Carrots", "Wheat"]
        );
        setAiExplanation(
          "These crops are suitable for your soil conditions based on pH and nutrient levels."
        );
        setAiFieldAnalysis({
          health: "good",
          recommendedWater: 2.5,
          explanation:
            "Standard irrigation recommendation based on soil analysis.",
        });
        setCurrentStep(2);
      }
    } catch (error) {
      console.error("AI recommendation error:", error);
      setAiError(error.message);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Chat with AI about specific crops
  const askAIAboutCrop = async (question) => {
    setIsChatLoading(true);

    try {
      const prompt = `Based on the following soil analysis data, answer the farmer's question about crop suitability:

Soil Analysis:
- Potassium level: ${soilAnalysis.potassium} ppm  
- Phosphorus level: ${soilAnalysis.phosphorus} ppm
- Nitrogen level: ${soilAnalysis.nitrogen} ppm
- pH level: ${soilAnalysis.pH}
- Organic matter content: ${soilAnalysis.organicMatter}%
- Soil texture: ${soilAnalysis.soilTexture}

Farmer's Question: ${question}

Please provide a detailed answer explaining:
1. Whether the crop can be grown in these soil conditions
2. Why it's suitable or not suitable
3. Any specific recommendations or modifications needed
4. Expected yield potential (high/medium/low)

Keep the response conversational and practical for a farmer.`;

      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2",
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Chat AI error:", error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again.";
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      message: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const originalInput = chatInput.trim();
    setChatInput("");

    const aiResponse = await askAIAboutCrop(originalInput);

    // Extract potential crop name from user question
    const extractCropFromQuestion = (question) => {
      const lowerQuestion = question.toLowerCase();

      // Common patterns for asking about crops
      const patterns = [
        /can i grow (.+?)[\s\?]/,
        /what about (.+?)[\s\?]/,
        /is (.+?) suitable/,
        /(.+?) trees?/,
        /(.+?) plants?/,
        /(.+?) crops?/,
        /growing (.+?)[\s\?]/,
        /plant (.+?)[\s\?]/,
      ];

      for (const pattern of patterns) {
        const match = lowerQuestion.match(pattern);
        if (match && match[1]) {
          let crop = match[1].trim();
          // Clean up common words
          crop = crop
            .replace(/\b(trees?|plants?|crops?|the|a|an)\b/g, "")
            .trim();
          // Capitalize first letter of each word
          return crop
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
      }
      return null;
    };

    // Check if AI response is positive/approving
    const isPositiveResponse = (response) => {
      const lowerResponse = response.toLowerCase();
      const positiveIndicators = [
        "yes",
        "suitable",
        "can be grown",
        "recommended",
        "good choice",
        "excellent",
        "favorable",
        "appropriate",
        "feasible",
        "possible",
        "can grow",
        "would work",
        "compatible",
        "viable",
        "promising",
      ];

      const negativeIndicators = [
        "no",
        "not suitable",
        "not recommended",
        "difficult",
        "challenging",
        "poor choice",
        "not ideal",
        "not compatible",
        "not viable",
        "avoid",
      ];

      const hasPositive = positiveIndicators.some((indicator) =>
        lowerResponse.includes(indicator)
      );
      const hasNegative = negativeIndicators.some((indicator) =>
        lowerResponse.includes(indicator)
      );

      return hasPositive && !hasNegative;
    };

    const detectedCrop = extractCropFromQuestion(originalInput);
    const isApproved = isPositiveResponse(aiResponse);

    const aiMessage = {
      id: Date.now() + 1,
      type: "ai",
      message: aiResponse,
      timestamp: new Date(),
      suggestedCrop: detectedCrop && isApproved ? detectedCrop : null,
    };

    setChatMessages((prev) => [...prev, aiMessage]);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Add handler for crop type changes
  const handleCropTypeChange = (value) => {
    if (value === "custom") {
      setIsCustomCrop(true);
      setFormData((prev) => ({ ...prev, cropType: customCropInput }));
    } else {
      setIsCustomCrop(false);
      setCustomCropInput("");
      setFormData((prev) => ({ ...prev, cropType: value }));
    }
  };

  // Add handler for custom crop input
  const handleCustomCropChange = (value) => {
    setCustomCropInput(value);
    setFormData((prev) => ({ ...prev, cropType: value }));
    if (errors.cropType) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSoilAnalysisChange = (field, value) => {
    setSoilAnalysis((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateSoilAnalysis = () => {
    const newErrors = {};

    if (!soilAnalysis.potassium || parseFloat(soilAnalysis.potassium) < 0) {
      newErrors.potassium = "Potassium level is required";
    }
    if (!soilAnalysis.phosphorus || parseFloat(soilAnalysis.phosphorus) < 0) {
      newErrors.phosphorus = "Phosphorus level is required";
    }
    if (!soilAnalysis.nitrogen || parseFloat(soilAnalysis.nitrogen) < 0) {
      newErrors.nitrogen = "Nitrogen level is required";
    }
    if (
      !soilAnalysis.pH ||
      parseFloat(soilAnalysis.pH) < 0 ||
      parseFloat(soilAnalysis.pH) > 14
    ) {
      newErrors.pH = "pH must be between 0-14";
    }
    if (
      !soilAnalysis.organicMatter ||
      parseFloat(soilAnalysis.organicMatter) < 0 ||
      parseFloat(soilAnalysis.organicMatter) > 100
    ) {
      newErrors.organicMatter = "Organic matter must be between 0-100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Field name is required";
    }
    if (!formData.area || parseFloat(formData.area) <= 0) {
      newErrors.area = "Area must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSoilAnalysisSubmit = (e) => {
    e.preventDefault();
    if (validateSoilAnalysis()) {
      getAICropRecommendations(soilAnalysis);
    }
  };

  const handleCropSelection = (selectedCrop) => {
    setFormData((prev) => ({ ...prev, cropType: selectedCrop }));
    setCurrentStep(3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newField = {
      name: formData.name.trim(),
      cropType: formData.cropType,
      area: parseFloat(formData.area),
      lastWatered: new Date(),
      pumpStatus: formData.pumpStatus,

      // AI-determined values
      health: aiFieldAnalysis.health,
      recommendedWater: aiFieldAnalysis.recommendedWater,

      // These will be fetched from backend later
      soilMoisture: 0, // Will be updated from sensors
      temperature: 0, // Will be updated from sensors

      // Include soil analysis for first field
      ...(isFirstField && {
        soilAnalysis: {
          potassium: parseFloat(soilAnalysis.potassium),
          phosphorus: parseFloat(soilAnalysis.phosphorus),
          nitrogen: parseFloat(soilAnalysis.nitrogen),
          pH: parseFloat(soilAnalysis.pH),
          organicMatter: parseFloat(soilAnalysis.organicMatter),
          soilTexture: soilAnalysis.soilTexture,
        },
        aiAnalysis: {
          recommendedCrops: aiRecommendations,
          explanation: aiExplanation,
          fieldHealth: aiFieldAnalysis.health,
          waterRecommendation: aiFieldAnalysis.recommendedWater,
          waterExplanation: aiFieldAnalysis.explanation,
        },
      }),
    };

    onAddField(newField);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      cropType: "Tomatoes",
      area: "",
      pumpStatus: "off",
    });
    setSoilAnalysis({
      potassium: "",
      phosphorus: "",
      nitrogen: "",
      pH: "",
      organicMatter: "",
      soilTexture: "loam",
    });
    setCurrentStep(isFirstField ? 1 : 3);
    setErrors({});
    setAiRecommendations([]);
    setAiExplanation("");
    setAiFieldAnalysis({
      health: "good",
      recommendedWater: 2.5,
      explanation: "",
    });
    setAiError("");
    setChatMessages([]);
    setChatInput("");
    setShowChat(false);
    // Reset custom crop states
    setIsCustomCrop(false);
    setCustomCropInput("");
    onClose();
  };

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(isFirstField ? 1 : 3);
    }
  }, [isOpen, isFirstField]);

  if (!isOpen) return null;

  const renderStepIndicator = () => {
    if (!isFirstField) return null;

    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center ${
              currentStep >= 1 ? "text-green-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? "bg-green-600 text-white" : "bg-gray-200"
              }`}
            >
              <FlaskConical className="h-4 w-4" />
            </div>
            <span className="ml-2 text-sm font-medium">Soil Analysis</span>
          </div>
          <div
            className={`w-8 h-0.5 ${
              currentStep >= 2 ? "bg-green-600" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`flex items-center ${
              currentStep >= 2 ? "text-green-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-200"
              }`}
            >
              <Brain className="h-4 w-4" />
            </div>
            <span className="ml-2 text-sm font-medium">AI Recommendations</span>
          </div>
          <div
            className={`w-8 h-0.5 ${
              currentStep >= 3 ? "bg-green-600" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`flex items-center ${
              currentStep >= 3 ? "text-green-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? "bg-green-600 text-white" : "bg-gray-200"
              }`}
            >
              <Plus className="h-4 w-4" />
            </div>
            <span className="ml-2 text-sm font-medium">Field Details</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSoilAnalysisStep = () => (
    <form onSubmit={handleSoilAnalysisSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="bg-blue-100 p-4 rounded-lg mb-4">
          <FlaskConical className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Soil Laboratory Analysis
          </h3>
          <p className="text-sm text-gray-600">
            Please enter the data from your soil laboratory test report to get
            AI-powered crop recommendations and field analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Potassium Level (ppm) *
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={soilAnalysis.potassium}
            onChange={(e) =>
              handleSoilAnalysisChange("potassium", e.target.value)
            }
            placeholder="e.g., 150"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.potassium ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.potassium && (
            <p className="text-red-500 text-xs mt-1">{errors.potassium}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phosphorus Level (ppm) *
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={soilAnalysis.phosphorus}
            onChange={(e) =>
              handleSoilAnalysisChange("phosphorus", e.target.value)
            }
            placeholder="e.g., 25"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.phosphorus ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phosphorus && (
            <p className="text-red-500 text-xs mt-1">{errors.phosphorus}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nitrogen Level (ppm) *
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={soilAnalysis.nitrogen}
            onChange={(e) =>
              handleSoilAnalysisChange("nitrogen", e.target.value)
            }
            placeholder="e.g., 40"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.nitrogen ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.nitrogen && (
            <p className="text-red-500 text-xs mt-1">{errors.nitrogen}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            pH Level *
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="14"
            value={soilAnalysis.pH}
            onChange={(e) => handleSoilAnalysisChange("pH", e.target.value)}
            placeholder="e.g., 6.5"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.pH ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.pH && (
            <p className="text-red-500 text-xs mt-1">{errors.pH}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organic Matter Content (%) *
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={soilAnalysis.organicMatter}
            onChange={(e) =>
              handleSoilAnalysisChange("organicMatter", e.target.value)
            }
            placeholder="e.g., 3.2"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.organicMatter ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.organicMatter && (
            <p className="text-red-500 text-xs mt-1">{errors.organicMatter}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Soil Texture *
          </label>
          <select
            value={soilAnalysis.soilTexture}
            onChange={(e) =>
              handleSoilAnalysisChange("soilTexture", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {soilTextureOptions.map((texture) => (
              <option key={texture} value={texture}>
                {texture.charAt(0).toUpperCase() + texture.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {aiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{aiError}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={handleClose}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoadingAI}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoadingAI ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing Soil...</span>
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              <span>Get AI Analysis</span>
            </>
          )}
        </button>
      </div>
    </form>
  );

  const renderChatSystem = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center">
          <MessageCircle className="h-4 w-4 mr-2" />
          Ask AI About Other Crops
        </h4>
        <button
          onClick={() => setShowChat(!showChat)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showChat ? "Hide Chat" : "Show Chat"}
        </button>
      </div>

      {showChat && (
        <div className="space-y-3">
          {/* Chat Messages */}
          <div className="max-h-40 overflow-y-auto space-y-2 bg-white rounded p-3 border">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Ask me about any crop you'd like to plant!</p>
                <p className="text-xs mt-1">
                  Example: "Can I grow strawberries in this soil?"
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.type === "ai" && (
                      <div className="flex items-center mb-1">
                        <Brain className="h-3 w-3 mr-1 text-green-600" />
                        <span className="text-xs font-medium text-green-600">
                          AI Advisor
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.message}</p>

                    {/* Add crop selection button if AI approved the crop */}
                    {msg.type === "ai" && msg.suggestedCrop && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleCropSelection(msg.suggestedCrop)}
                          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                        >
                          <Leaf className="h-3 w-3" />
                          <span>Select {msg.suggestedCrop}</span>
                        </button>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Click to use this crop for your field
                        </p>
                      </div>
                    )}

                    <p
                      className={`text-xs mt-1 ${
                        msg.type === "user" ? "text-blue-200" : "text-gray-500"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                  <div className="flex items-center">
                    <Brain className="h-3 w-3 mr-1 text-green-600" />
                    <span className="text-xs font-medium text-green-600 mr-2">
                      AI Advisor
                    </span>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                  </div>
                  <p className="text-gray-600 mt-1">
                    Analyzing your question...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleChatSubmit} className="flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about any crop... e.g., 'Can I grow blueberries?'"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={isChatLoading}
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="text-xs text-gray-500">
            💡 Tip: Ask specific questions like "Can I grow oranges?" or "What
            about coffee plants?"
          </p>
        </div>
      )}
    </div>
  );

  const renderAIRecommendationsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="bg-green-100 p-4 rounded-lg mb-4">
          <Brain className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Field Analysis & Crop Recommendations
          </h3>
          <p className="text-sm text-gray-600">
            Based on your soil analysis, here's our complete field assessment:
          </p>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          Why These Crops Are Recommended
        </h4>
        <p className="text-blue-800 text-sm leading-relaxed">{aiExplanation}</p>
      </div>

      {/* AI Field Assessment */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          AI Field Assessment
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-green-600 font-medium">
              Field Health:
            </span>
            <div
              className={`inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                aiFieldAnalysis.health === "excellent"
                  ? "text-green-600 bg-green-100"
                  : aiFieldAnalysis.health === "good"
                  ? "text-blue-600 bg-blue-100"
                  : aiFieldAnalysis.health === "fair"
                  ? "text-yellow-600 bg-yellow-100"
                  : "text-red-600 bg-red-100"
              }`}
            >
              {aiFieldAnalysis.health.charAt(0).toUpperCase() +
                aiFieldAnalysis.health.slice(1)}
            </div>
          </div>
          <div>
            <span className="text-xs text-green-600 font-medium">
              Recommended Water:
            </span>
            <span className="ml-2 text-sm font-semibold text-green-800">
              {aiFieldAnalysis.recommendedWater} L/m²
            </span>
          </div>
        </div>
        <p className="text-green-700 text-xs mt-3 leading-relaxed">
          {aiFieldAnalysis.explanation}
        </p>
      </div>

      {/* Crop Selection */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Select Your Preferred Crop:
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {aiRecommendations.map((crop, index) => (
            <button
              key={index}
              onClick={() => handleCropSelection(crop)}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center group"
            >
              <Leaf className="h-6 w-6 text-green-500 mx-auto mb-2 group-hover:text-green-600" />
              <span className="text-sm font-medium text-gray-900">{crop}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat System */}
      {renderChatSystem()}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          💡 <strong>Note:</strong> Temperature and soil moisture will be
          automatically monitored by sensors. Field health and irrigation
          amounts have been optimized by AI based on your soil analysis.
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Back to Soil Analysis
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center space-x-2"
        >
          <span>Continue with Selected Crop</span>
        </button>
      </div>
    </div>
  );

  const renderFieldDetailsStep = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-green-500" />
          <span>Field Configuration</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., North Field, Garden A"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Area (hectares) *
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={formData.area}
            onChange={(e) => handleInputChange("area", e.target.value)}
            placeholder="e.g., 2.5"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.area ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.area && (
            <p className="text-red-500 text-xs mt-1">{errors.area}</p>
          )}
        </div>

        {/* Enhanced Crop Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Crop *{" "}
            {isFirstField && aiRecommendations.length > 0 && (
              <span className="text-green-600 text-xs">(AI Recommended)</span>
            )}
          </label>

          {!isCustomCrop ? (
            <div className="space-y-2">
              <select
                value={formData.cropType}
                onChange={(e) => handleCropTypeChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.cropType ? "border-red-500" : "border-gray-300"
                }`}
              >
                {/* Show AI recommendations first if available */}
                {isFirstField && aiRecommendations.length > 0 && (
                  <optgroup label="🧠 AI Recommended">
                    {aiRecommendations.map((crop) => (
                      <option key={`ai-${crop}`} value={crop}>
                        {crop}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="📋 Standard Options">
                  {cropTypes.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="✏️ Custom">
                  <option value="custom">Type your own crop...</option>
                </optgroup>
              </select>

              <button
                type="button"
                onClick={() => setIsCustomCrop(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-sm text-gray-600 hover:text-green-700"
              >
                <Plus className="h-4 w-4" />
                <span>Or type your own crop</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customCropInput}
                  onChange={(e) => handleCustomCropChange(e.target.value)}
                  placeholder="e.g., Dragon Fruit, Quinoa, Bamboo..."
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.cropType ? "border-red-500" : "border-gray-300"
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCrop(false);
                    setCustomCropInput("");
                    setFormData((prev) => ({ ...prev, cropType: "Tomatoes" }));
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                  title="Cancel custom input"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Leaf className="h-3 w-3 text-green-500" />
                <span>Enter the exact name of the crop you want to plant</span>
              </div>

              {/* Quick suggestions for custom crops */}
              <div className="flex flex-wrap gap-1">
                {[
                  "Strawberries",
                  "Blueberries",
                  "Avocado",
                  "Coffee",
                  "Tea",
                  "Herbs",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleCustomCropChange(suggestion)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {errors.cropType && (
            <p className="text-red-500 text-xs mt-1">{errors.cropType}</p>
          )}

          {/* Crop Selection Summary */}
          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 text-sm">
              <Leaf className="h-4 w-4 text-green-500" />
              <span className="font-medium text-gray-700">Selected:</span>
              <span className="text-gray-900 font-semibold">
                {formData.cropType || "No crop selected"}
              </span>
              {isFirstField &&
                aiRecommendations.includes(formData.cropType) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <Brain className="h-3 w-3 mr-1" />
                    AI Recommended
                  </span>
                )}
              {isCustomCrop && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <Plus className="h-3 w-3 mr-1" />
                  Custom Crop
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial Pump Status
          </label>
          <select
            value={formData.pumpStatus}
            onChange={(e) => handleInputChange("pumpStatus", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="off">Off</option>
            <option value="on">On</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      {/* AI-Determined Settings */}
      {isFirstField && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>AI-Optimized Settings</span>
          </h3>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Field Health (AI Determined)
                </label>
                <div
                  className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${
                    aiFieldAnalysis.health === "excellent"
                      ? "text-green-600 bg-green-100"
                      : aiFieldAnalysis.health === "good"
                      ? "text-blue-600 bg-blue-100"
                      : aiFieldAnalysis.health === "fair"
                      ? "text-yellow-600 bg-yellow-100"
                      : "text-red-600 bg-red-100"
                  }`}
                >
                  {aiFieldAnalysis.health.charAt(0).toUpperCase() +
                    aiFieldAnalysis.health.slice(1)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Recommended Water (AI Optimized)
                </label>
                <div className="inline-block px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  {aiFieldAnalysis.recommendedWater} L/m²
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Thermometer className="h-4 w-4 mr-2" />
              Sensor Integration
            </h4>
            <p className="text-gray-600 text-sm">
              🌡️ <strong>Temperature</strong> and 💧{" "}
              <strong>Soil Moisture</strong> will be automatically monitored by
              field sensors and updated in real-time.
            </p>
          </div>
        </div>
      )}

      {/* Soil Analysis Summary for first field */}
      {isFirstField &&
        Object.values(soilAnalysis).some((val) => val !== "") && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
              <FlaskConical className="h-4 w-4 mr-2" />
              Soil Analysis Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-600">
              <div>K: {soilAnalysis.potassium} ppm</div>
              <div>P: {soilAnalysis.phosphorus} ppm</div>
              <div>N: {soilAnalysis.nitrogen} ppm</div>
              <div>pH: {soilAnalysis.pH}</div>
              <div>OM: {soilAnalysis.organicMatter}%</div>
              <div>Texture: {soilAnalysis.soilTexture}</div>
            </div>
          </div>
        )}

      {/* Preview Card */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Field Preview
        </h4>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h5 className="font-semibold text-gray-900">
                {formData.name || "Field Name"}
              </h5>
              <p className="text-sm text-gray-500">
                {formData.cropType} • {formData.area || "0"} hectares
                {isFirstField &&
                  aiRecommendations.includes(formData.cropType) && (
                    <span className="text-green-600 text-xs ml-1">🧠 AI</span>
                  )}
              </p>
            </div>
            {isFirstField && (
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  aiFieldAnalysis.health === "excellent"
                    ? "text-green-600 bg-green-50"
                    : aiFieldAnalysis.health === "good"
                    ? "text-blue-600 bg-blue-50"
                    : aiFieldAnalysis.health === "fair"
                    ? "text-yellow-600 bg-yellow-50"
                    : "text-red-600 bg-red-50"
                }`}
              >
                {aiFieldAnalysis.health} (AI)
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Sensors: Active 🌡️💧</div>
            <div>
              Water: {isFirstField ? aiFieldAnalysis.recommendedWater : "2.5"}{" "}
              L/m²
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={
            isFirstField && currentStep > 1
              ? () => setCurrentStep(currentStep - 1)
              : handleClose
          }
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          {isFirstField && currentStep > 1 ? "Back" : "Cancel"}
        </button>
        <button
          type="submit"
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Field</span>
        </button>
      </div>
    </form>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-lg">
              {isFirstField ? (
                <FlaskConical className="h-6 w-6 text-white" />
              ) : (
                <Plus className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isFirstField ? "Setup Your First Field" : "Add New Field"}
              </h2>
              <p className="text-sm text-gray-500">
                {isFirstField
                  ? "AI-powered soil analysis and crop optimization"
                  : "Configure your new irrigation field"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <div className="p-6">
          {isFirstField && currentStep === 1 && renderSoilAnalysisStep()}
          {isFirstField && currentStep === 2 && renderAIRecommendationsStep()}
          {currentStep === 3 && renderFieldDetailsStep()}
        </div>
      </div>
    </div>
  );
}
