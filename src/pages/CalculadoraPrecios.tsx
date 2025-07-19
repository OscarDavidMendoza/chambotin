
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator, DollarSign, Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CalculadoraPrecios = () => {
  const navigate = useNavigate();
  const [costoMateria, setCostoMateria] = useState<number>(0);
  const [costoManoObra, setCostoManoObra] = useState<number>(0);
  const [gastosOperativos, setGastosOperativos] = useState<number>(0);
  const [margenGanancia, setMargenGanancia] = useState<number>(40);
  const [impuestos, setImpuestos] = useState<number>(16);

  const calcularPrecio = () => {
    const costoTotal = costoMateria + costoManoObra + gastosOperativos;
    const precioConMargen = costoTotal * (1 + margenGanancia / 100);
    const precioFinal = precioConMargen * (1 + impuestos / 100);
    return {
      costoTotal,
      precioConMargen,
      precioFinal,
      ganancia: precioFinal - costoTotal
    };
  };

  const precios = calcularPrecio();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBackClick}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Calculator className="text-primary" size={24} />
            <h1 className="text-2xl font-bold">Calculadora de Precios</h1>
          </div>
        </div>

        {/* Cost Inputs */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="text-success" size={20} />
              Costos del Producto
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="materia">Costo de Materia Prima</Label>
                <Input
                  id="materia"
                  type="number"
                  value={costoMateria || ''}
                  onChange={(e) => setCostoMateria(Number(e.target.value))}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="mano-obra">Costo de Mano de Obra</Label>
                <Input
                  id="mano-obra"
                  type="number"
                  value={costoManoObra || ''}
                  onChange={(e) => setCostoManoObra(Number(e.target.value))}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="operativos">Gastos Operativos</Label>
                <Input
                  id="operativos"
                  type="number"
                  value={gastosOperativos || ''}
                  onChange={(e) => setGastosOperativos(Number(e.target.value))}
                  placeholder="0.00"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Incluye: renta, electricidad, marketing, etc.
                </p>
              </div>
            </div>
          </Card>

          {/* Margin Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Configuración de Márgenes</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Margen de Ganancia (%)</Label>
                  <Badge variant="outline">{margenGanancia}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMargenGanancia(Math.max(0, margenGanancia - 5))}
                  >
                    <Minus size={16} />
                  </Button>
                  <Input
                    type="number"
                    value={margenGanancia}
                    onChange={(e) => setMargenGanancia(Number(e.target.value))}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMargenGanancia(margenGanancia + 5)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Impuestos (%)</Label>
                  <Badge variant="outline">{impuestos}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImpuestos(Math.max(0, impuestos - 1))}
                  >
                    <Minus size={16} />
                  </Button>
                  <Input
                    type="number"
                    value={impuestos}
                    onChange={(e) => setImpuestos(Number(e.target.value))}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImpuestos(impuestos + 1)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-6 bg-gradient-primary text-white">
            <h2 className="text-lg font-semibold mb-4">Resultado del Cálculo</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="opacity-90">Costo Total:</span>
                <span className="font-semibold">{formatCurrency(precios.costoTotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="opacity-90">Precio + Margen:</span>
                <span className="font-semibold">{formatCurrency(precios.precioConMargen)}</span>
              </div>
              
              <div className="border-t border-white/20 pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Precio Final:</span>
                  <span className="font-bold">{formatCurrency(precios.precioFinal)}</span>
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="opacity-90">Ganancia Neta:</span>
                <span className="font-semibold text-success-light">
                  {formatCurrency(precios.ganancia)}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Presets */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Márgenes Recomendados</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMargenGanancia(30)}
                className="justify-start"
              >
                Servicios (30%)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMargenGanancia(50)}
                className="justify-start"
              >
                Productos (50%)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMargenGanancia(70)}
                className="justify-start"
              >
                Artesanías (70%)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMargenGanancia(100)}
                className="justify-start"
              >
                Premium (100%)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalculadoraPrecios;
