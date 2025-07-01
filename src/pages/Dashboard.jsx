import React, { useState, useEffect } from "react";
import { mockFields, mockWeather } from "../data/mockData";
import FieldCard from "../components/FieldCard";
import WeatherWidget from "../components/WeatherWidget";
import AddFieldModal from "../components/AddFieldModal";
import {
  TrendingUp,
  Droplets,
  Zap,
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function Dashboard() {
  // Initialize fields with individual scheduleSettings
  const [fields, setFields] = useState(
    mockFields.map((field) => ({
      ...field,
      scheduleSettings: {
        enabled: false,
        startTime: "21:00",
        endTime: "23:00",
      },
    }))
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Keep the global schedule settings
  const [scheduleSettings, setScheduleSettings] = useState({
    startTime: "21:00", // 9 PM
    endTime: "23:00", // 11 PM
    enabled: false,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Check if current time is within individual field's scheduled watering window
  const isWithinFieldSchedule = (field) => {
    if (!field.scheduleSettings?.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = field.scheduleSettings.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = field.scheduleSettings.endTime
      .split(":")
      .map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    // Handle schedule that crosses midnight
    if (startTimeInMinutes > endTimeInMinutes) {
      return (
        currentTimeInMinutes >= startTimeInMinutes ||
        currentTimeInMinutes <= endTimeInMinutes
      );
    } else {
      return (
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes <= endTimeInMinutes
      );
    }
  };

  // Check if current time is within global scheduled watering window
  const isWithinSchedule = () => {
    if (!scheduleSettings.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = scheduleSettings.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = scheduleSettings.endTime
      .split(":")
      .map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    // Handle schedule that crosses midnight
    if (startTimeInMinutes > endTimeInMinutes) {
      return (
        currentTimeInMinutes >= startTimeInMinutes ||
        currentTimeInMinutes <= endTimeInMinutes
      );
    } else {
      return (
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes <= endTimeInMinutes
      );
    }
  };

  // Auto-manage pump status based on both individual and global schedules
  useEffect(() => {
    setFields((prev) =>
      prev.map((field) => {
        // Individual field schedule takes priority
        if (field.scheduleSettings?.enabled) {
          const shouldPumpBeOn = isWithinFieldSchedule(field);
          return {
            ...field,
            pumpStatus: shouldPumpBeOn ? "on" : "auto",
          };
        }
        // Fall back to global schedule if no individual schedule
        else if (scheduleSettings.enabled) {
          const shouldPumpBeOn = isWithinSchedule();
          return {
            ...field,
            pumpStatus: shouldPumpBeOn ? "on" : "auto",
            scheduledWatering: scheduleSettings.enabled,
          };
        }
        return field;
      })
    );
  }, [currentTime, scheduleSettings]);

  const handlePumpToggle = (fieldId, status) => {
    const field = fields.find((f) => f.id === fieldId);

    // Don't allow manual control when field has individual schedule active
    if (field?.scheduleSettings?.enabled && isWithinFieldSchedule(field)) {
      alert(
        "Cannot manually control pump during this field's scheduled watering time"
      );
      return;
    }

    // Don't allow manual control when global schedule is active (for fields without individual schedules)
    if (
      !field?.scheduleSettings?.enabled &&
      scheduleSettings.enabled &&
      isWithinSchedule()
    ) {
      alert(
        "Cannot manually control pumps during global scheduled watering time"
      );
      return;
    }

    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, pumpStatus: status } : field
      )
    );
  };

  const handleFieldScheduleUpdate = (fieldId, fieldScheduleSettings) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId
          ? { ...field, scheduleSettings: fieldScheduleSettings }
          : field
      )
    );
  };

  const handleAddField = (newFieldData) => {
    const newField = {
      ...newFieldData,
      id: Date.now().toString(),
      scheduleSettings: {
        enabled: false,
        startTime: "21:00",
        endTime: "23:00",
      },
      scheduledWatering: scheduleSettings.enabled,
    };
    setFields((prev) => [...prev, newField]);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();

    // Validate time range
    const [startHour, startMinute] = scheduleSettings.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = scheduleSettings.endTime
      .split(":")
      .map(Number);

    if (startHour === endHour && startMinute === endMinute) {
      alert("Start and end times cannot be the same");
      return;
    }

    setScheduleSettings((prev) => ({ ...prev, enabled: true }));
  };

  const handleCancelSchedule = () => {
    setScheduleSettings((prev) => ({ ...prev, enabled: false }));
    // Reset pumps that don't have individual schedules to auto mode
    setFields((prev) =>
      prev.map((field) => ({
        ...field,
        pumpStatus: field.scheduleSettings?.enabled ? field.pumpStatus : "auto",
        scheduledWatering: false,
      }))
    );
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(":");
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour =
      hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  // Stats calculations
  const totalFields = fields.length;
  const activePumps = fields.filter((f) => f.pumpStatus === "on").length;
  const fieldsWithIndividualSchedules = fields.filter(
    (f) => f.scheduleSettings?.enabled
  ).length;
  const fieldsOnGlobalSchedule = fields.filter(
    (f) => !f.scheduleSettings?.enabled && scheduleSettings.enabled
  ).length;
  const averageMoisture =
    fields.length > 0
      ? Math.round(
          fields.reduce((sum, f) => sum + f.soilMoisture, 0) / fields.length
        )
      : 0;
  const needsAttention = fields.filter(
    (f) => f.soilMoisture < 35 || f.health === "poor"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Irrigation Dashboard
            </h2>
            <p className="text-gray-600">
              Manage your smart irrigation system and monitor field conditions
              in real-time
            </p>

            {/* Global Schedule Status */}
            {scheduleSettings.enabled && (
              <div className="mt-2 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span
                  className={`text-sm font-medium ${
                    isWithinSchedule() ? "text-green-600" : "text-blue-600"
                  }`}
                >
                  {isWithinSchedule()
                    ? "🔄 Global auto-watering active"
                    : `⏰ Global schedule: ${formatTime(
                        scheduleSettings.startTime
                      )} - ${formatTime(scheduleSettings.endTime)}`}
                </span>
                <span className="text-xs text-gray-500">
                  ({fieldsOnGlobalSchedule} fields affected)
                </span>
              </div>
            )}

            {/* Individual Schedules Status */}
            {fieldsWithIndividualSchedules > 0 && (
              <div className="mt-1 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-medium text-indigo-600">
                  📅 {fieldsWithIndividualSchedules} field
                  {fieldsWithIndividualSchedules > 1 ? "s" : ""} with individual
                  schedules
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center space-x-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Field</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Fields</p>
              <p className="text-2xl font-bold text-gray-900">{totalFields}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Pumps</p>
              <p
                className={`text-2xl font-bold ${
                  isWithinSchedule() ? "text-green-600" : "text-blue-600"
                }`}
              >
                {activePumps}
              </p>
              {(scheduleSettings.enabled ||
                fieldsWithIndividualSchedules > 0) && (
                <p className="text-xs text-gray-500 mt-1">
                  {scheduleSettings.enabled && isWithinSchedule()
                    ? "Global ON"
                    : scheduleSettings.enabled
                    ? "Global OFF"
                    : ""}
                  {fieldsWithIndividualSchedules > 0 &&
                    " | Individual schedules active"}
                </p>
              )}
            </div>
            <Zap
              className={`h-8 w-8 ${
                isWithinSchedule() ? "text-green-500" : "text-blue-500"
              }`}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Moisture</p>
              <p className="text-2xl font-bold text-green-600">
                {averageMoisture}%
              </p>
            </div>
            <Droplets className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Needs Attention</p>
              <p className="text-2xl font-bold text-red-600">
                {needsAttention}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Fields Grid */}
        <div className="lg:col-span-3">
          {fields.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Fields Added Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start by adding your first field to begin monitoring and
                managing your irrigation system.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Add Your First Field
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  onPumpToggle={handlePumpToggle}
                  onScheduleUpdate={handleFieldScheduleUpdate}
                  isScheduleActive={isWithinFieldSchedule(field)}
                  globalScheduleActive={
                    !field.scheduleSettings?.enabled &&
                    scheduleSettings.enabled &&
                    isWithinSchedule()
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <WeatherWidget />

          {/* Global Auto Schedule Section */}
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span>Global Auto Schedule</span>
            </h3>

            {!scheduleSettings.enabled ? (
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={scheduleSettings.startTime}
                    onChange={(e) =>
                      setScheduleSettings((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={scheduleSettings.endTime}
                    onChange={(e) =>
                      setScheduleSettings((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={fields.length === 0}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⏰ Set Global Auto Schedule
                </button>

                <p className="text-xs text-gray-500">
                  Fields without individual schedules will follow this global
                  schedule
                </p>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Global Schedule Active
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    <strong>Time:</strong>{" "}
                    {formatTime(scheduleSettings.startTime)} -{" "}
                    {formatTime(scheduleSettings.endTime)}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Status:</strong>{" "}
                    {isWithinSchedule()
                      ? "Currently watering 🔄"
                      : "Waiting for next cycle ⏳"}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Affects {fieldsOnGlobalSchedule} field
                    {fieldsOnGlobalSchedule !== 1 ? "s" : ""} without individual
                    schedules
                  </p>
                </div>

                <button
                  onClick={handleCancelSchedule}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  🗑️ Cancel Global Schedule
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                disabled={
                  fields.length === 0 ||
                  (scheduleSettings.enabled && isWithinSchedule())
                }
              >
                💧 Water All Low Fields
              </button>
              <button
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={fields.length === 0}
              >
                🤖 Get Field Recommendations
              </button>
              <button
                className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                disabled={fields.length === 0}
              >
                📊 Generate Report
              </button>
            </div>

            {scheduleSettings.enabled && isWithinSchedule() && (
              <p className="text-xs text-gray-500 mt-2">
                Global schedule controls disabled during auto-watering
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Field Modal */}
      <AddFieldModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddField={handleAddField}
      />
    </div>
  );
}
