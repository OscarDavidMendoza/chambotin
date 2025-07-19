import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import MonthlyReport from "./pages/MonthlyReport";
import HistoricalReports from "./pages/HistoricalReports";
import Challenges from "./pages/Challenges";
import NotFound from "./pages/NotFound";
import CalculadoraPrecios from "./pages/CalculadoraPrecios";
import GeneradorQR from "./pages/GeneradorQR";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/monthly-report" element={<MonthlyReport />} />
          <Route path="/historical-reports" element={<HistoricalReports />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/calculadora-precios" element={<CalculadoraPrecios />} />
          <Route path="/generador-qr" element={<GeneradorQR />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
