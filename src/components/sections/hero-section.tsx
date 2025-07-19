import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Users, BookOpen } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center text-white px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
            <TrendingUp size={48} className="text-white" />
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl font-bold mb-6 leading-tight">
          Tu Mentor Digital
          <br />
          <span className="text-2xl font-normal opacity-90">para Emprendedores</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg mb-8 opacity-90 leading-relaxed">
          Acelera el crecimiento de tu negocio con cursos prácticos, 
          seguimiento de progreso y herramientas digitales
        </p>

        {/* Features */}
        <div className="flex justify-center gap-8 mb-10">
          <div className="flex flex-col items-center">
            <div className="p-2 bg-white/20 rounded-full mb-2">
              <BookOpen size={20} />
            </div>
            <span className="text-sm">Micro-cursos</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-2 bg-white/20 rounded-full mb-2">
              <Target size={20} />
            </div>
            <span className="text-sm">Seguimiento</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-2 bg-white/20 rounded-full mb-2">
              <Users size={20} />
            </div>
            <span className="text-sm">Comunidad</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onGetStarted}
          size="lg"
          className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-4 text-lg shadow-lg"
        >
          Comenzar Ahora
        </Button>

        <p className="text-sm mt-4 opacity-75">
          Gratis • Sin compromisos • Resultados garantizados
        </p>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-12">
          <path
            d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
            className="fill-background"
          ></path>
        </svg>
      </div>
    </div>
  );
};