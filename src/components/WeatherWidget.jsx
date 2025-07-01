import React, { useState, useEffect } from "react";
import {
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  CloudRain,
  CloudSnow,
  Zap,
  MapPin,
  RefreshCw,
  AlertCircle,
  Leaf,
  Target,
  Satellite,
  Square,
} from "lucide-react";

export default function WeatherWidget({
  latitude = 36.681726,
  longitude = 2.909458,
  fieldName = "Farm Location",
  polygonId = null, // Existing polygon ID
  fieldPolygon = null, // Field boundary coordinates
  area = null, // Field area in hectares
}) {
  const [weather, setWeather] = useState(null);
  const [agriData, setAgriData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fieldPolygonId, setFieldPolygonId] = useState(polygonId);
  const [satelliteData, setSatelliteData] = useState(null);

  const API_KEY = "af57fd5e1dd3a11a24d23cd6e4df50d4";
  const AGRO_BASE_URL = "https://api.agromonitoring.com/agro/1.0";

  // Create polygon for field if coordinates provided
  const createFieldPolygon = async (coordinates, name) => {
    try {
      const polygonPayload = {
        name: name,
        geo_json: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              30.0444, // Example coordinates
              31.2357, // Replace with actual field coordinates
              40.7128, // Example coordinates
              -74.006, // Replace with actual field coordinates
            ], // Array of [lng, lat] coordinates
          },
        },
      };

      const response = await fetch(
        `${AGRO_BASE_URL}/polygons?appid=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(polygonPayload),
        }
      );

      if (response.ok) {
        const polygonData = await response.json();
        console.log("Polygon created successfully:", polygonData);
        return polygonData.id;
      }
      return null;
    } catch (error) {
      console.error("Error creating polygon:", error);
      return null;
    }
  };

  // Get agricultural weather data using Agromonitoring API
  const getAgriWeatherData = async (polygonId = null) => {
    try {
      let weatherUrl, soilUrl, ndviUrl;

      if (polygonId) {
        // Polygon-based requests
        weatherUrl = `${AGRO_BASE_URL}/weather?polyid=${polygonId}&appid=${API_KEY}`;
        soilUrl = `${AGRO_BASE_URL}/soil?polyid=${polygonId}&appid=${API_KEY}`;

        // Get satellite imagery data (NDVI, EVI)
        const start = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60; // Last 7 days
        const end = Math.floor(Date.now() / 1000);
        ndviUrl = `${AGRO_BASE_URL}/image/search?start=${start}&end=${end}&polyid=${polygonId}&appid=${API_KEY}`;
      } else {
        // Point-based requests
        weatherUrl = `${AGRO_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
        soilUrl = `${AGRO_BASE_URL}/soil?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
      }

      // Fetch all data
      const [weatherResponse, soilResponse, ndviResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(soilUrl),
        polygonId ? fetch(ndviUrl) : Promise.resolve({ ok: false }),
      ]);

      let weatherData = null;
      let soilData = null;
      let satelliteImages = null;

      if (weatherResponse.ok) {
        weatherData = await weatherResponse.json();
      }

      if (soilResponse.ok) {
        soilData = await soilResponse.json();
      }

      if (ndviResponse.ok) {
        satelliteImages = await ndviResponse.json();
      }

      return { weatherData, soilData, satelliteImages };
    } catch (error) {
      console.error("Error fetching agromonitoring data:", error);
      return null;
    }
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      let currentPolygonId = fieldPolygonId;

      // Create polygon if we have field coordinates but no polygon ID
      if (
        fieldPolygon &&
        !currentPolygonId &&
        Array.isArray(fieldPolygon) &&
        fieldPolygon.length > 0
      ) {
        currentPolygonId = await createFieldPolygon(fieldPolygon, fieldName);
        if (currentPolygonId) {
          setFieldPolygonId(currentPolygonId);
        }
      }

      // Get agricultural data from Agromonitoring API
      const agriResponse = await getAgriWeatherData(currentPolygonId);

      if (!agriResponse || !agriResponse.weatherData) {
        throw new Error("No agricultural weather data available");
      }

      const { weatherData, soilData, satelliteImages } = agriResponse;

      // Process weather data from Agromonitoring API
      const combinedWeatherData = {
        // Weather data from Agromonitoring
        temperature: weatherData.main
          ? Math.round(weatherData.main.temp - 273.15)
          : 25, // Convert Kelvin to Celsius
        humidity: weatherData.main ? weatherData.main.humidity : 65,
        windSpeed: weatherData.wind
          ? Math.round(weatherData.wind.speed * 3.6)
          : 12, // Convert m/s to km/h
        condition: weatherData.weather?.[0]?.main || "Clear",
        description: weatherData.weather?.[0]?.description || "clear sky",
        icon: weatherData.weather?.[0]?.icon || "01d",
        pressure: weatherData.main ? weatherData.main.pressure : 1013,
        rainfall: weatherData.rain ? `${weatherData.rain || 0}mm` : "0mm",
        clouds: weatherData.clouds ? weatherData.clouds.all : 0,

        // Basic location info (estimated from coordinates)
        location: "Agricultural Area",
        country: "XX",
        feels_like: weatherData.main
          ? Math.round(weatherData.main.feels_like - 273.15)
          : 27,

        // Calculate sunrise/sunset (basic estimation)
        sunrise: "06:30",
        sunset: "18:45",

        // Agricultural soil data
        soilTemp: soilData?.t10 ? Math.round(soilData.t10 - 273.15) : null,
        soilMoisture: soilData?.moisture
          ? Math.round(soilData.moisture * 100)
          : null,
        soilTemp0: soilData?.t0 ? Math.round(soilData.t0 - 273.15) : null, // Surface temperature

        // Agricultural weather data
        solarRadiation: weatherData.clouds
          ? Math.round((100 - weatherData.clouds.all) * 0.8)
          : null,
        evapotranspiration: calculateEvapotranspiration(weatherData, soilData),

        // Field metadata
        fieldArea: area,
        polygonId: currentPolygonId,
        hasPolygonData: !!currentPolygonId,

        coordinates: {
          lat: latitude.toFixed(4),
          lon: longitude.toFixed(4),
        },
      };

      setWeather(combinedWeatherData);

      // Process satellite data for vegetation health
      if (satelliteImages?.length > 0) {
        const latestImage = satelliteImages[0];
        setSatelliteData({
          ndvi: latestImage.stats?.ndvi || null,
          evi: latestImage.stats?.evi || null,
          date: new Date(latestImage.dt * 1000).toLocaleDateString(),
          cloudCover: latestImage.cl || null,
        });
      }

      // Enhanced agricultural advice
      setAgriData({
        soilHealth: generateEnhancedSoilAdvice(
          combinedWeatherData,
          satelliteData
        ),
        irrigationAdvice: generatePolygonIrrigationAdvice(
          combinedWeatherData,
          area
        ),
        cropConditions: generateVegetationAdvice(satelliteData),
        fieldCoverage: currentPolygonId
          ? "Full field monitoring active"
          : "Point-based monitoring",
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Agromonitoring fetch error:", err);
      setError(err.message);

      // Enhanced fallback with agricultural estimates
      setWeather({
        temperature: 25,
        humidity: 65,
        windSpeed: 12,
        condition: "Clear",
        description: "clear sky",
        icon: "01d",
        pressure: 1013,
        rainfall: "0mm",
        location: "Agricultural Area",
        country: "XX",
        feels_like: 27,
        sunrise: "06:30",
        sunset: "18:45",
        soilTemp: 22,
        soilMoisture: 45,
        solarRadiation: 75,
        evapotranspiration: 4,
        fieldArea: area,
        polygonId: null,
        hasPolygonData: false,
        coordinates: {
          lat: latitude.toFixed(4),
          lon: longitude.toFixed(4),
        },
      });

      setAgriData({
        soilHealth: "Limited monitoring - check API connection",
        irrigationAdvice: "Weather data limited - manual monitoring advised",
        cropConditions: "Satellite data unavailable",
        fieldCoverage: "Offline mode",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate evapotranspiration estimate
  const calculateEvapotranspiration = (weatherData, soilData) => {
    if (!weatherData || !weatherData.main) return null;

    const temp = weatherData.main.temp - 273.15; // Convert to Celsius
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind?.speed || 2;

    // Simple Penman estimation (simplified)
    const et = Math.round(temp * 0.1 + windSpeed * 0.2 - humidity * 0.02 + 2);
    return Math.max(0, Math.min(10, et)); // Clamp between 0-10 mm
  };

  const generateEnhancedSoilAdvice = (data, satellite) => {
    if (!data.soilTemp && !data.soilMoisture && !satellite) {
      return "🌱 Agricultural monitoring from Agromonitoring API";
    }

    let advice = "";

    if (data.soilMoisture) {
      if (data.soilMoisture < 30) {
        advice = "🔴 Critical: Low soil moisture detected";
      } else if (data.soilMoisture < 50) {
        advice = "🟡 Moderate soil moisture - monitor closely";
      } else if (data.soilMoisture > 80) {
        advice = "🔵 High moisture - risk of waterlogging";
      } else {
        advice = "🟢 Optimal soil moisture levels";
      }
    }

    if (satellite?.ndvi) {
      const ndviValue = satellite.ndvi;
      if (ndviValue < 0.3) {
        advice += " • ⚠️ Poor vegetation detected";
      } else if (ndviValue > 0.7) {
        advice += " • 🌱 Excellent crop health";
      }
    }

    if (data.soilTemp) {
      if (data.soilTemp < 10) {
        advice += " • ❄️ Cool soil conditions";
      } else if (data.soilTemp > 30) {
        advice += " • 🔥 Warm soil detected";
      }
    }

    return advice || "📊 Agricultural monitoring active";
  };

  const generatePolygonIrrigationAdvice = (data, fieldArea) => {
    let advice = "";

    if (data.condition.includes("Rain")) {
      const waterSaved = fieldArea ? Math.round(fieldArea * 25) : 100; // Estimate L per hectare
      advice = `🌧️ Rain conditions - Pause irrigation (Save ~${waterSaved}L)`;
    } else if (data.hasPolygonData && data.soilMoisture > 75) {
      advice = "💧 Field well-watered - Skip next cycle";
    } else if (data.temperature > 35 && data.humidity < 40) {
      const extraWater = fieldArea ? Math.round(fieldArea * 50) : 200;
      advice = `🔥 Hot & dry - Increase irrigation (~${extraWater}L extra)`;
    } else if (data.evapotranspiration && data.evapotranspiration > 6) {
      advice = "💨 High evaporation - Evening watering preferred";
    } else if (data.soilTemp && data.soilTemp < 10) {
      advice = "❄️ Cool soil - Reduce irrigation frequency";
    } else {
      advice = "✅ Standard irrigation schedule recommended";
    }

    return advice;
  };

  const generateVegetationAdvice = (satellite) => {
    if (!satellite) {
      return "🛰️ Satellite monitoring ready for polygon fields";
    }

    if (satellite.ndvi < 0.3) {
      return "🚨 Poor vegetation health - investigate immediately";
    } else if (satellite.ndvi < 0.5) {
      return "⚠️ Moderate vegetation - monitor development";
    } else if (satellite.ndvi > 0.7) {
      return "🌱 Excellent vegetation - optimal conditions";
    } else {
      return "📈 Good vegetation growth detected";
    }
  };

  const getWeatherIcon = (condition) => {
    const iconMap = {
      Clear: <Sun className="h-6 w-6 text-yellow-300" />,
      Clouds: <Cloud className="h-6 w-6 text-gray-300" />,
      Rain: <CloudRain className="h-6 w-6 text-blue-300" />,
      Drizzle: <CloudRain className="h-6 w-6 text-blue-300" />,
      Thunderstorm: <Zap className="h-6 w-6 text-yellow-400" />,
      Snow: <CloudSnow className="h-6 w-6 text-white" />,
      Mist: <Cloud className="h-6 w-6 text-gray-400" />,
      Fog: <Cloud className="h-6 w-6 text-gray-400" />,
    };

    return iconMap[condition] || <Cloud className="h-6 w-6 text-blue-200" />;
  };

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, [latitude, longitude, fieldPolygon, polygonId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-8 w-8 animate-spin text-green-200" />
          <span className="ml-2 text-green-200">
            Loading Agromonitoring data...
          </span>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-5 w-5 text-red-200 mr-2" />
          <h3 className="text-lg font-semibold">Agromonitoring Unavailable</h3>
        </div>
        <p className="text-sm text-red-200 mb-3">{error}</p>
        <button
          onClick={fetchWeatherData}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{fieldName}</h3>
          <div className="flex items-center text-xs text-green-200">
            {weather.hasPolygonData ? (
              <Square className="h-3 w-3 mr-1" />
            ) : (
              <Target className="h-3 w-3 mr-1" />
            )}
            <span>Agromonitoring API</span>
          </div>
          <div className="text-xs text-green-300 mt-1 flex items-center space-x-2">
            <span>
              📍 {weather.coordinates.lat}, {weather.coordinates.lon}
            </span>
            {weather.fieldArea && <span>• 📐 {weather.fieldArea} ha</span>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {weather.hasPolygonData && (
            <Satellite
              className="h-4 w-4 text-green-200"
              title="Polygon monitoring active"
            />
          )}
          {getWeatherIcon(weather.condition)}
          <button
            onClick={fetchWeatherData}
            className="p-1 hover:bg-green-600 rounded transition-colors"
            title="Refresh agricultural data"
          >
            <RefreshCw className="h-4 w-4 text-green-200" />
          </button>
        </div>
      </div>

      {/* Field Coverage Status */}
      <div className="bg-green-600 bg-opacity-30 rounded-lg p-2 mb-3">
        <p className="text-xs text-green-200 flex items-center">
          <Satellite className="h-3 w-3 mr-1" />
          {weather.hasPolygonData
            ? "Polygon field monitoring"
            : "Point-based monitoring"}
        </p>
      </div>

      {/* Agricultural Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center">
          <Thermometer className="h-4 w-4 mx-auto mb-1 text-green-200" />
          <p className="text-lg font-bold">{weather.temperature}°C</p>
          <p className="text-xs text-green-200">Air Temp</p>
        </div>

        <div className="text-center">
          <Droplets className="h-4 w-4 mx-auto mb-1 text-green-200" />
          <p className="text-lg font-bold">{weather.humidity}%</p>
          <p className="text-xs text-green-200">Humidity</p>
        </div>

        {weather.soilTemp && (
          <div className="text-center">
            <div className="w-4 h-4 mx-auto mb-1 bg-green-200 rounded" />
            <p className="text-lg font-bold">{weather.soilTemp}°C</p>
            <p className="text-xs text-green-200">Soil Temp</p>
          </div>
        )}

        {weather.soilMoisture && (
          <div className="text-center">
            <Leaf className="h-4 w-4 mx-auto mb-1 text-green-200" />
            <p className="text-lg font-bold">{weather.soilMoisture}%</p>
            <p className="text-xs text-green-200">Soil Moisture</p>
          </div>
        )}
      </div>

      {/* Advanced Agricultural Data */}
      {(weather.solarRadiation || weather.evapotranspiration) && (
        <div className="bg-green-700 bg-opacity-30 rounded-lg p-2 mb-3">
          <div className="flex justify-between text-xs text-green-200">
            {weather.solarRadiation && (
              <span>☀️ Solar: {weather.solarRadiation}%</span>
            )}
            {weather.evapotranspiration && (
              <span>💨 ET: {weather.evapotranspiration}mm</span>
            )}
            <span>☁️ Clouds: {weather.clouds}%</span>
          </div>
        </div>
      )}

      {/* Satellite Data */}
      {satelliteData && (
        <div className="bg-green-700 bg-opacity-30 rounded-lg p-2 mb-3">
          <div className="flex justify-between text-xs text-green-200">
            {satelliteData.ndvi && (
              <span>🛰️ NDVI: {satelliteData.ndvi.toFixed(2)}</span>
            )}
            {satelliteData.date && <span>📅 {satelliteData.date}</span>}
          </div>
        </div>
      )}

      {/* Agricultural Insights */}
      {agriData && (
        <>
          <div className="bg-green-600 bg-opacity-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-green-100 font-medium">
              {agriData.soilHealth}
            </p>
          </div>

          <div className="bg-green-700 bg-opacity-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-green-100 font-medium">
              {agriData.irrigationAdvice}
            </p>
          </div>

          <div className="bg-green-600 bg-opacity-50 rounded-lg p-3">
            <p className="text-sm text-green-100">{agriData.cropConditions}</p>
          </div>
        </>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-xs text-green-300 text-center mt-3">
          Updated:{" "}
          {lastUpdated.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          • Agromonitoring API
          {weather.polygonId &&
            " • Polygon ID: " + weather.polygonId.slice(0, 8)}
        </div>
      )}
    </div>
  );
}
