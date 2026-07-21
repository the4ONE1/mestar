import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { HelmetProvider, type FilledContext } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Preview from "./pages/Preview";
import Upsell from "./pages/Upsell";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Reviews from "./pages/Reviews";
import WhyReadTogether from "./pages/WhyReadTogether";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProductsIndex from "./pages/ProductsIndex";
import ProductLanding from "./pages/ProductLanding";
import Membership from "./pages/Membership";
import "./index.css";

export function render(url: string) {
  const helmetContext = {} as FilledContext;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <StaticRouter location={url}>
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
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/membership" element={<Membership />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </StaticRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;
  return {
    html,
    head: helmet
      ? `${helmet.title.toString()}${helmet.meta.toString()}${helmet.link.toString()}${helmet.script.toString()}`
      : "",
  };
}
