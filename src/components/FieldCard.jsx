import React, { useState, useEffect } from "react";
import {
  Droplets,
  Thermometer,
  Calendar,
  Power,
  Zap,
  AlertCircle,
  Clock,
  X,
  History,
  Play,
  Square,
  Settings,
} from "lucide-react";
import { AIService } from "../services/aiService";
import { notificationService } from "../services/notificationService";

export default function FieldCard({
  field,
  onPumpToggle,
  onScheduleUpdate,
  isScheduleActive,
}) {
  const [aiRecommendation, setAIRecommendation] = useState("");
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [tempSchedule, setTempSchedule] = useState({
    startTime: field.scheduleSettings?.startTime || "21:00",
    endTime: field.scheduleSettings?.endTime || "23:00",
  });
  const [isOperating, setIsOperating] = useState(false);

  // Monitor soil moisture when in auto mode
  useEffect(() => {
    if (field.pumpStatus === "auto") {
      // Check soil moisture levels and trigger notifications
      if (field.soilMoisture < 30) {
        notificationService.addNotification({
          type: "critical",
          title: "Critical Soil Moisture",
          message: `${field.name} (${field.cropType}) has critically low soil moisture at ${field.soilMoisture}%. Immediate watering recommended.`,
          fieldId: field.id,
        });
      } else if (field.soilMoisture < 45) {
        notificationService.addNotification({
          type: "warning",
          title: "Low Soil Moisture Alert",
          message: `${field.name} soil moisture is at ${
            field.soilMoisture
          }%. Consider watering your ${field.cropType.toLowerCase()} soon.`,
          fieldId: field.id,
        });
      }

      // Check field health and temperature
      if (field.health === "poor") {
        notificationService.addNotification({
          type: "warning",
          title: "Field Health Alert",
          message: `${field.name} health is poor. Check crop conditions and adjust irrigation schedule.`,
          fieldId: field.id,
        });
      }

      // Temperature-based alerts
      if (field.temperature > 35) {
        notificationService.addNotification({
          type: "info",
          title: "High Temperature Alert",
          message: `${field.name} temperature is ${field.temperature}°C. Consider increasing irrigation frequency during hot weather.`,
          fieldId: field.id,
        });
      }
    }
  }, [
    field.soilMoisture,
    field.pumpStatus,
    field.health,
    field.temperature,
    field.name,
    field.cropType,
    field.id,
  ]);

  // Enhanced valve control with proper state management
  const handleValveControl = async (action) => {
    if (isOperating) return; // Prevent multiple simultaneous operations

    setIsOperating(true);
    try {
      switch (action) {
        case "turn_on":
          await onPumpToggle(field.id, "on");
          break;
        case "turn_off":
          await onPumpToggle(field.id, "off");
          break;
        case "set_auto":
          await onPumpToggle(field.id, "auto");
          // Immediate assessment when switching to auto mode
          setTimeout(() => {
            handleAutoModeAssessment();
          }, 2000);
          break;
        default:
          console.warn(`Unknown valve action: ${action}`);
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      notificationService.addNotification({
        type: "error",
        title: "Valve Control Error",
        message: `Failed to ${action.replace("_", " ")} for ${
          field.name
        }. Please try again.`,
        fieldId: field.id,
      });
    } finally {
      setIsOperating(false);
    }
  };

  // AI assessment for auto mode
  const handleAutoModeAssessment = async () => {
    try {
      const recommendation = await AIService.getWateringRecommendation(
        field,
        {}
      );

      // Create AI recommendation notification
      notificationService.addAIRecommendation(
        field.name,
        `Auto Mode Assessment: ${recommendation}`
      );
    } catch (error) {
      console.error("Auto mode assessment error:", error);
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case "excellent":
        return "text-green-600 bg-green-50";
      case "good":
        return "text-blue-600 bg-blue-50";
      case "fair":
        return "text-yellow-600 bg-yellow-50";
      case "poor":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getMoistureColor = (moisture) => {
    if (moisture < 30) return "text-red-500";
    if (moisture < 50) return "text-yellow-500";
    return "text-green-500";
  };

  const getValveStatusColor = (status) => {
    switch (status) {
      case "on":
        return "bg-green-100 text-green-800";
      case "auto":
        return "bg-blue-100 text-blue-800";
      case "off":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getValveStatusIcon = (status) => {
    switch (status) {
      case "on":
        return <Play className="h-3 w-3" />;
      case "auto":
        return <Zap className="h-3 w-3" />;
      case "off":
      default:
        return <Square className="h-3 w-3" />;
    }
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(":");
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour =
      hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const formatLastWatered = (lastWatered) => {
    const now = new Date();
    const diffInHours = Math.floor((now - lastWatered) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - lastWatered) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const handleGetRecommendation = async () => {
    setLoadingRecommendation(true);
    try {
      const response = await AIService.getWateringRecommendation(field, {});
      setAIRecommendation(response);
    } catch (error) {
      setAIRecommendation("Unable to get recommendation. Please try again.");
    }
    setLoadingRecommendation(false);
  };

  const handleScheduleSubmit = () => {
    if (tempSchedule.startTime === tempSchedule.endTime) {
      alert("Start and end times cannot be the same");
      return;
    }

    onScheduleUpdate(field.id, {
      ...tempSchedule,
      enabled: true,
    });

    setShowScheduleForm(false);
  };

  const handleCancelSchedule = () => {
    onScheduleUpdate(field.id, {
      ...field.scheduleSettings,
      enabled: false,
    });
  };

  const isManualControlDisabled =
    field.scheduleSettings?.enabled && isScheduleActive;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
          <p className="text-sm text-gray-500">
            {field.cropType} • {field.area} hectares
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {field.scheduleSettings?.enabled && (
            <Clock
              className={`h-4 w-4 ${
                isScheduleActive ? "text-green-500" : "text-blue-500"
              }`}
            />
          )}
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthColor(
              field.health
            )}`}
          >
            {field.health}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Droplets
            className={`h-4 w-4 ${getMoistureColor(field.soilMoisture)}`}
          />
          <div>
            <p className="text-xs text-gray-500">Soil Moisture</p>
            <p
              className={`text-sm font-semibold ${getMoistureColor(
                field.soilMoisture
              )}`}
            >
              {field.soilMoisture}%
              {field.pumpStatus === "auto" && field.soilMoisture < 30 && (
                <span className="ml-1 text-red-500 animate-pulse">⚠️</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Thermometer className="h-4 w-4 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500">Temperature</p>
            <p className="text-sm font-semibold text-gray-900">
              {field.temperature}°C
              {field.pumpStatus === "auto" && field.temperature > 35 && (
                <span className="ml-1 text-orange-500">🔥</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Valve Status Banner */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Power className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Valve Status
            </span>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getValveStatusColor(
              field.pumpStatus
            )}`}
          >
            {getValveStatusIcon(field.pumpStatus)}
            <span>{field.pumpStatus.toUpperCase()}</span>
            {field.pumpStatus === "auto" && <span>🤖</span>}
          </div>
        </div>
      </div>

      {/* Enhanced Last Watered */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <History className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Last watered</p>
            <p className="text-sm text-gray-700">
              {formatLastWatered(field.lastWatered)}
            </p>
          </div>
        </div>

        {/* Watering logs count indicator */}
        {field.waterLogs?.length > 0 && (
          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            {field.waterLogs.length} logs
          </div>
        )}
      </div>

      {/* Schedule Status (if enabled) */}
      {field.scheduleSettings?.enabled && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            isScheduleActive
              ? "bg-green-50 border border-green-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock
                className={`h-4 w-4 ${
                  isScheduleActive ? "text-green-500" : "text-blue-500"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${
                    isScheduleActive ? "text-green-800" : "text-blue-800"
                  }`}
                >
                  {isScheduleActive
                    ? "🚿 Auto-watering active"
                    : "⏰ Scheduled watering"}
                </p>
                <p
                  className={`text-xs ${
                    isScheduleActive ? "text-green-600" : "text-blue-600"
                  }`}
                >
                  {formatTime(field.scheduleSettings.startTime)} -{" "}
                  {formatTime(field.scheduleSettings.endTime)}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelSchedule}
              className="text-red-500 hover:text-red-600 transition-colors"
              title="Cancel schedule"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Schedule Form (if setting up) */}
      {showScheduleForm && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-medium text-gray-700">
              Schedule Auto Watering
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={tempSchedule.startTime}
                onChange={(e) =>
                  setTempSchedule((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={tempSchedule.endTime}
                onChange={(e) =>
                  setTempSchedule((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleScheduleSubmit}
              className="flex-1 bg-blue-500 text-white px-3 py-2 text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              📅 Set Schedule & Create Log
            </button>
            <button
              onClick={() => setShowScheduleForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Valve Control */}
      <div className="border-t border-gray-100 pt-4 mb-4">
        {/* Schedule Button (if no schedule set) */}
        {!field.scheduleSettings?.enabled && !showScheduleForm && (
          <div className="mb-3">
            <button
              onClick={() => setShowScheduleForm(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>⏰ Schedule Auto Watering</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {/* Manual On/Off Button */}
          <button
            onClick={() =>
              handleValveControl(
                field.pumpStatus === "on" ? "turn_off" : "turn_on"
              )
            }
            disabled={isManualControlDisabled || isOperating}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
              field.pumpStatus === "on"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-green-500 text-white hover:bg-green-600"
            } ${
              isManualControlDisabled || isOperating
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {field.pumpStatus === "on" ? (
              <>
                <Square className="h-3 w-3" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                <span>Start</span>
              </>
            )}
          </button>

          {/* Auto Mode Button */}
          <button
            onClick={() => handleValveControl("set_auto")}
            disabled={isManualControlDisabled || isOperating}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
              field.pumpStatus === "auto"
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } ${
              isManualControlDisabled || isOperating
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            title="AI Auto Mode - Smart irrigation with watering logs"
          >
            <Zap className="h-3 w-3" />
            <span>Auto</span>
          </button>

          {/* Settings Button (Future f eature) */}
          <button
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
            title="Valve settings (Coming soon)"
            disabled
          >
            <Settings className="h-3 w-3" />
            <span>Settings</span>
          </button>
        </div>

        {isManualControlDisabled && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Manual control disabled during scheduled watering
          </p>
        )}

        {isOperating && (
          <p className="text-xs text-blue-500 text-center mt-2">
            Processing valve operation...
          </p>
        )}
      </div>

      {/* AI Recommendation */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={handleGetRecommendation}
          disabled={loadingRecommendation}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50"
        >
          {loadingRecommendation
            ? "Getting AI Recommendation..."
            : "🤖 Get AI Recommendation"}
        </button>

        {aiRecommendation && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{aiRecommendation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
