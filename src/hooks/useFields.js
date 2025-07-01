// Create a new file: src/hooks/useFields.js
import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import { notificationService } from "../services/notificationService";

export function useFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper functions for valve state conversion
  const convertValveStateToPumpStatus = (valveState) => {
    if (typeof valveState === "string") {
      const normalizedState = valveState.toLowerCase();
      switch (normalizedState) {
        case "on":
          return "on";
        case "auto":
          return "auto";
        case "off":
        default:
          return "off";
      }
    }
    // Fallback for boolean values (legacy support)
    return valveState ? "on" : "off";
  };

  const convertPumpStatusToValveState = (pumpStatus) => {
    switch (pumpStatus) {
      case "on":
        return "On";
      case "auto":
        return "Auto";
      case "off":
      default:
        return "Off";
    }
  };

  // Transform backend field data to frontend format
  const transformField = (backendField) => ({
    id: backendField.id.toString(),
    name: backendField.name,
    cropType: backendField.crop_name || backendField.crop?.name || "Unknown",
    area: backendField.surface,
    soilMoisture: backendField.moisture,
    temperature: backendField.temperature,
    health: backendField.condition,
    pumpStatus: convertValveStateToPumpStatus(backendField.valve_state),
    lastWatered:
      backendField.water_logs?.length > 0
        ? new Date(backendField.water_logs[0].end_time)
        : new Date(backendField.updated_at),
    recommendedWater: backendField.crop?.watering_frequency || 2.5,
    scheduleSettings: {
      enabled: false,
      startTime: "21:00",
      endTime: "23:00",
    },
    // Additional backend data
    cropId: backendField.crop_id,
    valveState: backendField.valve_state,
    waterLogs: backendField.water_logs || [],
    createdAt: backendField.created_at,
    updatedAt: backendField.updated_at,
    crop: backendField.crop,
  });

  // Transform frontend field data to backend format for CREATE
  const transformToBackendCreate = (frontendField) => {
    const backendData = {
      name: frontendField.name?.trim(),
      surface: Number(frontendField.area),
      crop: frontendField.cropType?.trim(),
      condition: frontendField.health || "good",
      valve_state: convertPumpStatusToValveState(
        frontendField.pumpStatus || "off"
      ),
    };

    // Remove any undefined/null values
    Object.keys(backendData).forEach((key) => {
      if (
        backendData[key] === undefined ||
        backendData[key] === null ||
        backendData[key] === ""
      ) {
        delete backendData[key];
      }
    });

    console.log("Transforming frontend field to backend format:", {
      frontend: frontendField,
      backend: backendData,
    });

    return backendData;
  };

  // Transform frontend field data to backend format for UPDATE
  const transformToBackendUpdate = (frontendField) => ({
    name: frontendField.name,
    surface: parseFloat(frontendField.area),
    crop: frontendField.cropType,
    condition: frontendField.health || "good",
    valve_state: convertPumpStatusToValveState(
      frontendField.pumpStatus || "off"
    ),
  });

  // Fetch fields from backend
  const fetchFields = async () => {
    try {
      setLoading(true);
      setError(null);

      const backendFields = await apiService.getFields();
      const transformedFields = backendFields.map(transformField);

      setFields(transformedFields);

      // Check for critical conditions and trigger notifications
      transformedFields.forEach((field) => {
        if (field.soilMoisture < 30) {
          notificationService.addCriticalWaterAlert(
            field.name,
            field.soilMoisture
          );
        }
        if (field.health === "poor") {
          notificationService.addNotification({
            type: "warning",
            title: "Field Health Alert",
            message: `${field.name} requires attention. Current condition: ${field.health}`,
            fieldId: field.id,
          });
        }
      });
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch fields:", err);

      // Fallback to mock data in development
      if (import.meta.env.VITE_DEBUG_MODE === "true") {
        const { mockFields } = await import("../data/mockData.js");
        setFields(
          mockFields.map((field) => ({
            ...field,
            scheduleSettings: {
              enabled: false,
              startTime: "21:00",
              endTime: "23:00",
            },
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new field
  const addField = async (fieldData) => {
    try {
      console.log("Original field data:", fieldData);

      const backendData = transformToBackendCreate(fieldData);
      console.log("Transformed backend data:", backendData);

      const createdField = await apiService.createField(backendData);
      console.log("Created field response:", createdField);

      const transformedField = transformField(createdField);

      setFields((prev) => [...prev, transformedField]);

      notificationService.addNotification({
        type: "success",
        title: "Field Added",
        message: `${transformedField.name} has been successfully added to your irrigation system.`,
        fieldId: transformedField.id,
      });

      return transformedField;
    } catch (err) {
      console.error("Add field error details:", err);
      setError(err.message);
      throw err;
    }
  };

  // Update field
  const updateField = async (fieldId, updates) => {
    try {
      const backendData = transformToBackendUpdate(updates);
      const updatedField = await apiService.updateField(fieldId, backendData);
      const transformedField = transformField(updatedField);

      setFields((prev) =>
        prev.map((field) => (field.id === fieldId ? transformedField : field))
      );

      return transformedField;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Enhanced valve control with proper state management and watering logs
  const setValveState = async (fieldId, targetState) => {
    try {
      const field = fields.find((f) => f.id === fieldId);
      if (!field) {
        throw new Error(`Field with ID ${fieldId} not found`);
      }

      console.log(`Setting valve state for ${field.name} to: ${targetState}`);

      // Convert to backend format
      const valveStateString = convertPumpStatusToValveState(targetState);

      // Update valve state via API
      const updatedField = await apiService.setValveState(
        fieldId,
        valveStateString
      );
      const transformedField = transformField(updatedField);

      // Handle watering log creation and notifications based on state
      switch (targetState) {
        case "on":
          // Create manual watering log
          await apiService.createManualWateringLog(fieldId, 30, "MANUAL");

          // Update UI immediately
          setFields((prev) =>
            prev.map((f) =>
              f.id === fieldId
                ? {
                    ...transformedField,
                    lastWatered: new Date(),
                  }
                : f
            )
          );

          notificationService.addNotification({
            type: "info",
            title: "Manual Irrigation Started",
            message: `💧 Manual watering activated for ${field.name}. Expected duration: 30 minutes. Watering log created.`,
            fieldId: fieldId,
          });
          break;

        case "auto":
          // Create auto watering log
          await apiService.createAutoWateringLog(fieldId, 30, "AUTO");

          // Update UI immediately
          setFields((prev) =>
            prev.map((f) =>
              f.id === fieldId
                ? {
                    ...transformedField,
                    lastWatered: new Date(),
                  }
                : f
            )
          );

          notificationService.addNotification({
            type: "success",
            title: "Auto Mode Enabled",
            message: `🤖 ${field.name} switched to AI-assisted irrigation mode. Smart watering will be managed automatically. Watering log created.`,
            fieldId: fieldId,
          });
          break;

        case "off":
          // Just update the field state - no watering log needed for turning off
          setFields((prev) =>
            prev.map((f) => (f.id === fieldId ? transformedField : f))
          );

          notificationService.addNotification({
            type: "info",
            title: "Irrigation Stopped",
            message: `⏹️ Watering stopped for ${field.name}. Valve is now closed.`,
            fieldId: fieldId,
          });
          break;

        default:
          throw new Error(`Invalid valve state: ${targetState}`);
      }

      return transformedField;
    } catch (err) {
      console.error("Failed to set valve state:", err);
      setError(err.message);
      throw err;
    }
  };

  // Convenience methods for valve control
  const turnPumpOn = async (fieldId) => {
    return await setValveState(fieldId, "on");
  };

  const turnPumpOff = async (fieldId) => {
    return await setValveState(fieldId, "off");
  };

  const setAutoMode = async (fieldId) => {
    return await setValveState(fieldId, "auto");
  };

  // Legacy method for backward compatibility
  const togglePump = async (fieldId, status) => {
    return await setValveState(fieldId, status);
  };

  // Enhanced schedule management with watering logs
  const updateFieldSchedule = async (fieldId, scheduleSettings) => {
    try {
      const field = fields.find((f) => f.id === fieldId);
      if (!field) {
        throw new Error(`Field with ID ${fieldId} not found`);
      }

      // Update local state first
      setFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, scheduleSettings } : f))
      );

      if (scheduleSettings.enabled) {
        // Calculate schedule times
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        const [startHour, startMinute] = scheduleSettings.startTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = scheduleSettings.endTime
          .split(":")
          .map(Number);

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

        // Create scheduled watering log
        await apiService.createScheduledWateringLog(
          fieldId,
          startTime,
          endTime,
          "SCHEDULED"
        );

        // Set valve to auto mode for scheduled operation
        await apiService.setValveAuto(fieldId);

        notificationService.addNotification({
          type: "success",
          title: "Irrigation Schedule Set",
          message: `⏰ Automatic irrigation scheduled for ${field.name} from ${scheduleSettings.startTime} to ${scheduleSettings.endTime}. Valve set to Auto mode.`,
          fieldId: fieldId,
        });
      } else {
        // When disabling schedule, turn off the valve
        await apiService.turnValveOff(fieldId);

        notificationService.addNotification({
          type: "info",
          title: "Schedule Cancelled",
          message: `❌ Automatic watering schedule cancelled for ${field.name}. Valve turned off.`,
          fieldId: fieldId,
        });
      }

      // Refresh field data to get updated valve state
      await fetchFields();
    } catch (err) {
      console.error("Failed to update field schedule:", err);

      // Revert local state on error
      setFields((prev) =>
        prev.map((f) =>
          f.id === fieldId
            ? {
                ...f,
                scheduleSettings: { ...f.scheduleSettings, enabled: false },
              }
            : f
        )
      );

      notificationService.addNotification({
        type: "error",
        title: "Schedule Error",
        message: `Failed to update irrigation schedule for field. Please try again.`,
        fieldId: fieldId,
      });

      throw err;
    }
  };

  // Delete field
  const deleteField = async (fieldId) => {
    try {
      await apiService.deleteField(fieldId);
      setFields((prev) => prev.filter((field) => field.id !== fieldId));

      notificationService.addNotification({
        type: "info",
        title: "Field Removed",
        message: "Field has been successfully removed from your system.",
        fieldId: null,
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get single field
  const getField = async (fieldId) => {
    try {
      const backendField = await apiService.getField(fieldId);
      return transformField(backendField);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get field watering history
  const getFieldWateringHistory = async (fieldId) => {
    try {
      const wateringLogs = await apiService.getFieldWateringLogs(fieldId);
      return wateringLogs.map((log) => ({
        id: log.id.toString(),
        fieldId: log.field_id.toString(),
        startTime: new Date(log.start_time),
        endTime: new Date(log.end_time),
        method: log.method,
        duration: Math.round(
          (new Date(log.end_time) - new Date(log.start_time)) / (1000 * 60)
        ),
        createdAt: new Date(log.created_at),
        updatedAt: new Date(log.updated_at),
      }));
    } catch (err) {
      console.error("Failed to fetch watering history:", err);
      return [];
    }
  };

  // Initial load
  useEffect(() => {
    fetchFields();
  }, []);

  // Real-time updates (polling every 30 seconds for sensor data)
  useEffect(() => {
    if (fields.length === 0) return;

    const interval = setInterval(() => {
      // Only refresh if not in mock mode
      if (import.meta.env.VITE_MOCK_SENSORS !== "true") {
        fetchFields();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fields.length]);

  return {
    fields,
    loading,
    error,
    fetchFields,
    addField,
    updateField,

    // Valve control methods
    setValveState,
    turnPumpOn,
    turnPumpOff,
    setAutoMode,
    togglePump, // Legacy support

    // Schedule management
    updateFieldSchedule,

    // Other methods
    deleteField,
    getField,
    getFieldWateringHistory,
    refetch: fetchFields,
  };
}
