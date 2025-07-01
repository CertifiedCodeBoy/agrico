import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { geminiService } from "../services/geminiService";
import { AIService } from "../services/aiService";

export default function CropAssistant() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "bot",
      content:
        "🌱 Hello! I'm your smart farming assistant powered by Google Gemini AI. Ask me anything about irrigation, crop care, soil management, or plant health!",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState("checking");
  const messagesEndRef = useRef(null);

  // Check Gemini connection on component mount
  useEffect(() => {
    checkGeminiConnection();
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkGeminiConnection = async () => {
    setGeminiStatus("checking");
    try {
      const result = await geminiService.checkConnection();
      setGeminiStatus(result.status);
    } catch (error) {
      console.error("Connection check failed:", error);
      setGeminiStatus("disconnected");
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
      // Use AIService which will route to Gemini
      const response = await AIService.getCropAdvice("General", inputMessage);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          "Sorry, I encountered an error processing your request. Please check your Gemini API configuration and try again. 🤖",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndicator = () => {
    switch (geminiStatus) {
      case "connected":
        return (
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span className="text-xs">Gemini Connected</span>
          </div>
        );
      case "checking":
        return (
          <div className="flex items-center space-x-1 text-blue-600">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span className="text-xs">Checking...</span>
          </div>
        );
      case "not-configured":
        return (
          <div className="flex items-center space-x-1 text-orange-600">
            <AlertCircle className="h-3 w-3" />
            <span className="text-xs">API Key Required</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 text-red-600">
            <WifiOff className="h-3 w-3" />
            <span className="text-xs">Disconnected</span>
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🤖 AI Crop Assistant
            </h2>
            <p className="text-gray-600">
              Get expert advice on irrigation, crop management, and plant health
              powered by Google Gemini AI
            </p>
          </div>

          {/* Gemini Status Indicator */}
          <div className="flex items-center space-x-2">
            {getStatusIndicator()}
            <button
              onClick={checkGeminiConnection}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Gemini Setup Instructions */}
        {geminiStatus === "not-configured" && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Gemini API Key Required
            </h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>
                1. Get a free API key from{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-900"
                >
                  Google AI Studio
                </a>
              </p>
              <p>
                2. Add it to your .env file:{" "}
                <code className="bg-yellow-100 px-1 rounded">
                  VITE_GEMINI_API_KEY=your_api_key_here
                </code>
              </p>
              <p>3. Restart your development server</p>
            </div>
          </div>
        )}

        {geminiStatus === "disconnected" && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Connection Error
            </h3>
            <div className="text-xs text-red-700">
              <p>
                Cannot connect to Gemini AI. Please check your API key and
                internet connection.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  message.type === "user"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === "bot" && (
                    <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
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
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                  {message.type === "user" && (
                    <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about irrigation, crop care, soil management..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              disabled={isLoading || geminiStatus !== "connected"}
            />
            <button
              onClick={handleSendMessage}
              disabled={
                isLoading ||
                !inputMessage.trim() ||
                geminiStatus !== "connected"
              }
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </div>

          {geminiStatus !== "connected" && (
            <p className="text-xs text-gray-500 mt-2">
              {geminiStatus === "not-configured"
                ? "Configure Gemini API key to start chatting"
                : "Check your Gemini connection to enable chat"}
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Quick Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "What's the optimal watering schedule for tomatoes?",
            "How do I know if my soil moisture is right?",
            "Signs of overwatering in plants?",
            "Best irrigation methods for water conservation?",
            "How to detect plant diseases early?",
            "Optimal soil moisture for different crops?",
          ].map((question, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(question)}
              disabled={geminiStatus !== "connected"}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
