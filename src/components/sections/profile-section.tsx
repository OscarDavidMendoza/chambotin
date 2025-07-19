import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Store, 
  Award, 
  Settings, 
  LogOut,
  Crown,
  Target,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";

export const ProfileSection = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { 
    metrics, 
    userProgress, 
    loading: metricsLoading,
    getLatestMetrics 
  } = useBusinessMetrics();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  if (loading || metricsLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-4"></div>
          <div className="h-20 bg-muted rounded-lg mb-4"></div>
          <div className="h-40 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const userProfile = {
    name: profile?.display_name || user?.email?.split('@')[0] || "Usuario",
    email: user?.email || "",
    phone: profile?.phone_number || "",
    location: "México", // Default location
    businessName: profile?.business_name || "Mi Negocio",
    businessType: profile?.business_type || "Emprendimiento",
    joinDate: new Date(user?.created_at || Date.now()).toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    }),
    avatar: ""
  };

  const latestMetrics = getLatestMetrics();
  const completedModules = userProgress.filter(p => p.status === 'completed').length;
  const hasMetrics = metrics.length > 0;
  const totalPoints = completedModules * 100 + metrics.length * 50;
  const consecutiveDays = Math.min(metrics.length, 30); // Based on recorded days
  
  const achievements = [
    { 
      id: "first-sale", 
      name: "Primera Venta", 
      icon: "💰", 
      completed: hasMetrics
    },
    { 
      id: "first-module", 
      name: "Primer Módulo", 
      icon: "📚", 
      completed: completedModules >= 1
    },
    { 
      id: "consistent-learner", 
      name: "Estudiante Constante", 
      icon: "🎯", 
      completed: completedModules >= 3
    },
    { 
      id: "growth-champion", 
      name: "Campeón del Crecimiento", 
      icon: "📈", 
      completed: latestMetrics.totalGrowth > 50
    },
  ];

  const getLevel = () => {
    if (completedModules === 0 && !hasMetrics) return "Emprendedor Novato";
    if (completedModules < 3) return "Emprendedor Principiante";
    if (completedModules < 6) return "Emprendedor Intermedio";
    return "Emprendedor Avanzado";
  };

  const stats = {
    totalPoints,
    level: getLevel(),
    coursesCompleted: completedModules,
    currentStreak: consecutiveDays,
    businessGrowth: latestMetrics.totalGrowth
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <Card className="p-6 bg-gradient-primary text-white">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-white">
            <AvatarImage src={userProfile.avatar} />
            <AvatarFallback className="bg-white text-primary text-xl font-bold">
              {userProfile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{userProfile.name}</h2>
            <p className="opacity-90 text-sm mb-2">{userProfile.businessName}</p>
            <Badge className="bg-white/20 text-white border-white/20">
              <Crown size={12} className="mr-1" />
              {stats.level}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center bg-gradient-success text-white">
          <div className="text-2xl font-bold">{stats.totalPoints}</div>
          <div className="text-sm opacity-90">Puntos Totales</div>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-warning text-white">
          <div className="text-2xl font-bold">{stats.currentStreak}</div>
          <div className="text-sm opacity-90">Días Consecutivos</div>
        </Card>
      </div>

      {/* Business Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Store className="text-primary" size={20} />
          Información del Negocio
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="text-muted-foreground" size={16} />
            <span className="text-sm">{userProfile.location}</span>
          </div>
          <div className="flex items-center gap-3">
            <Target className="text-muted-foreground" size={16} />
            <span className="text-sm">Tipo: {userProfile.businessType}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="text-muted-foreground" size={16} />
            <span className="text-sm">Miembro desde {userProfile.joinDate}</span>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="text-warning" size={20} />
          Logros Desbloqueados
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border-2 text-center ${
                achievement.completed
                  ? "bg-success-light border-success text-success"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <div className="text-xs font-medium">{achievement.name}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Progress Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen de Progreso</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cursos Completados</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{stats.coursesCompleted} de 6</Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Crecimiento del Negocio</span>
            <Badge className="bg-success text-white">+{stats.businessGrowth}%</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Racha Actual</span>
            <Badge variant="outline" className="text-warning border-warning">
              {stats.currentStreak} días
            </Badge>
          </div>
        </div>
      </Card>

      {/* Contact Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="text-primary" size={20} />
          Información de Contacto
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="text-muted-foreground" size={16} />
            <span className="text-sm">{userProfile.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-muted-foreground" size={16} />
            <span className="text-sm">{userProfile.phone}</span>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={() => window.location.href = '/settings'}
          variant="outline" 
          className="w-full justify-start"
        >
          <Settings className="mr-2" size={16} />
          Configuración
        </Button>
        
        <Button 
          onClick={handleSignOut}
          variant="outline" 
          className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-white"
        >
          <LogOut className="mr-2" size={16} />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};