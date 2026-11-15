
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import FloatingChat from "./components/FloatingChat";

import Dashboard from "./pages/Dashboard";
import TenderDetails from "./pages/TenderDetails";
import AnalysisResults from "./pages/AnalysisResults";
import AnalysisHistory from "./pages/AnalysisHistory";

import "./App.css";
import "./styles/phase2.css";

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-container">

      {/* Mobile Menu Button */}
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="main-content">

        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/tender-details"
            element={<TenderDetails />}
          />

          <Route
            path="/analysis-results"
            element={<AnalysisResults />}
          />

          <Route
            path="/history"
            element={<AnalysisHistory />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>

      </main>

      <FloatingChat />

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
