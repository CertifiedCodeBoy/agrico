import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import CropAssistant from "./pages/CropAssistant";
import Settings from "./pages/Settings";
import WaterManagement from "./pages/WaterManagement";
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page route */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Dashboard routes with layout */}
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
