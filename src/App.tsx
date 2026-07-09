import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteBackground } from "@/components/SiteBackground";
import { CursorSpotlight } from "@/components/CursorSpotlight";
import { ThemeColorPicker } from "@/components/ThemeColorPicker";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* Honor the OS "reduce motion" setting across all framer-motion animations */}
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <TooltipProvider>
          {/* Brand-tinted decorative layers — follow the theme picker / rotation */}
          <SiteBackground />
          <CursorSpotlight />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <ThemeColorPicker />
        </TooltipProvider>
      </ThemeProvider>
    </MotionConfig>
  </QueryClientProvider>
);

export default App;
