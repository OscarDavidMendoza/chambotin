
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode, Download, Share, Copy, Check, Phone, MessageCircle, Globe, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const GeneradorQR = () => {
  const navigate = useNavigate();
  const [qrType, setQrType] = useState("text");
  const [qrContent, setQrContent] = useState("");
  const [qrSize, setQrSize] = useState(200);
  const [copied, setCopied] = useState(false);

  // WhatsApp specific fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");

  // WiFi specific fields
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA");

  const generateQRContent = () => {
    switch (qrType) {
      case "whatsapp":
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const message = encodeURIComponent(whatsappMessage);
        return `https://wa.me/${cleanPhone}${message ? `?text=${message}` : ''}`;
      
      case "wifi":
        return `WIFI:T:${wifiSecurity};S:${wifiSSID};P:${wifiPassword};;`;
      
      case "email":
        return `mailto:${qrContent}`;
      
      case "phone":
        return `tel:${qrContent}`;
      
      case "url":
        return qrContent.startsWith('http') ? qrContent : `https://${qrContent}`;
      
      default:
        return qrContent;
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(generateQRContent())}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("¡Copiado al portapapeles!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Error al copiar");
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-code-${qrType}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("¡QR descargado!");
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Código QR',
          text: 'Mira este código QR que generé',
          url: qrUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard(qrUrl);
    }
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
            <QrCode className="text-primary" size={24} />
            <h1 className="text-2xl font-bold">Generador de QR</h1>
          </div>
        </div>

        {/* QR Type Tabs */}
        <Tabs value={qrType} onValueChange={setQrType} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="text-xs">Texto</TabsTrigger>
            <TabsTrigger value="whatsapp" className="text-xs">WhatsApp</TabsTrigger>
            <TabsTrigger value="url" className="text-xs">Web</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Card className="p-4">
              <Label htmlFor="text-content">Texto del QR</Label>
              <Textarea
                id="text-content"
                value={qrContent}
                onChange={(e) => setQrContent(e.target.value)}
                placeholder="Escribe el texto que quieres convertir en QR..."
                className="mt-2"
                rows={3}
              />
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="phone">Número de WhatsApp</Label>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="5212345678901 (incluye código de país)"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Incluye el código de país (México: 521...)
                  </p>
                </div>
                <div>
                  <Label htmlFor="message">Mensaje predefinido (opcional)</Label>
                  <Textarea
                    id="message"
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="¡Hola! Vi tu QR y me interesa tu producto..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <Card className="p-4">
              <Label htmlFor="url-content">URL del sitio web</Label>
              <Input
                id="url-content"
                value={qrContent}
                onChange={(e) => setQrContent(e.target.value)}
                placeholder="https://miempresa.com o miempresa.com"
                className="mt-2"
              />
            </Card>
          </TabsContent>
        </Tabs>

        {/* QR Preview */}
        {(qrContent || (qrType === "whatsapp" && phoneNumber)) && (
          <Card className="p-6 text-center mb-6">
            <h3 className="font-semibold mb-4">Vista Previa del QR</h3>
            <div className="flex justify-center mb-4">
              <img 
                src={qrUrl} 
                alt="QR Code" 
                className="border border-border rounded-lg"
                style={{ width: qrSize, height: qrSize }}
              />
            </div>
            
            {/* Size Control */}
            <div className="mb-4">
              <Label className="text-sm">Tamaño: {qrSize}px</Label>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQrSize(Math.max(150, qrSize - 50))}
                >
                  -
                </Button>
                <Badge variant="outline" className="px-3">{qrSize}px</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQrSize(Math.min(400, qrSize + 50))}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generateQRContent())}
                className="flex items-center gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "¡Copiado!" : "Copiar"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQR}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Descargar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={shareQR}
                className="flex items-center gap-2"
              >
                <Share size={16} />
                Compartir
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Templates */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Plantillas Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQrType("whatsapp");
                setWhatsappMessage("¡Hola! Me interesa conocer más sobre tus productos.");
              }}
              className="justify-start"
            >
              <MessageCircle size={16} className="mr-2" />
              WhatsApp Ventas
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQrType("url");
                setQrContent("https://instagram.com/");
              }}
              className="justify-start"
            >
              <Globe size={16} className="mr-2" />
              Instagram
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQrType("text");
                setQrContent("¡Gracias por tu compra! Síguenos en redes sociales para ofertas especiales.");
              }}
              className="justify-start"
            >
              <QrCode size={16} className="mr-2" />
              Agradecimiento
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQrType("text");
                setQrContent("WiFi: MiEmpresa | Contraseña: 12345678");
              }}
              className="justify-start"
            >
              <Phone size={16} className="mr-2" />
              WiFi Info
            </Button>
          </div>
        </Card>

        {/* Usage Tips */}
        <Card className="p-6 mt-6">
          <h3 className="font-semibold mb-3">💡 Consejos de Uso</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Prueba el QR antes de imprimirlo</p>
            <p>• Usa tamaño mínimo de 200px para impresión</p>
            <p>• Coloca el QR en lugares visibles</p>
            <p>• Incluye una llamada a la acción clara</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GeneradorQR;
