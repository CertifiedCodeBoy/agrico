import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import { notificationService } from "../services/notificationService";

export function useWateringLogs() {
  const [wateringLogs, setWateringLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transform backend watering log to frontend format
  const transformWateringLog = (backendLog) => ({
    id: backendLog.id.toString(),
    fieldId: backendLog.field_id.toString(),
    startTime: new Date(backendLog.start_time),
    endTime: new Date(backendLog.end_time),
    method: backendLog.method,
    duration: calculateDuration(backendLog.start_time, backendLog.end_time),
    createdAt: new Date(backendLog.created_at),
    updatedAt: new Date(backendLog.updated_at),
  });

  // Calculate duration in minutes
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / (1000 * 60)); // Convert to minutes
  };

  // Transform frontend data to backend format - FIXED with correct method values
  const transformToBackend = (frontendLog) => ({
    field_id: parseInt(frontendLog.fieldId),
    start_time: frontendLog.startTime.toISOString(),
    end_time: frontendLog.endTime.toISOString(),
    method: getValidMethod(frontendLog.method || frontendLog.operationType),
  });

  // Helper function to ensure we use valid backend method values
  const getValidMethod = (inputMethod) => {
    const validMethods = ["SPRINKLER", "DRIP", "FLOOD"];

    // Map common frontend method names to backend values
    const methodMap = {
      manual: "SPRINKLER",
      auto: "DRIP",
      scheduled: "SPRINKLER",
      sprinkler: "SPRINKLER",
      drip: "DRIP",
      flood: "FLOOD",
    };

    if (typeof inputMethod === "string") {
      const normalized = inputMethod.toLowerCase();
      if (methodMap[normalized]) {
        return methodMap[normalized];
      }
      if (validMethods.includes(inputMethod.toUpperCase())) {
        return inputMethod.toUpperCase();
      }
    }

    return "SPRINKLER"; // Default fallback
  };

  // Create a new watering log - FIXED
  const createWateringLog = async (wateringData) => {
    try {
      setLoading(true);
      setError(null);

      const backendData = transformToBackend(wateringData);
      console.log("Creating watering log with corrected method:", backendData);

      const createdLog = await apiService.createWateringLog(backendData);
      const transformedLog = transformWateringLog(createdLog);

      setWateringLogs((prev) => [transformedLog, ...prev]);

      // Trigger notification
      notificationService.addNotification({
        type: "success",
        title: "Watering Completed",
        message: `Field watering completed successfully. Duration: ${transformedLog.duration} minutes. Method: ${transformedLog.method}`,
        fieldId: wateringData.fieldId,
      });

      return transformedLog;
    } catch (err) {
      setError(err.message);
      console.error("Failed to create watering log:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get watering logs for a specific field
  const getFieldWateringLogs = async (fieldId) => {
    try {
      setLoading(true);
      setError(null);

      const backendLogs = await apiService.getFieldWateringLogs(fieldId);
      const transformedLogs = backendLogs.map(transformWateringLog);

      return transformedLogs;
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch field watering logs:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Schedule watering (creates a watering log with future times) - FIXED
  const scheduleWatering = async (fieldId, scheduleSettings) => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Parse schedule times
      const [startHour, startMinute] = scheduleSettings.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = scheduleSettings.endTime
        .split(":")
        .map(Number);

      // Create start and end times for today (or tomorrow if time has passed)
      let startTime = new Date(today);
      startTime.setHours(startHour, startMinute, 0, 0);

      let endTime = new Date(today);
      endTime.setHours(endHour, endMinute, 0, 0);

      // If start time has passed today, schedule for tomorrow
      if (startTime <= now) {
        startTime.setDate(startTime.getDate() + 1);
        endTime.setDate(endTime.getDate() + 1);
      }

      // If end time is before start time, it's the next day
      if (endTime <= startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      const wateringData = {
        fieldId: fieldId,
        startTime: startTime,
        endTime: endTime,
        method: "SPRINKLER", // Use valid backend method
        operationType: "scheduled", // Keep for internal tracking
      };

      const createdLog = await createWateringLog(wateringData);

      notificationService.addNotification({
        type: "info",
        title: "Watering Scheduled",
        message: `Automatic watering scheduled from ${scheduleSettings.startTime} to ${scheduleSettings.endTime} using sprinkler system.`,
        fieldId: fieldId,
      });

      return createdLog;
    } catch (err) {
      console.error("Failed to schedule watering:", err);
      throw err;
    }
  };

  // Start manual watering - FIXED
  const startManualWatering = async (fieldId, duration = 30) => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const wateringData = {
      fieldId: fieldId,
      startTime: startTime,
      endTime: endTime,
      method: "SPRINKLER", // Use valid backend method
      operationType: "manual", // Keep for internal tracking
    };

    return await createWateringLog(wateringData);
  };

  // Auto watering based on AI recommendation - FIXED
  const startAutoWatering = async (fieldId, duration = 30) => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const wateringData = {
      fieldId: fieldId,
      startTime: startTime,
      endTime: endTime,
      method: "DRIP", // Use DRIP for auto mode (more water-efficient)
      operationType: "auto", // Keep for internal tracking
    };

    return await createWateringLog(wateringData);
  };

  // Advanced method - allows choosing specific irrigation method
  const createCustomWateringLog = async (
    fieldId,
    duration,
    irrigationMethod
  ) => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const wateringData = {
      fieldId: fieldId,
      startTime: startTime,
      endTime: endTime,
      method: getValidMethod(irrigationMethod),
    };

    return await createWateringLog(wateringData);
  };

  return {
    wateringLogs,
    loading,
    error,
    createWateringLog,
    getFieldWateringLogs,
    scheduleWatering,
    startManualWatering,
    startAutoWatering,
    createCustomWateringLog,
  };
}
