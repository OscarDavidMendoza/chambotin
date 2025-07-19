import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface CreditOffer {
  id: string;
  name: string;
  type: 'equipment' | 'working_capital' | 'expansion' | 'emergency';
  amount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  requirements: string[];
  benefits: string[];
  eligible: boolean;
  eligibilityScore: number;
}

export const CreditOffers = () => {
  const { metrics, getLatestMetrics } = useBusinessMetrics();
  const [offers, setOffers] = useState<CreditOffer[]>([]);
  const [eligibilityAnalysis, setEligibilityAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (metrics.length > 0) {
      analyzeEligibility();
    }
  }, [metrics]);

  const analyzeEligibility = () => {
    setLoading(true);
    
    const latestMetrics = getLatestMetrics();
    const recentMetrics = metrics.slice(-6); // Últimos 6 meses
    
    // Calcular métricas clave
    const avgRevenue = recentMetrics.reduce((sum, m) => sum + m.revenue, 0) / recentMetrics.length;
    const avgCustomers = recentMetrics.reduce((sum, m) => sum + m.customers_count, 0) / recentMetrics.length;
    const revenueGrowth = latestMetrics.totalGrowth;
    const monthsOfData = recentMetrics.length;
    
    // Estimar costos (70% de ingresos como estimación conservadora)
    const estimatedCosts = avgRevenue * 0.7;
    const netProfit = avgRevenue - estimatedCosts;
    const profitMargin = (netProfit / avgRevenue) * 100;
    
    // Calcular score de elegibilidad
    let eligibilityScore = 0;
    
    // Factores de evaluación
    if (monthsOfData >= 3) eligibilityScore += 20;
    if (monthsOfData >= 6) eligibilityScore += 10;
    if (avgRevenue >= 10000) eligibilityScore += 25;
    if (avgRevenue >= 50000) eligibilityScore += 15;
    if (revenueGrowth > 0) eligibilityScore += 20;
    if (revenueGrowth > 20) eligibilityScore += 10;
    if (profitMargin > 20) eligibilityScore += 15;
    if (avgCustomers >= 50) eligibilityScore += 10;
    
    const analysis = {
      avgRevenue,
      avgCustomers,
      revenueGrowth,
      netProfit,
      profitMargin,
      eligibilityScore: Math.min(eligibilityScore, 100),
      monthsOfData
    };
    
    setEligibilityAnalysis(analysis);
    generateOffers(analysis);
    setLoading(false);
  };

  const generateOffers = (analysis: any) => {
    const { avgRevenue, eligibilityScore, netProfit } = analysis;
    
    const creditOffers: CreditOffer[] = [
      {
        id: 'equipment',
        name: 'Crédito para Equipo',
        type: 'equipment',
        amount: Math.min(avgRevenue * 0.5, 100000),
        interestRate: eligibilityScore > 70 ? 15.9 : 18.9,
        termMonths: 24,
        monthlyPayment: 0,
        requirements: [
          'Mínimo 3 meses de ventas registradas',
          'Ingresos promedio de $10,000+ mensuales',
          'Facturación electrónica vigente'
        ],
        benefits: [
          'Sin garantías adicionales',
          'Aprobación en 48 horas',
          'Pagos flexibles'
        ],
        eligible: eligibilityScore >= 50 && avgRevenue >= 10000,
        eligibilityScore
      },
      {
        id: 'working_capital',
        name: 'Capital de Trabajo',
        type: 'working_capital',
        amount: Math.min(avgRevenue * 1.2, 200000),
        interestRate: eligibilityScore > 80 ? 14.9 : 17.9,
        termMonths: 12,
        monthlyPayment: 0,
        requirements: [
          'Mínimo 6 meses de operación',
          'Crecimiento positivo en ventas',
          'Margen de ganancia del 15%+'
        ],
        benefits: [
          'Uso libre del capital',
          'Renovación automática',
          'Sin comisiones por apertura'
        ],
        eligible: eligibilityScore >= 65 && analysis.monthsOfData >= 6 && analysis.revenueGrowth > 0,
        eligibilityScore
      },
      {
        id: 'expansion',
        name: 'Crédito de Expansión',
        type: 'expansion',
        amount: Math.min(avgRevenue * 2, 500000),
        interestRate: eligibilityScore > 85 ? 13.9 : 16.9,
        termMonths: 36,
        monthlyPayment: 0,
        requirements: [
          'Historial de 6+ meses',
          'Crecimiento sostenido del 20%+',
          'Plan de expansión detallado'
        ],
        benefits: [
          'Montos hasta $500,000',
          'Plazo extendido',
          'Asesoría empresarial incluida'
        ],
        eligible: eligibilityScore >= 80 && analysis.revenueGrowth >= 20 && avgRevenue >= 50000,
        eligibilityScore
      },
      {
        id: 'emergency',
        name: 'Fondo de Emergencia',
        type: 'emergency',
        amount: Math.min(avgRevenue * 0.3, 50000),
        interestRate: 19.9,
        termMonths: 6,
        monthlyPayment: 0,
        requirements: [
          'Registro básico de ventas',
          'Identificación oficial',
          'Comprobante de ingresos'
        ],
        benefits: [
          'Aprobación inmediata',
          'Disponible 24/7',
          'Sin papelería extensa'
        ],
        eligible: eligibilityScore >= 30,
        eligibilityScore
      }
    ];

    // Calcular pagos mensuales
    creditOffers.forEach(offer => {
      const monthlyRate = (offer.interestRate / 100) / 12;
      const payment = (offer.amount * monthlyRate * Math.pow(1 + monthlyRate, offer.termMonths)) / 
                     (Math.pow(1 + monthlyRate, offer.termMonths) - 1);
      offer.monthlyPayment = Math.round(payment);
    });

    setOffers(creditOffers);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'equipment': return <CreditCard className="h-6 w-6" />;
      case 'working_capital': return <TrendingUp className="h-6 w-6" />;
      case 'expansion': return <ArrowRight className="h-6 w-6" />;
      case 'emergency': return <Shield className="h-6 w-6" />;
      default: return <DollarSign className="h-6 w-6" />;
    }
  };

  const handleApplyForCredit = (offer: CreditOffer) => {
    toast.success(`Solicitud iniciada para ${offer.name}. Un ejecutivo te contactará pronto.`);
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!eligibilityAnalysis) {
    return (
      <div className="space-y-6 pb-20">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Datos Insuficientes</h3>
          <p className="text-muted-foreground mb-4">
            Necesitas registrar al menos 3 meses de métricas para evaluar tu elegibilidad crediticia
          </p>
          <Button onClick={() => window.location.href = '/monthly-report'}>
            Registrar Métricas
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Ofertas de Crédito Coppel</h2>
          <p className="text-muted-foreground">Productos financieros personalizados para tu negocio</p>
        </div>
        <div className="flex justify-center sm:justify-end">
          <Badge variant={eligibilityAnalysis.eligibilityScore >= 70 ? "default" : "secondary"} className="text-sm px-4 py-2">
            Score: {eligibilityAnalysis.eligibilityScore}/100
          </Badge>
        </div>
      </div>

      {/* Análisis de Elegibilidad */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tu Perfil Crediticio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="text-center space-y-1 p-2 bg-background/50 rounded-lg min-h-[80px] flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Ingresos Promedio</p>
              <p className="text-[10px] font-bold leading-tight">{formatCurrency(eligibilityAnalysis.avgRevenue)}</p>
            </div>
            <div className="text-center space-y-1 p-2 bg-background/50 rounded-lg min-h-[80px] flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Ganancia Neta Est.</p>
              <p className="text-[10px] font-bold leading-tight">{formatCurrency(eligibilityAnalysis.netProfit)}</p>
            </div>
            <div className="text-center space-y-1 p-2 bg-background/50 rounded-lg min-h-[80px] flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Crecimiento</p>
              <p className="text-xs font-bold text-success">+{eligibilityAnalysis.revenueGrowth}%</p>
            </div>
            <div className="text-center space-y-1 p-2 bg-background/50 rounded-lg min-h-[80px] flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">Historial</p>
              <p className="text-xs font-bold">{eligibilityAnalysis.monthsOfData} meses</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Elegibilidad Crediticia</span>
              <span className="font-medium">{eligibilityAnalysis.eligibilityScore}%</span>
            </div>
            <Progress value={eligibilityAnalysis.eligibilityScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Ofertas de Crédito */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <Card key={offer.id} className={`relative ${offer.eligible ? 'border-primary shadow-lg' : 'opacity-75'}`}>
            {offer.eligible && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-success text-white">Disponible</Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${offer.eligible ? 'bg-primary text-white' : 'bg-muted'}`}>
                  {getOfferIcon(offer.type)}
                </div>
                {offer.name}
              </CardTitle>
              <CardDescription>
                {offer.eligible ? 'Producto disponible para tu perfil' : 'No cumples los requisitos actuales'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Monto</p>
                        <p className="text-[11px] font-bold text-primary leading-tight">{formatCurrency(offer.amount)}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-xs text-muted-foreground">Tasa Anual</p>
                        <p className="text-sm font-bold">{offer.interestRate}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Plazo</p>
                        <p className="text-sm font-semibold">{offer.termMonths} meses</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-xs text-muted-foreground">Pago Mensual</p>
                        <p className="text-[11px] font-semibold leading-tight">{formatCurrency(offer.monthlyPayment)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-3">Requisitos:</p>
                  <ul className="text-sm space-y-2">
                    {offer.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                        <span className="flex-1">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">Beneficios:</p>
                  <ul className="text-sm space-y-2">
                    {offer.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button 
                onClick={() => handleApplyForCredit(offer)}
                disabled={!offer.eligible}
                className="w-full"
                variant={offer.eligible ? "default" : "outline"}
              >
                {offer.eligible ? 'Solicitar Ahora' : 'No Disponible'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información Adicional */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-1" />
            <div className="space-y-1">
              <p className="font-medium">Información Importante</p>
              <p className="text-sm text-muted-foreground">
                Las ofertas se basan en tu historial de ventas y métricas de negocio. Los montos y tasas son referenciales 
                y están sujetos a evaluación crediticia final. Mejora tu elegibilidad manteniendo un crecimiento sostenido 
                y registrando consistentemente tus métricas mensuales.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};