import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// User Components
import BottomNavigation from "./components/BottomNavigation";
import MobileHome from "./components/MobileHome";
import CommunityFeed from "./components/CommunityFeed";
import MyReports from "./components/MyReports";
import Profile from "./components/Profile";
import MobileReportSection from "./components/MobileReportSection";
import IssueDetail from "./components/IssueDetail";
import AuthPage from "./components/auth/AuthPage";
import AIAnalysisDashboard from "./components/AIAnalysisDashboard";

// Admin Components
import { AdminRoutes } from "./routes/AdminRoutes";

// Department Components
import { DepartmentRoutes } from "./routes/DepartmentRoutes";

// User Section
const UserApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showIssueDetail, setShowIssueDetail] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingReport, setPendingReport] = useState<any>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowIssueDetail(false);
  };

  const handleAuthRequired = () => {
    setShowAuth(true);
  };

  const handleAuthComplete = () => {
    setShowAuth(false);
  };

  const renderContent = () => {
    if (showAuth) {
      return <AuthPage onBack={handleAuthComplete} />;
    }
    if (showIssueDetail) {
      return <IssueDetail onBack={() => setShowIssueDetail(false)} />;
    }
    switch (activeTab) {
      case "home":
        return (
          <MobileHome
            onNavigate={handleTabChange}
            onAuthRequired={handleAuthRequired}
          />
        );
      case "report":
        return (
          <MobileReportSection
            onBack={() => setActiveTab("home")}
            onAuthRequired={handleAuthRequired}
            onNavigate={handleTabChange}
            setPendingReport={setPendingReport}
          />
        );
      case "feed":
        return <CommunityFeed />;
      case "ai":
        return (
          <AIAnalysisDashboard 
            onBack={() => setActiveTab("home")} 
            pendingReport={pendingReport}
            onComplete={() => {
              setPendingReport(null);
              setActiveTab("home");
            }}
          />
        );
      case "reports":
        return (
          <MyReports
            onNavigate={handleTabChange}
            onAuthRequired={handleAuthRequired}
          />
        );
      case "profile":
        return <Profile onAuthRequired={handleAuthRequired} />;
      default:
        return (
          <MobileHome
            onNavigate={handleTabChange}
            onAuthRequired={handleAuthRequired}
          />
        );
    }
  };

  return (
    <div
      className="flex justify-center"
      style={{ background: '#06060A', minHeight: '100dvh' }}
    >
      <div
        className="relative flex flex-col w-full"
        style={{ maxWidth: '390px', height: '100dvh', background: '#0F0F13' }}
      >
        {/* Scrollable main content — nav always at bottom */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          {renderContent()}
        </main>

        {/* Floating Action Button — sits above nav on Home */}
        {activeTab === "home" && !showAuth && !showIssueDetail && (
          <button
            onClick={handleAuthRequired}
            className="absolute bottom-20 right-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl z-40 active:scale-95 transition-transform"
            style={{ background: "#7C6FFF" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        )}

        {/* Bottom Navigation */}
        {!showIssueDetail && activeTab !== "report" && !showAuth && (
          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        )}
      </div>
    </div>
  );
};

// Main App component with routing
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* User routes */}
          <Route path="/" element={<UserApp />} />
          <Route path="/home" element={<UserApp />} />
          <Route path="/report" element={<UserApp />} />
          <Route path="/feed" element={<UserApp />} />
          <Route path="/reports" element={<UserApp />} />
          <Route path="/profile" element={<UserApp />} />

          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Department routes */}
          <Route path="/department/*" element={<DepartmentRoutes />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
