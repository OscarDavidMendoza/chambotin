import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { HeroSection } from "@/components/sections/hero-section";
import { DashboardOverview } from "@/components/sections/dashboard-overview";
import { LearningModules } from "@/components/sections/learning-modules";
import { ProgressTracking } from "@/components/sections/progress-tracking";
import { MentorChat } from "@/components/sections/mentor-chat";
import { ProfileSection } from "@/components/sections/profile-section";
import { CreditOffers } from "@/components/sections/credit-offers";
import { BottomNav } from "@/components/layout/bottom-nav";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Listen for tab change events from components
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('changeTab', handleTabChange as EventListener);
    };
  }, []);

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "learning":
        return <LearningModules />;
      case "progress":
        return <ProgressTracking />;
      case "mentor":
        return <MentorChat />;
      case "credit":
        return <CreditOffers />;
      case "profile":
        return <ProfileSection />;
      default:
        return <DashboardOverview />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <HeroSection onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        {renderActiveSection()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
