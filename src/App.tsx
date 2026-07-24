import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index";
import Preview from "./pages/Preview";
import Upsell from "./pages/Upsell";
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
import Checkout from "./pages/Checkout";
import ProductsIndex from "./pages/ProductsIndex";
import ProductLanding from "./pages/ProductLanding";
import AdminPayments from "./pages/AdminPayments";
import Membership from "./pages/Membership";
import AdLinks from "./pages/AdLinks";







const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/upsell" element={<Upsell />} />
          <Route path="/product/:handle" element={<ProductDetail />} />
          <Route path="/products" element={<ProductsIndex />} />
          <Route path="/products/:slug" element={<ProductLanding />} />

          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/why-read-together" element={<WhyReadTogether />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-complete" element={<OrderComplete />} />
          <Route path="/library/:orderId" element={<Library />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/admin/payments" element={<AdminPayments />} />

          
          
          
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
        <Analytics />
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
