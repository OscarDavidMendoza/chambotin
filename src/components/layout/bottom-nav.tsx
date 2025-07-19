import { cn } from "@/lib/utils";
import { Home, BookOpen, TrendingUp, MessageCircle, User, CreditCard } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navItems = [
    { id: "dashboard", label: "Inicio", icon: Home },
    { id: "learning", label: "Aprende", icon: BookOpen },
    { id: "progress", label: "Progreso", icon: TrendingUp },
    { id: "credit", label: "Crédito", icon: CreditCard },
    { id: "mentor", label: "Mentor", icon: MessageCircle },
    { id: "profile", label: "Perfil", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-50">
      <div className="flex items-center justify-around py-2 px-1 safe-area-inset-bottom">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300",
              "min-w-[50px] touch-manipulation",
              activeTab === id 
                ? "text-primary bg-primary/10 scale-105 shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:scale-95"
            )}
          >
            <div className={cn(
              "relative mb-1 transition-all duration-200",
              activeTab === id && "scale-110"
            )}>
              <Icon size={18} className={activeTab === id ? "drop-shadow-sm" : ""} />
              {activeTab === id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </div>
            <span className={cn(
              "text-xs font-medium transition-all duration-200",
              activeTab === id ? "font-semibold" : "font-normal"
            )}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};