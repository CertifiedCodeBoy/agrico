import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  mockMoistureData,
  mockWaterUsageData,
  mockCropHealthData,
} from "../data/mockData";

const moistureData = mockMoistureData;
const waterUsageData = mockWaterUsageData;
const cropHealthData = mockCropHealthData;

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600">
          Monitor field performance, water usage, and crop health trends over
          time
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Moisture Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Soil Moisture Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moistureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="northField"
                stroke="#10B981"
                strokeWidth={2}
                name="North Field"
              />
              <Line
                type="monotone"
                dataKey="southField"
                stroke="#3B82F6"
                strokeWidth={2}
                name="South Field"
              />
              <Line
                type="monotone"
                dataKey="eastField"
                stroke="#F59E0B"
                strokeWidth={2}
                name="East Field"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Water Usage Comparison */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Water Usage vs Target
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waterUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="field" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage" fill="#3B82F6" name="Actual Usage (L)" />
              <Bar dataKey="target" fill="#10B981" name="Target (L)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Health Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Overall Crop Health
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cropHealthData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {cropHealthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {cropHealthData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Panel */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            AI Insights
          </h3>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="bg-green-500 rounded-full p-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Water Efficiency Improved
                  </p>
                  <p className="text-xs text-green-600">
                    South Field showing 15% better water retention this week
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="bg-yellow-500 rounded-full p-1">
                  <span className="text-white text-xs">!</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Attention Required
                  </p>
                  <p className="text-xs text-yellow-600">
                    East Field moisture dropping below optimal range
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="bg-blue-500 rounded-full p-1">
                  <span className="text-white text-xs">💡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Optimization Tip
                  </p>
                  <p className="text-xs text-blue-600">
                    Consider scheduling irrigation for early morning hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
