import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface DemoSetupProps {
  onComplete?: () => void;
}

export function DemoSetup({ onComplete }: DemoSetupProps) {
  const [loading, setLoading] = useState(false);

  const setupDemoData = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('setup_demo_account');
      
      if (error) {
        console.error('Error setting up demo data:', error);
        toast.error('Error al configurar los datos de demostración');
        return;
      }
      
      toast.success('¡Datos de demostración configurados exitosamente!');
      onComplete?.();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al configurar los datos de demostración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>¡Bienvenido a tu cuenta!</CardTitle>
        <CardDescription>
          Para explorar todas las funcionalidades de la aplicación, puedes configurar datos de demostración que incluyen:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span>Perfil de negocio completo (Café Central)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span>Progreso en módulos de capacitación</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span>6 meses de métricas de crecimiento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span>Logros desbloqueados</span>
          </div>
        </div>
        
        <div className="pt-4 space-y-2">
          <Button 
            onClick={setupDemoData} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Configurar datos de demostración
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onComplete}
            className="w-full"
            disabled={loading}
          >
            Continuar sin datos demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}