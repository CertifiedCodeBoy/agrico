import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  Loader,
  Camera,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { AIService } from "../services/aiService";
import { ollamaService } from "../services/ollamaService";
import cropDatabase from "../data/cropDatabase.json";

export default function CropAssistant() {
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "ai",
      content: `Hello! 👋 I'm your AI-powered crop assistant running on Ollama. I can help you with ${selectedCrop.toLowerCase()} care, watering schedules, disease prevention, and general farming advice. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState("");
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState("checking");
  const [availableModels, setAvailableModels] = useState([]);
  const messagesEndRef = useRef(null);

  // Check Ollama connection on component mount
  useEffect(() => {
    checkOllamaConnection();
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkOllamaConnection = async () => {
    setOllamaStatus("checking");
    try {
      const result = await ollamaService.checkConnection();
      setOllamaStatus(result.status);
      setAvailableModels(result.models);

      if (result.status === "connected" && result.models.length === 0) {
        setOllamaStatus("no-models");
      }
    } catch (error) {
      console.error("Connection check failed:", error);
      setOllamaStatus("disconnected");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await AIService.getCropAdvice(
        selectedCrop,
        inputMessage
      );
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Message send error:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Sorry, I encountered an error. Please make sure Ollama is running and try again. 🤖",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleCropChange = (newCrop) => {
    setSelectedCrop(newCrop);
    const welcomeMessage = {
      id: Date.now().toString(),
      type: "ai",
      content: `Switched to ${newCrop}! 🌱 I can now provide specific advice for ${newCrop.toLowerCase()} cultivation, irrigation, and care. What would you like to know about growing ${newCrop.toLowerCase()}?`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, welcomeMessage]);
  };

  const handleImageAnalysis = async () => {
    setAnalyzingImage(true);
    try {
      const result = await AIService.analyzePlantHealth("mock-image-data");
      setImageAnalysis(result);
    } catch (error) {
      setImageAnalysis(
        "Unable to analyze image. Please ensure Ollama is running. 🌱"
      );
    }
    setAnalyzingImage(false);
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const quickQuestions = [
    "When should I water my crop?",
    "What are common diseases to watch for?",
    "How do I know if my plants are healthy?",
    "What's the ideal soil moisture range?",
    "How can I save water while farming?",
    "What are signs of overwatering?",
  ];

  const cropInfo = cropDatabase.find((crop) => crop.name === selectedCrop);

  const getStatusIndicator = () => {
    switch (ollamaStatus) {
      case "connected":
        return (
          <>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-600 font-medium">
              Ollama Connected ({availableModels.length} models)
            </span>
          </>
        );
      case "no-models":
        return (
          <>
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-yellow-600 font-medium">
              Ollama Running (No Models)
            </span>
          </>
        );
      case "disconnected":
        return (
          <>
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-600 font-medium">
              Ollama Offline
            </span>
          </>
        );
      default:
        return (
          <>
            <Loader className="h-5 w-5 text-blue-500 animate-spin" />
            <span className="text-sm text-blue-600 font-medium">
              Checking...
            </span>
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Ollama Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI Crop Assistant (Ollama Powered)
            </h2>
            <p className="text-gray-600">
              Get personalized advice for your crops using our AI-powered
              agricultural assistant
            </p>
          </div>

          {/* Ollama Status Indicator */}
          <div className="flex items-center space-x-2">
            {getStatusIndicator()}
            <button
              onClick={checkOllamaConnection}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Ollama Setup Instructions */}
        {(ollamaStatus === "disconnected" || ollamaStatus === "no-models") && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              {ollamaStatus === "no-models"
                ? "Install a Model"
                : "Ollama Setup Required"}
            </h3>
            <div className="text-xs text-yellow-700 space-y-1">
              {ollamaStatus === "disconnected" && (
                <>
                  <p>
                    1. Install Ollama:{" "}
                    <code className="bg-yellow-100 px-1 rounded">
                      curl -fsSL https://ollama.ai/install.sh | sh
                    </code>
                  </p>
                  <p>
                    2. Start Ollama:{" "}
                    <code className="bg-yellow-100 px-1 rounded">
                      ollama serve
                    </code>
                  </p>
                </>
              )}
              <p>
                3. Pull a model:{" "}
                <code className="bg-yellow-100 px-1 rounded">
                  ollama pull llama3.2
                </code>
              </p>
              <p>
                4. Alternative models:{" "}
                <code className="bg-yellow-100 px-1 rounded">
                  ollama pull mistral
                </code>{" "}
                or{" "}
                <code className="bg-yellow-100 px-1 rounded">
                  ollama pull llama3.2:7b
                </code>
              </p>
              <p>5. Refresh the connection above</p>
            </div>
          </div>
        )}

        {/* Show available models */}
        {ollamaStatus === "connected" && availableModels.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Available models: {availableModels.map((m) => m.name).join(", ")}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
            {/* Crop Selector */}
            <div className="p-4 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Crop Type
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => handleCropChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {cropDatabase.map((crop) => (
                  <option key={crop.id} value={crop.name}>
                    {crop.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === "user"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.type === "user"
                          ? "text-green-100"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask about watering, diseases, planting tips..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={ollamaStatus !== "connected"}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={
                    !inputMessage.trim() ||
                    isLoading ||
                    ollamaStatus !== "connected"
                  }
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              {ollamaStatus !== "connected" && (
                <p className="text-xs text-gray-500 mt-2">
                  Please ensure Ollama is running and has a model installed to
                  chat.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - rest of the component remains the same */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Questions */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Quick Questions
            </h3>
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Plant Health Analysis */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Plant Health Analysis
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get AI-powered plant health analysis (demo mode)
            </p>

            <button
              onClick={handleImageAnalysis}
              disabled={analyzingImage}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {analyzingImage ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  <span>Analyze Plant Health</span>
                </>
              )}
            </button>

            {imageAnalysis && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{imageAnalysis}</p>
              </div>
            )}
          </div>

          {/* Crop Information */}
          {selectedCrop && cropInfo && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {selectedCrop} Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Watering Frequency
                  </p>
                  <p className="text-sm text-gray-600">
                    {cropInfo.wateringFrequency}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Growth Stage
                  </p>
                  <p className="text-sm text-gray-600">
                    {cropInfo.growthStage}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Soil Moisture Range
                  </p>
                  <p className="text-sm text-gray-600">
                    {cropInfo.soilMoistureRange[0]}% -{" "}
                    {cropInfo.soilMoistureRange[1]}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
