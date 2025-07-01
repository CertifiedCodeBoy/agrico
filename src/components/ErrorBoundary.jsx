import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorDisplay({ error, onRetry, title = "Connection Error" }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h3 className="text-red-800 font-medium">{title}</h3>
      </div>
      <p className="text-red-700 mb-4">{error}</p>
      <div className="flex space-x-3">
        <button
          onClick={onRetry}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
