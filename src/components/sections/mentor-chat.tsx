import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Lightbulb, Calculator, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender: "user" | "mentor";
  timestamp: Date;
  type?: "suggestion" | "tool" | "normal";
}

export const MentorChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy tu mentor digital. Estoy aquí para ayudarte con cualquier duda sobre tu negocio. ¿En qué puedo ayudarte hoy?",
      sender: "mentor",
      timestamp: new Date(),
    }
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const quickActions = [
    { 
      id: "whatsapp-setup", 
      label: "¿Cómo configurar WhatsApp Business?", 
      icon: Calculator,
      response: "Te ayudo a configurar WhatsApp Business paso a paso:\n\n1. Descarga WhatsApp Business desde la tienda\n2. Registra tu número comercial\n3. Crea tu perfil con logo y descripción\n4. Configura mensajes de bienvenida automáticos\n5. Organiza tus contactos en listas\n\n¿Ya tienes la app descargada?"
    },
    { 
      id: "sales-strategy", 
      label: "¿Cómo aumentar mis ventas?", 
      icon: Lightbulb,
      response: "Estrategias probadas para aumentar ventas:\n\n1. Conoce bien a tu cliente ideal\n2. Crea ofertas irresistibles con urgencia\n3. Usa testimonios y casos de éxito\n4. Implementa seguimiento post-venta\n5. Aprovecha las redes sociales\n\n¿En qué canal vendes más actualmente?"
    },
    { 
      id: "financial-planning", 
      label: "¿Cómo hacer un plan financiero?", 
      icon: HelpCircle,
      response: "Plan financiero básico para tu negocio:\n\n1. Calcula tus gastos fijos mensuales\n2. Establece metas de ingresos realistas\n3. Separa el 20% para emergencias\n4. Reinvierte el 30% en crecimiento\n5. Registra todo en una hoja de cálculo\n\n¿Tienes ya controlados tus gastos mensuales?"
    }
  ];

  const handleSendMessage = async (content: string) => {
    if (!user) {
      toast.error("Please sign in to chat with your mentor");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      // Call the WhatsApp mentor edge function
      const { data, error } = await supabase.functions.invoke('whatsapp-mentor', {
        body: {
          message: content,
          user_id: user.id
        }
      });

      if (error) throw error;

      const mentorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "mentor", 
        timestamp: new Date(),
        type: "suggestion"
      };
      setMessages(prev => [...prev, mentorResponse]);
    } catch (error: any) {
      toast.error("Failed to get mentor response. Please try again.");
      console.error('Error calling mentor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    handleSendMessage(action.label);
    
    setTimeout(() => {
      const mentorResponse: Message = {
        id: (Date.now() + 2).toString(),
        content: action.response,
        sender: "mentor",
        timestamp: new Date(),
        type: "suggestion"
      };
      setMessages(prev => [...prev, mentorResponse]);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-light rounded-full">
          <Bot className="text-primary" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Mentor Digital</h2>
          <p className="text-sm text-muted-foreground">Tu asistente personal para emprendedores</p>
        </div>
        <Badge className="ml-auto bg-success text-white">En línea</Badge>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Preguntas frecuentes:</h3>
        <div className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="w-full flex items-center gap-3 p-3 bg-accent hover:bg-accent/80 rounded-lg text-left transition-colors"
              >
                <Icon size={16} className="text-primary" />
                <span className="text-sm">{action.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Chat Messages */}
      <Card className="p-4">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`p-2 rounded-full flex-shrink-0 ${
                message.sender === "user" 
                  ? "bg-primary text-white" 
                  : "bg-success-light text-success"
              }`}>
                {message.sender === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`flex-1 ${message.sender === "user" ? "text-right" : ""}`}>
                <div className={`inline-block p-3 rounded-lg max-w-[85%] ${
                  message.sender === "user"
                    ? "bg-primary text-white"
                    : message.type === "suggestion"
                    ? "bg-card text-card-foreground border border-border"
                    : "bg-card text-card-foreground"
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Message Input */}
      <Card className="p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && inputMessage.trim() && handleSendMessage(inputMessage)}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Button
            onClick={() => inputMessage.trim() && handleSendMessage(inputMessage)}
            disabled={!inputMessage.trim() || loading}
            size="sm"
            className="px-4"
          >
            <Send size={16} />
          </Button>
        </div>
      </Card>

      {/* Tools Integration */}
      <Card className="p-4 bg-gradient-primary text-white">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Calculator size={20} />
          Herramientas Integradas
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="secondary" 
            className="bg-white/20 text-white hover:bg-white/30 border-0"
            onClick={() => navigate('/calculadora-precios')}
          >
            Calculadora de Precios
          </Button>
          <Button 
            variant="secondary" 
            className="bg-white/20 text-white hover:bg-white/30 border-0"
            onClick={() => navigate('/generador-qr')}
          >
            Generador de QR
          </Button>
        </div>
      </Card>
    </div>
  );
};