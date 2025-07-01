import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FieldCard from "./components/FieldCard";
import AddFieldModal from "./components/AddFieldModal";
import WeatherWidget from "./components/WeatherWidget";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import CropAssistant from "./pages/CropAssistant";
import Settings from "./pages/Settings";
import WaterManagement from "./pages/WaterManagement";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="assistant" element={<CropAssistant />} />
          <Route path="settings" element={<Settings />} />
          <Route path="water-management" element={<WaterManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
