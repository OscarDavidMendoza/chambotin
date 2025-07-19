import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user_id }: ChatRequest = await req.json();

    if (!message || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Message and user_id are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile and progress data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const { data: progress } = await supabase
      .from('user_progress')
      .select('*, learning_modules(*)')
      .eq('user_id', user_id);

    const { data: metrics } = await supabase
      .from('business_metrics')
      .select('*')
      .eq('user_id', user_id)
      .order('period_date', { ascending: false })
      .limit(5);

    // Create context for the AI mentor
    const userContext = {
      name: profile?.display_name || 'entrepreneur',
      business: profile?.business_name || 'your business',
      businessType: profile?.business_type || 'business',
      completedModules: progress?.filter(p => p.status === 'completed').length || 0,
      totalModules: progress?.length || 0,
      recentMetrics: metrics || [],
    };

    // Simple rule-based responses (replace with AI API when available)
    const response = generateMentorResponse(message.toLowerCase(), userContext);

    console.log('WhatsApp mentor request processed:', { user_id, message, response });

    return new Response(
      JSON.stringify({ response }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in whatsapp-mentor function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

function generateMentorResponse(message: string, context: any): string {
  const { name, business, businessType, completedModules, totalModules, recentMetrics } = context;

  // Greeting responses in Spanish
  if (message.includes('hello') || message.includes('hi') || message.includes('hola') || message.includes('buenos')) {
    return `¡Hola ${name}! 👋 Soy tu mentor digital para emprendedores. ¿Cómo puedo ayudarte a hacer crecer ${business} hoy?`;
  }

  // Progress inquiries in Spanish
  if (message.includes('progress') || message.includes('progreso') || message.includes('como voy') || message.includes('cómo voy')) {
    const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    return `¡Excelente pregunta! Has completado ${completedModules} de ${totalModules} módulos de aprendizaje (${progressPercent}%). ${progressPercent > 50 ? "¡Lo estás haciendo fantástico! 🎉" : "¡Sigue adelante, estás construyendo impulso! 💪"}`;
  }

  // WhatsApp Business help in Spanish
  if (message.includes('whatsapp') || message.includes('catalog') || message.includes('catálogo')) {
    return `¡Para negocios de ${businessType} como el tuyo, WhatsApp Business es crucial! 📱 Aquí mis mejores consejos:\n\n1. Configura tu perfil comercial completamente\n2. Crea un catálogo con fotos de alta calidad\n3. Usa respuestas rápidas para preguntas comunes\n4. Publica estados regularmente\n5. Organiza tus contactos en listas\n\n¿Quieres que te guíe en alguno de estos pasos?`;
  }

  // Pricing help in Spanish
  if (message.includes('price') || message.includes('precio') || message.includes('cost') || message.includes('costo')) {
    return `¡La estrategia de precios es clave para ${business}! 💰 Aquí una fórmula simple:\n\nCosto + Ganancia Deseada + Valor de Mercado = Tu Precio\n\nPara ${businessType}, investiga competidores y considera:\n• Tu valor único\n• Disposición del cliente a pagar\n• Demanda estacional\n• Costos ocultos\n\n¿Necesitas ayuda calculando precios específicos?`;
  }

  // Marketing and sales help in Spanish
  if (message.includes('marketing') || message.includes('mercadeo') || message.includes('customers') || message.includes('clientes') || message.includes('sales') || message.includes('ventas')) {
    return `¡Vamos a impulsar la visibilidad de ${business}! 📈 Para negocios de ${businessType}, prueba:\n\n• Publicaciones en redes 3x/semana\n• Testimonios de clientes\n• Participación en comunidad local\n• Incentivos por referidos\n• Optimización de Google Mi Negocio\n• Stories diarios en Instagram\n\n¿Qué área te interesa más?`;
  }

  // Finance help in Spanish
  if (message.includes('money') || message.includes('dinero') || message.includes('finance') || message.includes('finanza') || message.includes('budget') || message.includes('presupuesto')) {
    const hasMetrics = recentMetrics.length > 0;
    const advice = hasMetrics 
      ? `¡Basándome en tus datos recientes, optimicemos tus finanzas! 📊` 
      : `¡Vamos a organizar tus finanzas! 📊`;
    
    return `${advice}\n\nÁreas clave en las que enfocarse:\n• Registra ingresos/gastos diarios\n• Separa dinero del negocio/personal\n• Planifica para meses lentos\n• Reinvierte 15-20% en crecimiento\n• Crea un fondo de emergencia\n\n¿Quieres ayuda con presupuestos o seguimiento de gastos?`;
  }

  // Digital tools help in Spanish
  if (message.includes('tools') || message.includes('herramientas') || message.includes('digital') || message.includes('app')) {
    return `¡Las herramientas digitales pueden transformar ${business}! 🔧 Te recomiendo:\n\n📱 WhatsApp Business Pro\n💳 Sistemas de pago digital\n📊 Hojas de cálculo para finanzas\n📱 Apps de facturación\n🎨 Canva para diseño\n📈 Google Analytics\n\n¿Con cuál te gustaría empezar?`;
  }

  // General business help in Spanish
  if (message.includes('help') || message.includes('ayuda') || message.includes('advice') || message.includes('consejo')) {
    return `¡Estoy aquí para ayudar a que ${business} tenga éxito! 🚀 Puedo asistirte con:\n\n📱 Configuración de WhatsApp Business\n💰 Estrategias de precios\n📈 Ideas de marketing\n💵 Planificación financiera\n📊 Seguimiento de progreso\n🛠️ Herramientas digitales\n\n¿Cuál es tu mayor desafío en este momento?`;
  }

  // Default response in Spanish
  return `Entiendo que preguntas sobre "${message}". Como tu mentor para ${business}, ¡estoy aquí para ayudarte! 🤝\n\nMe especializo en:\n• WhatsApp Business y ventas digitales\n• Estrategias de marketing y ventas\n• Planificación financiera\n• Herramientas digitales para emprendedores\n\n¿Podrías ser más específico sobre lo que te gustaría aprender?`;
}

serve(handler);