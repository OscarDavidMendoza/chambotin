import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { PlayCircle, CheckCircle, Lock, Clock, Award, Target } from "lucide-react";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";

export const LearningModules = () => {
  const { modules, userProgress, loading } = useBusinessMetrics();

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
          <div className="h-32 bg-muted rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calcular estadísticas basadas en datos reales
  const stats = {
    totalModules: modules.length,
    completedModules: userProgress.filter(p => p.status === "completed").length,
    inProgressModules: userProgress.filter(p => p.status === "in_progress").length,
    overallProgress: modules.length > 0 ? 
      Math.round((userProgress.filter(p => p.status === "completed").length / modules.length) * 100) : 0
  };

  // Combinar módulos con progreso del usuario
  const modulesWithProgress = modules.map(module => {
    const progress = userProgress.find(p => p.module_id === module.id);
    let status = "available";
    let progressPercentage = 0;

    if (progress) {
      status = progress.status;
      if (status === "completed") {
        progressPercentage = 100;
      } else if (status === "in_progress") {
        // Calcular progreso basado en quiz scores si están disponibles
        if (progress.pre_quiz_score && progress.post_quiz_score) {
          progressPercentage = Math.round(((progress.pre_quiz_score + progress.post_quiz_score) / 2) * 10);
        } else {
          progressPercentage = 60; // Progreso por defecto para módulos en curso
        }
      }
    }

    return {
      ...module,
      status,
      progress: progressPercentage,
      userProgress: progress
    };
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-success" size={20} />;
      case "in_progress":
        return <PlayCircle className="text-primary" size={20} />;
      case "available":
        return <PlayCircle className="text-muted-foreground" size={20} />;
      default:
        return <Lock className="text-muted-foreground" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-white";
      case "in_progress":
        return "bg-primary text-white";
      case "available":
        return "bg-secondary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Tu Ruta de Aprendizaje</h2>
        <p className="text-muted-foreground">Desarrolla las habilidades para hacer crecer tu negocio</p>
      </div>

      {/* Progress Overview - Mejorado centrado */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">{stats.totalModules}</div>
          <div className="text-xs text-muted-foreground leading-tight">Módulos<br />Totales</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success mb-1">{stats.completedModules}</div>
          <div className="text-xs text-muted-foreground leading-tight">Completados</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-warning mb-1">{stats.inProgressModules}</div>
          <div className="text-xs text-muted-foreground leading-tight">En Progreso</div>
        </Card>
      </div>

      {/* Overall Progress Ring */}
      <Card className="p-6 text-center bg-gradient-card">
        <ProgressRing progress={stats.overallProgress} size="lg" className="mx-auto mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.overallProgress}%</div>
            <div className="text-xs opacity-90">Completado</div>
          </div>
        </ProgressRing>
        <h3 className="text-lg font-semibold mb-2">Progreso General</h3>
        <p className="text-sm text-muted-foreground">
          Has completado {stats.completedModules} de {stats.totalModules} módulos
        </p>
      </Card>

      {/* Learning Modules Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Módulos Disponibles</h3>
        
        {modulesWithProgress.length === 0 ? (
          <Card className="p-8 text-center">
            <PlayCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay módulos disponibles</h3>
            <p className="text-muted-foreground">Los módulos de aprendizaje estarán disponibles pronto</p>
          </Card>
        ) : (
          modulesWithProgress.map((module) => (
            <Card key={module.id} className={`p-4 ${
              module.status === "locked" ? "opacity-60" : ""
            }`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(module.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{module.title}</h4>
                    <Badge className={`text-xs ${getStatusColor(module.status)}`}>
                      {module.status === "completed" ? "Completado" :
                       module.status === "in_progress" ? "En Progreso" :
                       module.status === "available" ? "Disponible" : "Bloqueado"}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">
                    {module.category === "Ventas" ? "Aprende técnicas efectivas para aumentar tus ventas" :
                     module.category === "Finanzas" ? "Controla tus gastos y maximiza tus ganancias" :
                     module.category === "Marketing" ? "Promociona tu negocio en redes sociales" :
                     module.category === "WhatsApp Business" ? "Optimiza WhatsApp Business para tu emprendimiento" :
                     "Desarrolla habilidades para hacer crecer tu negocio"}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      45 min
                    </span>
                    <span>{module.category}</span>
                  </div>
                  
                  {module.progress > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progreso</span>
                        <span className="text-xs font-medium">{module.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    disabled={module.status === "locked"}
                    className="w-full"
                    onClick={() => {
                      // Aquí podrías navegar a la página del módulo específico
                      console.log(`Abrir módulo: ${module.title}`);
                    }}
                  >
                    {module.status === "completed" ? "Revisar" :
                     module.status === "in_progress" ? "Continuar" : "Comenzar"}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Daily Challenge & Quick Actions - Corregido con datos reales */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center bg-gradient-warning text-white">
          <Award size={24} className="mx-auto mb-2" />
          <h4 className="font-semibold text-sm mb-1">Desafío Diario</h4>
          <p className="text-xs opacity-90 mb-3">¡Completa tu reto de hoy!</p>
          <Button 
            size="sm" 
            variant="secondary" 
            className="w-full"
            onClick={() => window.location.href = '/challenges'}
          >
            Ver Desafío
          </Button>
        </Card>
        
        <Card className="p-4 text-center bg-gradient-success text-white">
          <Target size={24} className="mx-auto mb-2" />
          <h4 className="font-semibold text-sm mb-1">Meta Semanal</h4>
          <p className="text-xs opacity-90 mb-3">
            {stats.completedModules} de {Math.min(stats.totalModules, 3)} módulos
          </p>
          <Button 
            size="sm" 
            variant="secondary" 
            className="w-full"
            onClick={() => {
              // Cambiar a la pestaña de progress
              const event = new CustomEvent('changeTab', { detail: 'progress' });
              window.dispatchEvent(event);
            }}
          >
            Ver Progreso
          </Button>
        </Card>
      </div>
    </div>
  );
};