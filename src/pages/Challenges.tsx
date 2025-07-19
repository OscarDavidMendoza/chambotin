import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Trophy,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  Star,
  Zap,
  Award,
  TrendingUp
} from "lucide-react";

const Challenges = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { metrics, userProgress, modules, getLatestMetrics } = useBusinessMetrics();

  if (!user) {
    navigate("/auth");
    return null;
  }

  const latestMetrics = getLatestMetrics();
  const completedModules = userProgress.filter(p => p.status === 'completed').length;

  // Desafíos basados en datos reales
  const dailyChallenges = [
    {
      id: 1,
      title: "Registra las ventas de hoy",
      description: "Anota al menos 3 ventas en tu registro mensual",
      points: 50,
      timeLimit: "24 horas",
      difficulty: "Fácil",
      category: "Finanzas",
      completed: metrics.length > 0,
      progress: Math.min(metrics.length, 3),
      total: 3
    },
    {
      id: 2,
      title: "Completa un módulo de aprendizaje",
      description: "Termina cualquier módulo disponible",
      points: 100,
      timeLimit: "24 horas", 
      difficulty: "Medio",
      category: "Aprendizaje",
      completed: completedModules > 0,
      progress: completedModules,
      total: 1
    }
  ];

  const weeklyChallenges = [
    {
      id: 1,
      title: "Completa 5 módulos esta semana",
      description: "Termina al menos 5 módulos de aprendizaje",
      points: 300,
      timeLimit: "7 días",
      difficulty: "Medio",
      category: "Aprendizaje",
      completed: completedModules >= 5,
      progress: completedModules,
      total: 5
    },
    {
      id: 2,
      title: "Registra ventas diarias",
      description: "Anota ventas todos los días de la semana",
      points: 500,
      timeLimit: "7 días",
      difficulty: "Difícil",
      category: "Finanzas",
      completed: false,
      progress: Math.min(metrics.length, 7),
      total: 7
    }
  ];

  const achievements = [
    {
      icon: "🚀",
      name: "Primer Paso",
      description: "Completaste tu primer módulo",
      unlocked: completedModules >= 1
    },
    {
      icon: "💰",
      name: "Primera Venta",
      description: "Registraste tu primera venta",
      unlocked: metrics.length >= 1
    },
    {
      icon: "📈",
      name: "Emprendedor Activo",
      description: "Completaste 3 módulos",
      unlocked: completedModules >= 3
    },
    {
      icon: "🏆",
      name: "Maestro del Negocio",
      description: "Completaste 10 módulos",
      unlocked: completedModules >= 10
    },
    {
      icon: "💎",
      name: "Vendedor Pro",
      description: "Registraste 20 ventas",
      unlocked: metrics.length >= 20
    },
    {
      icon: "🌟",
      name: "Emprendedor Elite",
      description: "Alcanzaste el nivel máximo",
      unlocked: latestMetrics.learningProgress >= 90
    }
  ];

  const userStats = {
    totalPoints: (completedModules * 100) + (metrics.length * 50),
    currentStreak: Math.min(metrics.length, 30),
    challengesCompleted: completedModules + metrics.length,
    rank: latestMetrics.learningProgress > 75 ? "Emprendedor Elite" : 
          latestMetrics.learningProgress > 50 ? "Emprendedor Avanzado" : 
          latestMetrics.learningProgress > 25 ? "Emprendedor Intermedio" : "Emprendedor Inicial"
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return "bg-success text-white";
      case "Medio": return "bg-warning text-white";
      case "Difícil": return "bg-destructive text-white";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Desafíos y Logros</h1>
            <p className="text-muted-foreground">Completa retos diarios y gana puntos</p>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center bg-gradient-primary text-white">
            <Trophy size={24} className="mx-auto mb-2" />
            <div className="text-xl font-bold">{userStats.totalPoints}</div>
            <div className="text-xs opacity-90">Puntos Totales</div>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-warning text-white">
            <Zap size={24} className="mx-auto mb-2" />
            <div className="text-xl font-bold">{userStats.currentStreak}</div>
            <div className="text-xs opacity-90">Días Consecutivos</div>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-success text-white">
            <CheckCircle size={24} className="mx-auto mb-2" />
            <div className="text-xl font-bold">{userStats.challengesCompleted}</div>
            <div className="text-xs opacity-90">Completados</div>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-card">
            <Star size={24} className="mx-auto mb-2 text-primary" />
            <div className="text-sm font-bold text-primary">{userStats.rank}</div>
            <div className="text-xs text-muted-foreground">Rango Actual</div>
          </Card>
        </div>

        {/* Daily Challenges */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-primary" size={20} />
              Desafíos Diarios
            </CardTitle>
            <CardDescription>
              Completa estos retos antes de que termine el día
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dailyChallenges.map((challenge) => (
              <Card key={challenge.id} className={`p-4 ${challenge.completed ? 'bg-success-light' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{challenge.title}</h4>
                      {challenge.completed && <CheckCircle className="text-success" size={16} />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {challenge.timeLimit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy size={12} />
                        {challenge.points} puntos
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progreso: {challenge.progress}/{challenge.total}</span>
                    <span>{Math.round((challenge.progress / challenge.total) * 100)}%</span>
                  </div>
                  <Progress value={(challenge.progress / challenge.total) * 100} className="h-2" />
                </div>
                
                {!challenge.completed && (
                  <Button className="w-full mt-3" size="sm">
                    Continuar Desafío
                  </Button>
                )}
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Challenges */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-warning" size={20} />
              Desafíos Semanales
            </CardTitle>
            <CardDescription>
              Retos de mayor duración con recompensas especiales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyChallenges.map((challenge) => (
              <Card key={challenge.id} className={`p-4 ${challenge.completed ? 'bg-success-light' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{challenge.title}</h4>
                      {challenge.completed && <CheckCircle className="text-success" size={16} />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {challenge.timeLimit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy size={12} />
                        {challenge.points} puntos
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progreso: {challenge.progress}/{challenge.total}</span>
                    <span>{Math.round((challenge.progress / challenge.total) * 100)}%</span>
                  </div>
                  <Progress value={(challenge.progress / challenge.total) * 100} className="h-2" />
                </div>
                
                {!challenge.completed && (
                  <Button className="w-full mt-3" size="sm" variant="outline">
                    Ver Detalles
                  </Button>
                )}
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="text-warning" size={20} />
              Logros Desbloqueados
            </CardTitle>
            <CardDescription>
              Insignias que has ganado en tu camino emprendedor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <Card 
                  key={index} 
                  className={`p-4 text-center ${
                    achievement.unlocked 
                      ? 'bg-warning-light border-warning' 
                      : 'bg-muted border-muted opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-sm mb-1">{achievement.name}</h4>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {achievement.unlocked && (
                    <Badge className="mt-2 bg-warning text-white">Desbloqueado</Badge>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Challenges;