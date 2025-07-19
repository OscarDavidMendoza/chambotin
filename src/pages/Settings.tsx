import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Smartphone,
  Building,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile form data
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    whatsapp: true,
    achievements: true
  });

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

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setBusinessName(data.business_name || '');
        setBusinessType(data.business_type || '');
        setPhoneNumber(data.phone_number || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          business_name: businessName,
          business_type: businessType,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      toast.success("Perfil actualizado exitosamente");
      loadProfile();
    } catch (error: any) {
      toast.error("Error al actualizar el perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      toast.error("Por favor ingresa tu contraseña actual");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Por favor ingresa una nueva contraseña");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("La nueva contraseña debe ser diferente a la actual");
      return;
    }

    setLoading(true);
    try {
      // First verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });

      if (verifyError) {
        toast.error("La contraseña actual es incorrecta");
        return;
      }

      // If verification successful, update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success("Contraseña actualizada exitosamente");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast.error("Error al cambiar la contraseña: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer."
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      // First delete the profile
      if (profile) {
        await supabase
          .from('profiles')
          .delete()
          .eq('user_id', user?.id);
      }
      
      toast.success("Cuenta eliminada exitosamente");
      await signOut();
      navigate("/");
    } catch (error: any) {
      toast.error("Error al eliminar la cuenta: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupDemoData = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('setup_demo_account');
      
      if (error) {
        console.error('Error setting up demo data:', error);
        toast.error('Error al configurar los datos de demostración');
        return;
      }
      
      toast.success('¡Datos de demostración configurados exitosamente!');
      loadProfile();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al configurar los datos de demostración');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) {
      toast.error("No se pudo obtener tu email");
      return;
    }

    const confirmed = window.confirm(
      "¿Deseas recibir un enlace para restablecer tu contraseña en tu email?"
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: redirectUrl
      });

      if (error) throw error;
      
      toast.success("Se ha enviado un enlace de restablecimiento a tu email");
    } catch (error: any) {
      toast.error("Error al enviar el enlace: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Configuración</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tu información personal y de negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="display-name">Nombre Completo</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="business-name">
                    <Building className="inline h-4 w-4 mr-1" />
                    Nombre del Negocio
                  </Label>
                  <Input
                    id="business-name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Nombre de tu negocio"
                  />
                </div>
                
                <div>
                  <Label htmlFor="business-type">Tipo de Negocio</Label>
                  <Input
                    id="business-type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="ej: Comida, Ropa, Servicios"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone-number">
                    <Smartphone className="inline h-4 w-4 mr-1" />
                    Número de WhatsApp
                  </Label>
                  <Input
                    id="phone-number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSaveProfile} 
                disabled={loading}
                className="w-full"
              >
                <Save className="mr-2" size={16} />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificaciones por Email</p>
                  <p className="text-sm text-muted-foreground">Recibe actualizaciones por correo</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, email: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificaciones Push</p>
                  <p className="text-sm text-muted-foreground">Notificaciones en el navegador</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, push: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">WhatsApp Mentor</p>
                  <p className="text-sm text-muted-foreground">Mensajes del mentor por WhatsApp</p>
                </div>
                <Switch
                  checked={notifications.whatsapp}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, whatsapp: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Logros y Progreso</p>
                  <p className="text-sm text-muted-foreground">Notificaciones de nuevos logros</p>
                </div>
                <Switch
                  checked={notifications.achievements}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, achievements: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                Seguridad
              </CardTitle>
              <CardDescription>
                Gestiona la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-email">Email Actual</Label>
                <Input
                  id="current-email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor="current-password">Contraseña Actual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa una nueva contraseña"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleChangePassword} 
                  disabled={loading || !currentPassword.trim() || !newPassword.trim()}
                  variant="outline"
                  className="w-full"
                >
                  Cambiar Contraseña
                </Button>
                
                <Button 
                  onClick={handleForgotPassword}
                  disabled={loading}
                  variant="ghost"
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  ¿Olvidaste tu contraseña? Recibir enlace por email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Data Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={20} />
                Datos de Demostración
              </CardTitle>
              <CardDescription>
                Configura datos de ejemplo para explorar todas las funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Los datos de demostración incluyen:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Perfil de negocio completo (Café Central)</li>
                    <li>Progreso en módulos de capacitación</li>
                    <li>6 meses de métricas de crecimiento</li>
                    <li>Logros desbloqueados</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleSetupDemoData}
                  disabled={loading}
                  className="w-full"
                >
                  <Sparkles className="mr-2" size={16} />
                  {loading ? "Configurando..." : "Configurar Datos de Demostración"}
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Esta acción sobrescribirá tus datos actuales con datos de ejemplo.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 size={20} />
                Zona Peligrosa
              </CardTitle>
              <CardDescription>
                Acciones irreversibles para tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleDeleteAccount}
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="mr-2" size={16} />
                Eliminar Cuenta Permanentemente
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;