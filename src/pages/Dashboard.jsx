import React, { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  Droplets,
  Thermometer,
  AlertTriangle,
  TrendingUp,
  Zap,
  CheckCircle,
} from "lucide-react";
import FieldCard from "../components/FieldCard";
import AddFieldModal from "../components/AddFieldModal";
import WeatherWidget from "../components/WeatherWidget";
import { useFields } from "../hooks/useFields";
import { ErrorDisplay } from "../components/ErrorBoundary";

export default function Dashboard() {
  const {
    fields,
    loading,
    error,
    addField,
    togglePump,
    updateFieldSchedule,
    fetchFields,
  } = useFields();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState({
    startTime: "21:00",
    endTime: "23:00",
    enabled: false,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Check if current time is within global schedule
  const isWithinSchedule = () => {
    if (!scheduleSettings.enabled) return false;

    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [startHour, startMinute] = scheduleSettings.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = scheduleSettings.endTime
      .split(":")
      .map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  };

  // Check if current time is within individual field's schedule
  const isWithinFieldSchedule = (field) => {
    if (!field?.scheduleSettings?.enabled) return false;

    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [startHour, startMinute] = field.scheduleSettings.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = field.scheduleSettings.endTime
      .split(":")
      .map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  };

  const handleAddField = async (newFieldData) => {
    try {
      await addField(newFieldData);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add field:", error);
      alert(`Failed to add field: ${error.message}`);
    }
  };

  const handlePumpToggle = async (fieldId, status) => {
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

    try {
      await togglePump(fieldId, status);
    } catch (error) {
      console.error("Failed to toggle pump:", error);
      alert(`Failed to control pump: ${error.message}`);
    }
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
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(":");
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour =
      hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your fields...</p>
          <p className="text-sm text-gray-500 mt-2">
            Connecting to {import.meta.env.VITE_BACKEND_URL}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={fetchFields}
        title="Failed to Load Fields"
      />
    );
  }

  // Statistics calculations
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
  const activeFields = fields.filter(
    (f) => f.pumpStatus === "on" || f.pumpStatus === "auto"
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

            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">
                  {import.meta.env.VITE_MOCK_SENSORS === "true"
                    ? "Demo Mode"
                    : "Live Data"}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Backend: {import.meta.env.VITE_BACKEND_URL}
              </div>
            </div>

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
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Field</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Droplets className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Fields</p>
              <p className="text-lg font-semibold text-gray-900">
                {fields.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Thermometer className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Irrigation</p>
              <p className="text-lg font-semibold text-gray-900">
                {activeFields}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Moisture</p>
              <p className="text-lg font-semibold text-gray-900">
                {averageMoisture}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                needsAttention > 0 ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  needsAttention > 0 ? "text-red-600" : "text-green-600"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Needs Attention</p>
              <p className="text-lg font-semibold text-gray-900">
                {needsAttention}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Fields Grid */}
        <div className="lg:col-span-3">
          {/* Fields Grid */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Fields ({fields.length})
              </h3>
              {fields.length > 0 && (
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              )}
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
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
                    onScheduleUpdate={updateFieldSchedule}
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
        existingFieldsCount={fields.length}
      />
    </div>
  );
}
