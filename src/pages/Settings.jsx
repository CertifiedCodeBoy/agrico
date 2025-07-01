import React, { useState } from 'react';
import { Save, Bell, Wifi, Database, Shield, HardDrive } from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoMode, setAutoMode] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h2>
        <p className="text-gray-600">
          Configure your smart irrigation system preferences and hardware integration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-500" />
            <span>General Settings</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Push Notifications</p>
                <p className="text-xs text-gray-500">Get alerts for critical field conditions</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Auto Irrigation Mode</p>
                <p className="text-xs text-gray-500">Let AI automatically control pumps</p>
              </div>
              <button
                onClick={() => setAutoMode(!autoMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoMode ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Data Collection</p>
                <p className="text-xs text-gray-500">Allow system to collect performance data</p>
              </div>
              <button
                onClick={() => setDataCollection(!dataCollection)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  dataCollection ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    dataCollection ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Hardware Integration */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <HardDrive className="h-5 w-5 text-blue-500" />
            <span>Hardware Integration</span>
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Wifi className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-800">Sensor Connectivity</p>
              </div>
              <p className="text-xs text-blue-600 mb-3">
                Currently running in simulation mode. Connect real sensors for live data.
              </p>
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-colors">
                Connect Hardware
              </button>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Future Hardware Plans</p>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Soil moisture & temperature sensors</li>
                <li>• Smart water pump controllers</li>
                <li>• Weather station integration</li>
                <li>• Solar-powered field units</li>
                <li>• Drone field mapping (long-term)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-800">Platform Status</span>
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-800">AI Services</span>
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Active</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-yellow-800">Hardware Connection</span>
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">Simulation</span>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About AgroSmart</h3>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Our Mission:</strong> Making smart irrigation accessible to farmers everywhere.
            </p>
            <p>
              This platform was born from personal experience watching family members struggle with manual irrigation - 
              walking hours under the sun, guessing soil conditions, and wasting precious water.
            </p>
            <p>
              As computer science students, we knew technology could solve this problem. AgroSmart combines AI, 
              IoT sensors, and intuitive design to help farmers optimize water usage and improve crop yields.
            </p>
            <p>
              <strong>Next Phase:</strong> Hardware integration with real sensors, smart pumps, and solar power systems 
              for complete field automation.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
}