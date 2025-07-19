import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { TrendingUp, Award, Clock, Target, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const DashboardOverview = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const { 
    metrics, 
    userProgress, 
    modules, 
    loading, 
    getBusinessGrowth, 
    getLatestMetrics,
    getModuleProgress 
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
    }
  };

  const userName = profile?.display_name || user?.email?.split('@')[0] || "Usuario";
  const latestMetrics = getLatestMetrics();
  const moduleProgress = getModuleProgress();
  const businessGrowth = getBusinessGrowth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getGrowthMessage = () => {
    if (metrics.length === 0) {
      return "¡Comienza registrando las métricas de tu negocio!";
    }
    if (businessGrowth > 0) {
      return `Tu negocio ha crecido un ${businessGrowth}% desde que comenzaste`;
    } else if (businessGrowth === 0) {
      return "Mantén el enfoque, el crecimiento viene con constancia";
    } else {
      return "Analiza tus estrategias para impulsar el crecimiento";
    }
  };

  const getRecentAchievements = () => {
    const completedModules = userProgress.filter(p => p.status === 'completed');
    const achievements = [];

    if (completedModules.length > 0) {
      const latestCompleted = completedModules.sort((a, b) => 
        new Date(b.completion_date || '').getTime() - new Date(a.completion_date || '').getTime()
      )[0];
      
      const module = modules.find(m => m.id === latestCompleted.module_id);
      if (module) {
        achievements.push({
          title: `¡Módulo de ${module.title} Completado!`,
          subtitle: latestCompleted.completion_date 
            ? format(new Date(latestCompleted.completion_date), 'dd/MM/yyyy')
            : 'Recientemente',
          points: 50,
          type: 'success'
        });
      }
    }

    if (metrics.length >= 2) {
      achievements.push({
        title: `Registro de ${metrics.length} períodos`,
        subtitle: '¡Excelente constancia!',
        points: null,
        type: 'warning'
      });
    }

    return achievements;
  };

  const achievements = getRecentAchievements();

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="animate-pulse">
          <div className="h-20 bg-muted rounded-lg mb-4"></div>
          <div className="h-32 bg-muted rounded-lg mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="h-20 bg-muted rounded-lg"></div>
          </div>
          <div className="h-40 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-primary text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">¡Hola, {userName}! 👋</h2>
        <p className="opacity-90">{getGrowthMessage()}</p>
      </div>

      {/* Progress Overview */}
      <Card className="p-6 bg-gradient-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Tu Progreso General</h3>
          <Badge variant="secondary" className="bg-success-light text-success">
            {latestMetrics.learningProgress > 0 ? 'En progreso' : 'Comenzando'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-6">
          <ProgressRing progress={latestMetrics.learningProgress} size="lg" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              {latestMetrics.coursesCompleted} de {modules.length} módulos completados
            </p>
            {moduleProgress.length > 0 ? (
              <div className="space-y-2">
                {moduleProgress.slice(0, 4).map((module) => {
                  const progressPercentage = module.status === 'completed' ? 100 :
                                           module.status === 'in_progress' ? 60 : 0;
                  
                  return (
                    <div key={module.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{module.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              module.status === 'completed' ? 'bg-success' :
                              module.status === 'in_progress' ? 'bg-primary' : 'bg-muted-foreground'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground w-8">
                          {progressPercentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Comienza tu primer módulo de aprendizaje
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Business Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-success text-white">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} />
            <div>
              <p className="text-xs opacity-90">Crecimiento</p>
              <p className="text-xl font-bold">
                {businessGrowth > 0 ? '+' : ''}{businessGrowth}%
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-warning text-white">
          <div className="flex items-center gap-3">
            <Target size={24} />
            <div>
              <p className="text-xs opacity-90">Total Clientes</p>
              <p className="text-xl font-bold">{latestMetrics.totalCustomers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Achievement Section - Solo mostrar si hay logros */}
      {achievements.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-warning" size={24} />
            <h3 className="text-lg font-semibold">Logros Recientes</h3>
          </div>
          
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  achievement.type === 'success' ? 'bg-success-light' : 'bg-warning-light'
                }`}
              >
                <div>
                  <p className={`font-medium ${
                    achievement.type === 'success' ? 'text-success' : 'text-warning'
                  }`}>
                    {achievement.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{achievement.subtitle}</p>
                </div>
                {achievement.points ? (
                  <Badge className="bg-success text-white">+{achievement.points} puntos</Badge>
                ) : (
                  <Clock className="text-warning" size={20} />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Continúa Aprendiendo</h3>
        
        {/* Botón llamativo para usuarios sin progreso */}
        {latestMetrics.learningProgress === 0 && (
          <div className="mb-4 p-6 bg-gradient-primary text-white rounded-lg text-center animate-pulse">
            <div className="animate-[wiggle_1s_ease-in-out_infinite] inline-block">
              <h4 className="text-xl font-bold mb-2">🚀 ¡Inicia tu Camino!</h4>
            </div>
            <p className="mb-4 opacity-90">
              Comienza tu transformación digital ahora
            </p>
            <button 
              onClick={() => {
                // Cambiar a la pestaña de learning en la misma página
                const event = new CustomEvent('changeTab', { detail: 'learning' });
                window.dispatchEvent(event);
              }}
              className="bg-white text-primary px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Empezar Ahora
            </button>
          </div>
        )}
        
        <div className="space-y-3">
          <button 
            onClick={() => window.location.href = '/monthly-report'}
            className="w-full p-4 bg-primary-light hover:bg-primary/20 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">Registro Mensual</p>
                <p className="text-sm text-muted-foreground">Ingresa las métricas de tu negocio</p>
              </div>
              <Plus className="text-primary" size={20} />
            </div>
          </button>
          
          <button 
            onClick={() => {
              // Cambiar a la pestaña de learning en la misma página
              const event = new CustomEvent('changeTab', { detail: 'learning' });
              window.dispatchEvent(event);
            }}
            className="w-full p-4 bg-accent hover:bg-accent/80 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Módulos de Aprendizaje</p>
                <p className="text-sm text-muted-foreground">
                  {latestMetrics.coursesCompleted}/{modules.length} completados
                </p>
              </div>
              <Badge variant="outline">{latestMetrics.learningProgress}%</Badge>
            </div>
          </button>

          {metrics.length > 0 && (
            <button 
              onClick={() => {
                // Cambiar a la pestaña de progress en la misma página
                const event = new CustomEvent('changeTab', { detail: 'progress' });
                window.dispatchEvent(event);
              }}
              className="w-full p-4 bg-success-light hover:bg-success/20 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-success">Ver Progreso Detallado</p>
                  <p className="text-sm text-muted-foreground">
                    Ingresos: {formatCurrency(latestMetrics.currentRevenue)}
                  </p>
                </div>
                <TrendingUp className="text-success" size={20} />
              </div>
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};