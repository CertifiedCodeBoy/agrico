// Create a new file: src/services/apiService.js
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    this.apiURL = `${this.baseURL}/api`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.apiURL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making ${config.method || "GET"} request to:`, url);
      if (config.body) {
        console.log("Request body:", config.body);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        // Get the error details from Laravel
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorData = await response.json();
          console.error("Full API Error Response:", errorData);

          // Laravel validation errors format
          if (errorData.errors) {
            const validationErrors = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
              .join("; ");
            errorMessage = `Validation Error: ${validationErrors}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
        }

        throw new Error(errorMessage);
      }

      // Handle 204 No Content response (for delete operations)
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      console.log("API Response:", data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Fields API methods
  async getFields() {
    return this.request("/fields");
  }

  async getField(fieldId) {
    return this.request(`/fields/${fieldId}`);
  }

  async createField(fieldData) {
    return this.request("/fields", {
      method: "POST",
      body: JSON.stringify(fieldData),
    });
  }

  async updateField(fieldId, fieldData) {
    return this.request(`/fields/${fieldId}`, {
      method: "PUT",
      body: JSON.stringify(fieldData),
    });
  }

  async deleteField(fieldId) {
    return this.request(`/fields/${fieldId}`, {
      method: "DELETE",
    });
  }

  // Enhanced valve control with proper state management
  async setValveState(fieldId, valveState) {
    // Ensure valve state matches API expectations: "On", "Off", "Auto"
    const validValveStates = ["On", "Off", "Auto"];
    const normalizedState = typeof valveState === "string" ? valveState : "Off";

    if (!validValveStates.includes(normalizedState)) {
      console.warn(`Invalid valve state: ${valveState}, defaulting to 'Off'`);
    }

    const finalState = validValveStates.includes(normalizedState)
      ? normalizedState
      : "Off";

    console.log(`Setting valve state for field ${fieldId} to: ${finalState}`);

    return this.request(`/fields/${fieldId}`, {
      method: "PUT",
      body: JSON.stringify({
        valve_state: finalState,
      }),
    });
  }

  // Convenience methods for specific valve operations
  async turnValveOn(fieldId) {
    return this.setValveState(fieldId, "On");
  }

  async turnValveOff(fieldId) {
    return this.setValveState(fieldId, "Off");
  }

  async setValveAuto(fieldId) {
    return this.setValveState(fieldId, "Auto");
  }

  // Watering Logs API methods - FIXED with correct method values
  async createWateringLog(wateringLogData) {
    return this.request("/watering-logs", {
      method: "POST",
      body: JSON.stringify(wateringLogData),
    });
  }

  async getWateringLogs(fieldId = null) {
    const endpoint = fieldId
      ? `/watering-logs?field_id=${fieldId}`
      : "/watering-logs";
    return this.request(endpoint);
  }

  async getFieldWateringLogs(fieldId) {
    return this.request(`/watering-logs?field_id=${fieldId}`);
  }

  // Helper function to get the correct irrigation method based on operation type
  getIrrigationMethod(operationType = "manual") {
    // Map operation types to backend method values
    const methodMap = {
      manual: "SPRINKLER", // Manual watering uses sprinkler
      auto: "DRIP", // Auto watering uses drip irrigation (more efficient)
      scheduled: "SPRINKLER", // Scheduled watering uses sprinkler
      flood: "FLOOD", // Flood irrigation (optional)
    };

    return methodMap[operationType.toLowerCase()] || "SPRINKLER";
  }

  // Schedule-specific watering log creation - FIXED
  async createScheduledWateringLog(
    fieldId,
    startTime,
    endTime,
    operationType = "scheduled"
  ) {
    const wateringData = {
      field_id: parseInt(fieldId),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      method: this.getIrrigationMethod(operationType), // Now uses SPRINKLER, DRIP, or FLOOD
    };

    console.log("Creating scheduled watering log:", wateringData);
    return this.createWateringLog(wateringData);
  }

  // Manual watering log creation - FIXED
  async createManualWateringLog(
    fieldId,
    duration = 30,
    operationType = "manual"
  ) {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const wateringData = {
      field_id: parseInt(fieldId),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      method: this.getIrrigationMethod(operationType), // Now uses SPRINKLER, DRIP, or FLOOD
    };

    console.log("Creating manual watering log:", wateringData);
    return this.createWateringLog(wateringData);
  }

  // Auto watering log creation - FIXED
  async createAutoWateringLog(fieldId, duration = 30, operationType = "auto") {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const wateringData = {
      field_id: parseInt(fieldId),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      method: this.getIrrigationMethod(operationType), // Now uses DRIP for auto mode (more efficient)
    };

    console.log("Creating auto watering log:", wateringData);
    return this.createWateringLog(wateringData);
  }

  // Advanced watering method - allows specifying exact irrigation method
  async createWateringLogWithMethod(fieldId, duration, method) {
    const validMethods = ["SPRINKLER", "DRIP", "FLOOD"];
    const finalMethod = validMethods.includes(method) ? method : "SPRINKLER";

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const wateringData = {
      field_id: parseInt(fieldId),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      method: finalMethod,
    };

    console.log("Creating watering log with specific method:", wateringData);
    return this.createWateringLog(wateringData);
  }
}

export const apiService = new ApiService();
