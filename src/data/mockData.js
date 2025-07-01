export const mockFields = [
  {
    id: "1",
    name: "North Field",
    cropType: "Tomatoes",
    area: 2.5,
    soilMoisture: 45,
    temperature: 28,
    lastWatered: new Date("2025-01-21T06:30:00"),
    pumpStatus: "off",
    recommendedWater: 2.3,
    health: "good",
  },
  {
    id: "2",
    name: "South Field",
    cropType: "Wheat",
    area: 4.2,
    soilMoisture: 65,
    temperature: 26,
    lastWatered: new Date("2025-01-20T18:15:00"),
    pumpStatus: "auto",
    recommendedWater: 1.8,
    health: "excellent",
  },
  {
    id: "3",
    name: "East Garden",
    cropType: "Potatoes",
    area: 1.8,
    soilMoisture: 30,
    temperature: 24,
    lastWatered: new Date("2025-01-19T14:20:00"),
    pumpStatus: "off",
    recommendedWater: 3.1,
    health: "fair",
  },
];

export const mockWateringLogs = [
  {
    id: "1",
    fieldId: "1",
    timestamp: new Date("2025-01-21T06:30:00"),
    duration: 20,
    amount: 115,
    method: "manual",
  },
  {
    id: "2",
    fieldId: "2",
    timestamp: new Date("2025-01-20T18:15:00"),
    duration: 35,
    amount: 302,
    method: "auto",
  },
];

export const mockWeather = {
  temperature: 27,
  humidity: 68,
  rainfall: 0,
  forecast: "Partly cloudy with chance of rain tomorrow",
};

export const cropDatabase = {
  Tomatoes: {
    name: "Tomatoes",
    wateringFrequency: "2-3 times per week",
    soilMoistureRange: [40, 70],
    growthStage: "Flowering",
    tips: [
      "Water early morning to reduce evaporation",
      "Avoid watering leaves to prevent disease",
      "Increase watering during fruit development",
      "Monitor for blossom end rot if inconsistent watering",
    ],
  },
  Wheat: {
    name: "Wheat",
    wateringFrequency: "1-2 times per week",
    soilMoistureRange: [50, 75],
    growthStage: "Grain filling",
    tips: [
      "Critical water needs during grain filling stage",
      "Reduce watering as harvest approaches",
      "Monitor for fungal diseases in high humidity",
      "Deep, infrequent watering promotes strong roots",
    ],
  },
  Potatoes: {
    name: "Potatoes",
    wateringFrequency: "2-3 times per week",
    soilMoistureRange: [45, 65],
    growthStage: "Tuber development",
    tips: [
      "Consistent moisture critical for tuber quality",
      "Avoid overwatering to prevent rot",
      "Hill soil around plants as they grow",
      "Stop watering 2 weeks before harvest",
    ],
  },
  Corn: {
    name: "Corn",
    wateringFrequency: "2-3 times per week",
    soilMoistureRange: [50, 70],
    growthStage: "Vegetative",
    tips: [
      "Deep watering encourages strong root development",
      "Critical water needs during tasseling",
      "Reduce watering near harvest",
      "Monitor for corn earworm in wet conditions",
    ],
  },
  Rice: {
    name: "Rice",
    wateringFrequency: "Keep flooded",
    soilMoistureRange: [80, 100],
    growthStage: "Tillering",
    tips: [
      "Maintain 2-5cm standing water",
      "Drain fields before harvest",
      "Monitor for blast disease",
      "Control weeds early in season",
    ],
  },
  Lettuce: {
    name: "Lettuce",
    wateringFrequency: "Daily light watering",
    soilMoistureRange: [60, 80],
    growthStage: "Leaf development",
    tips: [
      "Consistent moisture prevents bolting",
      "Avoid overhead watering to prevent disease",
      "Harvest in cool morning hours",
      "Provide shade in hot weather",
    ],
  },
};

export const mockMoistureData = [
  { date: "1/15", northField: 65, southField: 70, eastField: 45 },
  { date: "1/16", northField: 60, southField: 68, eastField: 40 },
  { date: "1/17", northField: 55, southField: 72, eastField: 35 },
  { date: "1/18", northField: 50, southField: 69, eastField: 42 },
  { date: "1/19", northField: 48, southField: 65, eastField: 38 },
  { date: "1/20", northField: 45, southField: 65, eastField: 30 },
  { date: "1/21", northField: 45, southField: 65, eastField: 30 },
];

export const mockWaterUsageData = [
  { field: "North Field", usage: 450, target: 400 },
  { field: "South Field", usage: 320, target: 350 },
  { field: "East Field", usage: 280, target: 300 },
];

export const mockCropHealthData = [
  { name: "Excellent", value: 35, color: "#10B981" },
  { name: "Good", value: 45, color: "#3B82F6" },
  { name: "Fair", value: 15, color: "#F59E0B" },
  { name: "Poor", value: 5, color: "#EF4444" },
];
