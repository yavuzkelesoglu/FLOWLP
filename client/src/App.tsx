import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Home2 from "@/pages/home2";
import Contact from "@/pages/contact";
import Admin from "@/pages/admin";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home2" component={Home2} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleReCaptchaProvider
        reCaptchaKey={RECAPTCHA_SITE_KEY}
        language="tr"
        scriptProps={{
          async: true,
          defer: true,
          appendTo: "head",
        }}
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </GoogleReCaptchaProvider>
    </QueryClientProvider>
  );
}

export default App;
