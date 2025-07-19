import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  Share2,
  Save,
  Plus,
  Edit2,
  Trash2,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessMetric {
  id: string;
  period_date: string;
  revenue: number;
  customers_count: number;
  social_networks_active: number;
  notes: string;
  created_at: string;
}

const MonthlyReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<BusinessMetric[]>([]);
  const [editingMetric, setEditingMetric] = useState<BusinessMetric | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form data
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [revenue, setRevenue] = useState("");
  const [customersCount, setCustomersCount] = useState("");
  const [socialNetworks, setSocialNetworks] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      loadMetrics();
    }
  }, [user]);

  const loadMetrics = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('period_date', { ascending: false });

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast.error("Error al cargar los registros");
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setRevenue("");
    setCustomersCount("");
    setSocialNetworks("");
    setNotes("");
    setEditingMetric(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!user || !selectedDate) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);
    try {
      const metricData = {
        user_id: user.id,
        period_date: format(selectedDate, 'yyyy-MM-dd'),
        revenue: parseFloat(revenue) || 0,
        customers_count: parseInt(customersCount) || 0,
        social_networks_active: parseInt(socialNetworks) || 0,
        notes: notes.trim(),
        updated_at: new Date().toISOString(),
      };

      let result;
      if (editingMetric) {
        result = await supabase
          .from('business_metrics')
          .update(metricData)
          .eq('id', editingMetric.id)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('business_metrics')
          .insert([metricData]);
      }

      if (result.error) throw result.error;
      
      toast.success(editingMetric ? "Registro actualizado exitosamente" : "Registro creado exitosamente");
      resetForm();
      loadMetrics();
    } catch (error: any) {
      toast.error("Error al guardar el registro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (metric: BusinessMetric) => {
    setEditingMetric(metric);
    setSelectedDate(new Date(metric.period_date));
    setRevenue(metric.revenue.toString());
    setCustomersCount(metric.customers_count.toString());
    setSocialNetworks(metric.social_networks_active.toString());
    setNotes(metric.notes || "");
    setShowForm(true);
  };

  const handleDelete = async (metricId: string) => {
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar este registro?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('business_metrics')
        .delete()
        .eq('id', metricId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      toast.success("Registro eliminado exitosamente");
      loadMetrics();
    } catch (error: any) {
      toast.error("Error al eliminar el registro: " + error.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM yyyy', { locale: es });
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
              <h1 className="text-2xl font-bold">Registros Mensuales</h1>
              <p className="text-muted-foreground">Gestiona las métricas de tu negocio</p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2" size={16} />
            Nuevo Registro
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                {editingMetric ? "Editar Registro" : "Nuevo Registro Mensual"}
              </CardTitle>
              <CardDescription>
                Ingresa las métricas de tu negocio para este período
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Picker */}
                <div className="space-y-2">
                  <Label>Período (Mes/Año)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "MMMM yyyy", { locale: es }) : "Selecciona el mes"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Revenue */}
                <div className="space-y-2">
                  <Label htmlFor="revenue">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Ingresos del Mes
                  </Label>
                  <Input
                    id="revenue"
                    type="number"
                    placeholder="0.00"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Customers Count */}
                <div className="space-y-2">
                  <Label htmlFor="customers">
                    <Users className="inline h-4 w-4 mr-1" />
                    Número de Clientes
                  </Label>
                  <Input
                    id="customers"
                    type="number"
                    placeholder="0"
                    value={customersCount}
                    onChange={(e) => setCustomersCount(e.target.value)}
                    min="0"
                  />
                </div>

                {/* Social Networks */}
                <div className="space-y-2">
                  <Label htmlFor="social">
                    <Share2 className="inline h-4 w-4 mr-1" />
                    Redes Sociales Activas
                  </Label>
                  <Input
                    id="social"
                    type="number"
                    placeholder="0"
                    value={socialNetworks}
                    onChange={(e) => setSocialNetworks(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas y Observaciones</Label>
                <Textarea
                  id="notes"
                  placeholder="Escribe observaciones importantes sobre este período..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !selectedDate}
                  className="flex-1"
                >
                  <Save className="mr-2" size={16} />
                  {loading ? "Guardando..." : editingMetric ? "Actualizar" : "Guardar"}
                </Button>
                <Button 
                  onClick={resetForm}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics List */}
        <div className="space-y-4">
          {metrics.length === 0 ? (
            <Card className="p-8 text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay registros aún</h3>
              <p className="text-muted-foreground mb-4">
                Comienza a registrar las métricas mensuales de tu negocio
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2" size={16} />
                Crear Primer Registro
              </Button>
            </Card>
          ) : (
            metrics.map((metric) => (
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
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(metric)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(metric.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-success-light rounded-lg">
                      <DollarSign className="mx-auto h-6 w-6 text-success mb-2" />
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(metric.revenue)}
                      </p>
                      <p className="text-sm text-muted-foreground">Ingresos</p>
                    </div>
                    
                    <div className="text-center p-3 bg-primary-light rounded-lg">
                      <Users className="mx-auto h-6 w-6 text-primary mb-2" />
                      <p className="text-2xl font-bold text-primary">
                        {metric.customers_count}
                      </p>
                      <p className="text-sm text-muted-foreground">Clientes</p>
                    </div>
                    
                    <div className="text-center p-3 bg-warning-light rounded-lg">
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;