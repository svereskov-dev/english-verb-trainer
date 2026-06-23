import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";

import Home from "@/pages/home";
import Practice from "@/pages/practice";
import Mistakes from "@/pages/mistakes";
import Settings from "@/pages/settings";
import Dictionary from "@/pages/dictionary";
import DictionaryVerb from "@/pages/dictionary-verb";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/practice" component={Practice} />
      <Route path="/mistakes" component={Mistakes} />
      <Route path="/settings" component={Settings} />
      <Route path="/dictionary" component={Dictionary} />
      <Route path="/dictionary/:verb" component={DictionaryVerb} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
