import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Reviews from "./pages/Reviews";
import WhyReadTogether from "./pages/WhyReadTogether";
import NotFound from "./pages/NotFound";
import OrderComplete from "./pages/OrderComplete";
import Library from "./pages/Library";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Unsubscribe from "./pages/Unsubscribe";
import DevTest from "./pages/DevTest";


const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:handle" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/why-read-together" element={<WhyReadTogether />} />
          <Route path="/order-complete" element={<OrderComplete />} />
          <Route path="/library/:orderId" element={<Library />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
