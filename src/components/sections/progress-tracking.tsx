import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, Users, DollarSign, Calendar, History } from "lucide-react";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const ProgressTracking = () => {
  const { 
    metrics, 
    loading, 
    getGrowthData, 
    getModuleProgress, 
    getLatestMetrics 
  } = useBusinessMetrics();

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
          <div className="h-64 bg-muted rounded mb-6"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const growthData = getGrowthData();
  const moduleProgress = getModuleProgress();
  const latestMetrics = getLatestMetrics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const hasData = metrics.length > 0;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tu Progreso</h2>
        <div className="flex gap-2">
          {latestMetrics.totalGrowth > 0 && (
            <Badge className="bg-success text-white">
              +{latestMetrics.totalGrowth}% crecimiento
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/monthly-report'}
          >
            <History className="mr-2" size={16} />
            Nuevo Registro
          </Button>
        </div>
      </div>

      {!hasData ? (
        <Card className="p-8 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Comienza a Registrar tu Progreso</h3>
          <p className="text-muted-foreground mb-4">
            Ingresa tus primeras métricas mensuales para ver tu progreso aquí
          </p>
          <Button onClick={() => window.location.href = '/monthly-report'}>
            Crear Primer Registro
          </Button>
        </Card>
      ) : (
        <>
          {/* Overall Progress Rings */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 text-center bg-gradient-primary text-white">
              <ProgressRing progress={latestMetrics.learningProgress} size="lg" className="mx-auto mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{latestMetrics.learningProgress}%</div>
                  <div className="text-xs opacity-90">Completado</div>
                </div>
              </ProgressRing>
              <p className="font-semibold">Progreso de Aprendizaje</p>
            </Card>

            <Card className="p-6 text-center bg-gradient-success text-white">
              <ProgressRing 
                progress={Math.min(latestMetrics.totalGrowth, 100)} 
                size="lg" 
                className="mx-auto mb-4"
              >
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {latestMetrics.totalGrowth > 0 ? '+' : ''}{latestMetrics.totalGrowth}%
                  </div>
                  <div className="text-xs opacity-90">Crecimiento</div>
                </div>
              </ProgressRing>
              <p className="font-semibold">Crecimiento del Negocio</p>
            </Card>
          </div>

          {/* Business Growth Chart */}
          {growthData.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="text-success" size={20} />
                Evolución de tu Negocio
              </h3>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                    <YAxis hide />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'ventas' ? formatCurrency(Number(value)) : value,
                        name === 'ventas' ? 'Ingresos' : name === 'clientes' ? 'Clientes' : 'Redes Sociales'
                      ]}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ventas" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clientes" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="redes" 
                      stroke="hsl(var(--warning))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--warning))", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Ingresos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Clientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Redes Sociales</span>
                </div>
              </div>
            </Card>
          )}

          {/* Before/After Module Impact */}
          {moduleProgress.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Impacto por Módulo (Calificación 1-10)</h3>
              
              <div className="space-y-4">
                {moduleProgress.map((module) => (
                  <div key={module.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{module.name}</span>
                      <div className="flex items-center gap-2">
                        {module.improvement > 0 && (
                          <Badge variant="secondary" className="bg-success-light text-success">
                            +{module.improvement}%
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {module.status === 'completed' ? 'Completado' : 
                           module.status === 'in_progress' ? 'En Progreso' : 'No Iniciado'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">Antes</p>
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-1 max-w-full bg-border rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-2 bg-muted-foreground rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((module.before / 10) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-right min-w-[24px]">{module.before}</span>
                        </div>
                      </div>
                      
                      <div className="bg-success-light p-3 rounded-lg">
                        <p className="text-xs text-success mb-2">Después</p>
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-1 max-w-full bg-border rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-2 bg-success rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((module.after / 10) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-right min-w-[24px] text-success">{module.after}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-gradient-warning text-white">
              <div className="flex items-center gap-3">
                <Users size={24} />
                <div>
                  <p className="text-xs opacity-90">Total Clientes</p>
                  <p className="text-2xl font-bold">{latestMetrics.totalCustomers}</p>
                  <p className="text-xs opacity-90">acumulados</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-primary text-white">
              <div className="flex items-center gap-3">
                <DollarSign size={24} />
                <div>
                  <p className="text-xs opacity-90">Ingresos</p>
                  <p className="text-xl font-bold">{formatCurrency(latestMetrics.currentRevenue)}</p>
                  <p className="text-xs opacity-90">último período</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Monthly Log */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-primary" size={20} />
                <h3 className="text-lg font-semibold">Registros Recientes</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Dispatch custom event to change tab to show detailed charts
                  const event = new CustomEvent('changeTab', { detail: 'progress' });
                  window.dispatchEvent(event);
                  // Also navigate to historical reports page with charts
                  window.location.href = '/historical-reports';
                }}
              >
                Ver Gráficas Detalladas
              </Button>
            </div>
            
            <div className="space-y-3">
              {metrics.slice(-2).reverse().map((metric, index) => {
                const date = new Date(metric.period_date);
                const monthYear = format(date, 'MMMM yyyy', { locale: es });
                const isLatest = index === 0;
                
                return (
                  <div 
                    key={metric.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isLatest ? 'bg-primary-light border border-primary/20' : 'bg-accent'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{monthYear}</p>
                      <p className="text-sm text-muted-foreground">
                        {metric.customers_count} clientes • {formatCurrency(metric.revenue)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={isLatest ? "default" : "outline"}
                      onClick={() => window.location.href = '/historical-reports'}
                      className={isLatest ? "bg-primary text-white" : ""}
                    >
                      {isLatest ? "Ver Detalle" : "Comparar"}
                    </Button>
                  </div>
                );
              })}
              
              {metrics.length < 2 && (
                <div className="flex items-center justify-between p-3 border-2 border-primary border-dashed rounded-lg">
                  <div>
                    <p className="font-medium">Próximo período</p>
                    <p className="text-sm text-muted-foreground">Define tus metas y registra tu progreso</p>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary">
                    Pendiente
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};