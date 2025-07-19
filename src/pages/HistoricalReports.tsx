import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { 
  ArrowLeft, 
  Calendar,
  DollarSign,
  Users,
  Share2,
  TrendingUp,
  Search,
  Filter,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const HistoricalReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { metrics, loading, getGrowthData } = useBusinessMetrics();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMetrics, setFilteredMetrics] = useState(metrics);

  useEffect(() => {
    if (!loading) {
      const filtered = metrics.filter(metric => {
        const date = new Date(metric.period_date);
        const monthYear = format(date, 'MMMM yyyy', { locale: es });
        return monthYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
               metric.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredMetrics(filtered);
    }
  }, [metrics, searchTerm, loading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM yyyy', { locale: es });
  };

  const getTotalStats = () => {
    return {
      totalRevenue: metrics.reduce((sum, m) => sum + m.revenue, 0),
      totalCustomers: metrics.reduce((sum, m) => sum + m.customers_count, 0),
      avgSocialNetworks: Math.round(metrics.reduce((sum, m) => sum + m.social_networks_active, 0) / metrics.length) || 0,
      periodsCovered: metrics.length
    };
  };

  const growthData = getGrowthData();
  const totalStats = getTotalStats();

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Reportes Históricos</h1>
              <p className="text-muted-foreground">Analiza la evolución de tu negocio</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2" size={16} />
              Exportar
            </Button>
            <Button onClick={() => navigate("/monthly-report")}>
              Nuevo Registro
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-success text-white">
            <div className="flex items-center gap-3">
              <DollarSign size={24} />
              <div>
                <p className="text-xs opacity-90">Total Ingresos</p>
                <p className="text-lg font-bold">{formatCurrency(totalStats.totalRevenue)}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-primary text-white">
            <div className="flex items-center gap-3">
              <Users size={24} />
              <div>
                <p className="text-xs opacity-90">Total Clientes</p>
                <p className="text-lg font-bold">{totalStats.totalCustomers}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-warning text-white">
            <div className="flex items-center gap-3">
              <Share2 size={24} />
              <div>
                <p className="text-xs opacity-90">Promedio Redes</p>
                <p className="text-lg font-bold">{totalStats.avgSocialNetworks}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-card">
            <div className="flex items-center gap-3">
              <Calendar size={24} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Períodos</p>
                <p className="text-lg font-bold text-foreground">{totalStats.periodsCovered}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Growth Chart */}
        {growthData.length > 0 && (
          <Card className="p-6 mb-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-success" size={20} />
                Evolución Histórica
              </CardTitle>
              <CardDescription>
                Progresión de ingresos y clientes a lo largo del tiempo
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="h-80 w-full">
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
                      dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clientes" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="redes" 
                      stroke="hsl(var(--warning))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--warning))", strokeWidth: 2, r: 4 }}
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
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar por período o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2" size={16} />
              Filtros
            </Button>
          </div>
        </Card>

        {/* Historical Records */}
        <div className="space-y-4">
          {filteredMetrics.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {metrics.length === 0 ? "No hay registros históricos" : "No se encontraron resultados"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {metrics.length === 0 
                  ? "Comienza a registrar las métricas mensuales de tu negocio"
                  : "Intenta con otros términos de búsqueda"
                }
              </p>
              {metrics.length === 0 && (
                <Button onClick={() => navigate("/monthly-report")}>
                  Crear Primer Registro
                </Button>
              )}
            </Card>
          ) : (
            filteredMetrics.map((metric, index) => {
              const prevMetric = index > 0 ? filteredMetrics[index - 1] : null;
              const revenueGrowth = prevMetric 
                ? ((metric.revenue - prevMetric.revenue) / prevMetric.revenue) * 100 
                : 0;
              const customerGrowth = prevMetric 
                ? metric.customers_count - prevMetric.customers_count 
                : 0;

              return (
                <Card key={metric.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {formatDate(metric.period_date)}
                        </CardTitle>
                        <CardDescription>
                          Registrado el {format(new Date(metric.created_at), 'dd/MM/yyyy')}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {revenueGrowth !== 0 && (
                          <Badge 
                            variant={revenueGrowth > 0 ? "default" : "destructive"}
                            className={revenueGrowth > 0 ? "bg-success text-white" : ""}
                          >
                            {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-4 bg-success-light rounded-lg">
                        <DollarSign className="mx-auto h-6 w-6 text-success mb-2" />
                        <p className="text-2xl font-bold text-success">
                          {formatCurrency(metric.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">Ingresos</p>
                        {prevMetric && (
                          <p className="text-xs text-success">
                            {revenueGrowth > 0 ? '+' : ''}{formatCurrency(metric.revenue - prevMetric.revenue)}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-center p-4 bg-primary-light rounded-lg">
                        <Users className="mx-auto h-6 w-6 text-primary mb-2" />
                        <p className="text-2xl font-bold text-primary">
                          {metric.customers_count}
                        </p>
                        <p className="text-sm text-muted-foreground">Clientes</p>
                        {customerGrowth !== 0 && (
                          <p className="text-xs text-primary">
                            {customerGrowth > 0 ? '+' : ''}{customerGrowth} clientes
                          </p>
                        )}
                      </div>
                      
                      <div className="text-center p-4 bg-warning-light rounded-lg">
                        <Share2 className="mx-auto h-6 w-6 text-warning mb-2" />
                        <p className="text-2xl font-bold text-warning">
                          {metric.social_networks_active}
                        </p>
                        <p className="text-sm text-muted-foreground">Redes Sociales</p>
                      </div>
                    </div>
                    
                    {metric.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Notas:</p>
                        <p className="text-sm text-muted-foreground">{metric.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricalReports;