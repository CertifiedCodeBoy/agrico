import React, { useState, useEffect } from "react";
import {
  Droplets,
  AlertTriangle,
  Brain,
  TrendingDown,
  TrendingUp,
  Calendar,
  Zap,
  ThermometerSun,
  CloudRain,
  Settings,
  Waves,
  BarChart3,
  Clock,
  Lightbulb,
  Activity,
  Target,
  AlertCircle,
} from "lucide-react";
import { notificationService } from "../services/notificationService";

export default function WaterManagement() {
  const [waterLevel, setWaterLevel] = useState(68);
  const [isAnimating, setIsAnimating] = useState(true);

  // Mock data
  const [waterData] = useState({
    totalCapacity: 50000,
    currentAmount: 34000,
    dailyConsumption: 2800,
    efficiency: 85,
    lastRefill: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });

  const [weatherForecast] = useState([
    { day: "Today", rainfall: 0, temp: 28 },
    { day: "Tomorrow", rainfall: 2, temp: 26 },
    { day: "Wed", rainfall: 0, temp: 29 },
    { day: "Thu", rainfall: 8, temp: 24 },
    { day: "Fri", rainfall: 15, temp: 22 },
  ]);

  const [crops] = useState([
    { name: "Tomatoes", consumption: 1125, percentage: 45 },
    { name: "Wheat", consumption: 540, percentage: 22 },
    { name: "Lettuce", consumption: 140, percentage: 6 },
    { name: "Carrots", consumption: 420, percentage: 17 },
  ]);

  // Calculate predictions
  const calculatePredictions = () => {
    const currentAmount = waterData.currentAmount;
    const dailyUse = waterData.dailyConsumption;
    const rainFactor =
      weatherForecast.reduce((acc, day) => acc + day.rainfall, 0) * 0.1;
    const adjustedDailyUse = Math.max(
      dailyUse - rainFactor * 100,
      dailyUse * 0.7
    );
    const daysRemaining = Math.floor(currentAmount / adjustedDailyUse);

    return {
      daysRemaining,
      adjustedDailyUse: Math.round(adjustedDailyUse),
    };
  };

  const predictions = calculatePredictions();

  // Water status
  const getWaterStatus = () => {
    if (waterLevel >= 70)
      return {
        color: "green",
        text: "Excellent",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-200",
      };
    if (waterLevel >= 50)
      return {
        color: "blue",
        text: "Good",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
      };
    if (waterLevel >= 30)
      return {
        color: "yellow",
        text: "Low",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-200",
      };
    return {
      color: "red",
      text: "Critical",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
    };
  };

  const waterStatus = getWaterStatus();

  // AI recommendations
  const getAIRecommendations = () => {
    const recommendations = [];

    if (waterLevel < 30) {
      recommendations.push({
        type: "urgent",
        icon: AlertTriangle,
        title: "Critical Water Level",
        description:
          "Immediate refill required. Consider emergency water conservation.",
      });
    } else if (waterLevel < 50) {
      recommendations.push({
        type: "warning",
        icon: TrendingDown,
        title: "Low Water Reserve",
        description: "Plan refill within 3-5 days to avoid disruption.",
      });
    }

    if (waterData.efficiency < 90) {
      recommendations.push({
        type: "info",
        icon: Settings,
        title: "Optimize Irrigation Efficiency",
        description: `Current efficiency: ${waterData.efficiency}%. Check for leaks and adjust schedules.`,
      });
    }

    const upcomingRain = weatherForecast.filter(
      (day) => day.rainfall > 5
    ).length;
    if (upcomingRain > 0) {
      recommendations.push({
        type: "positive",
        icon: CloudRain,
        title: "Rain Expected",
        description: `${upcomingRain} rainy day(s) forecasted. Reduce irrigation by 30-40%.`,
      });
    }

    return recommendations;
  };

  const aiRecommendations = getAIRecommendations();

  // Water Tank Component
  const WaterTank = () => (
    <div className="flex flex-col items-center">
      {/* Tank Container */}
      <div className="relative w-48 h-64 bg-gray-100 rounded-2xl border-4 border-gray-300 overflow-hidden shadow-lg">
        {/* Water */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-2000 ease-out"
          style={{ height: `${waterLevel}%` }}
        >
          <div
            className={`absolute inset-0 ${
              waterLevel > 70
                ? "bg-gradient-to-t from-blue-600 to-blue-400"
                : waterLevel > 50
                ? "bg-gradient-to-t from-blue-600 to-blue-400"
                : waterLevel > 30
                ? "bg-gradient-to-t from-yellow-600 to-yellow-400"
                : "bg-gradient-to-t from-red-600 to-red-400"
            } opacity-80`}
          />

          {/* Water Surface Animation */}
          <div className="absolute top-0 left-0 right-0 h-4 overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-30 animate-pulse" />
          </div>

          {/* Bubbles */}
          {isAnimating && (
            <div className="absolute inset-0">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-bounce"
                  style={{
                    left: `${20 + i * 20}%`,
                    bottom: `${30 + (i % 2) * 30}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: "2s",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Level Markers */}
        {[25, 50, 75].map((level) => (
          <div
            key={level}
            className="absolute left-2 right-2 border-t border-gray-400 opacity-50"
            style={{ bottom: `${level}%` }}
          >
            <span className="absolute -left-8 -top-2 text-xs text-gray-500 bg-white px-1 rounded">
              {level}%
            </span>
          </div>
        ))}

        {/* Current Level Indicator */}
        {/* <div
          className=" flex items-center"
          style={{ bottom: `${waterLevel}%` }}
        >
          <div className="w-3 h-0.5 bg-gray-800" />
          <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-bold ml-1">
            {waterLevel}%
          </div>
        </div> */}
      </div>

      {/* Tank Stats */}
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-gray-900">
          {waterData.currentAmount.toLocaleString()}L
        </div>
        <div className="text-sm text-gray-500">
          of {waterData.totalCapacity.toLocaleString()}L capacity
        </div>
        <div
          className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-medium ${waterStatus.bgColor} ${waterStatus.textColor}`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              waterLevel > 70
                ? "bg-green-500"
                : waterLevel > 50
                ? "bg-blue-500"
                : waterLevel > 30
                ? "bg-yellow-500"
                : "bg-red-500"
            } animate-pulse`}
          />
          {waterStatus.text}
        </div>
      </div>
    </div>
  );

  // Monitor water level and trigger notifications
  useEffect(() => {
    if (waterLevel < 30) {
      notificationService.addCriticalWaterAlert("Main Reservoir", waterLevel);
    } else if (waterLevel < 50) {
      notificationService.addNotification({
        type: 'warning',
        title: 'Low Water Level',
        message: `Main reservoir at ${waterLevel}%. Consider refilling soon.`,
        fieldId: 'main-reservoir'
      });
    }
  }, [waterLevel]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Droplets className="h-8 w-8 text-blue-500 mr-3" />
                Water Statistics
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor water reserves and get smart recommendations for optimal
                irrigation
              </p>
            </div>
            {/* <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button> */}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Water Tank */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Water Reservoir
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${waterStatus.bgColor} ${waterStatus.textColor} ${waterStatus.borderColor} border`}
                >
                  {waterStatus.text}
                </span>
              </div>

              <WaterTank />

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    Daily Usage
                  </div>
                  <div className="text-lg font-bold text-blue-700">
                    {waterData.dailyConsumption.toLocaleString()}L
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-purple-600 font-medium mb-1">
                    Days Left
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {predictions.daysRemaining}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      waterLevel > 70
                        ? "bg-green-500"
                        : waterLevel > 50
                        ? "bg-blue-500"
                        : waterLevel > 30
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${waterLevel}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Charts & Analytics */}
          <div className="lg:col-span-5 space-y-6">
            {/* Water Usage by Crop */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
                Water Usage by Crop
              </h3>
              <div className="space-y-4">
                {crops.map((crop, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {crop.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {crop.consumption}L
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${crop.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Forecast */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CloudRain className="h-5 w-5 text-blue-500 mr-2" />
                Weather Forecast
              </h3>

              <div className="space-y-3">
                {weatherForecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-16">
                        {day.day}
                      </span>
                      {day.rainfall > 0 ? (
                        <CloudRain className="h-4 w-4 text-blue-500 ml-2" />
                      ) : (
                        <ThermometerSun className="h-4 w-4 text-yellow-500 ml-2" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {day.temp}°C
                      </div>
                      {day.rainfall > 0 && (
                        <div className="text-xs text-blue-600">
                          {day.rainfall}mm
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Efficiency & Performance */}
            {/* <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 text-purple-500 mr-2" />
                System Performance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">{waterData.efficiency}%</div>
                  <div className="text-sm text-gray-500">Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{predictions.adjustedDailyUse}L</div>
                  <div className="text-sm text-gray-500">Adjusted Usage</div>
                </div>
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${waterData.efficiency}%` }}
                />
              </div>
            </div> */}
          </div>

          {/* Right Column - AI & Weather */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Recommendations */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="h-5 w-5 text-purple-500 mr-2" />
                AI Advisor
              </h3>

              <div className="space-y-3">
                {aiRecommendations.length > 0 ? (
                  aiRecommendations.map((rec, index) => {
                    const IconComponent = rec.icon;
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          rec.type === "urgent"
                            ? "bg-red-50 border-red-400"
                            : rec.type === "warning"
                            ? "bg-yellow-50 border-yellow-400"
                            : rec.type === "positive"
                            ? "bg-green-50 border-green-400"
                            : "bg-blue-50 border-blue-400"
                        }`}
                      >
                        <div className="flex items-start">
                          <IconComponent
                            className={`h-4 w-4 mt-1 mr-3 ${
                              rec.type === "urgent"
                                ? "text-red-500"
                                : rec.type === "warning"
                                ? "text-yellow-500"
                                : rec.type === "positive"
                                ? "text-green-500"
                                : "text-blue-500"
                            }`}
                          />
                          <div>
                            <h4 className="font-medium text-sm text-gray-900">
                              {rec.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {rec.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <Lightbulb className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-600 font-medium text-sm">
                      All systems optimal!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💡 Quick Tips
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Water early morning (6-8 AM)</p>
                <p>• Use mulch to retain moisture</p>
                <p>• Check for leaks weekly</p>
                <p>• Monitor soil sensors daily</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
