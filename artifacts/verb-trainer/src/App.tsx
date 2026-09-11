import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useSystemUI } from "@/hooks/useSystemUI";
import { useSettings } from "@/hooks/useSettings";
import { Onboarding } from "@/components/Onboarding";
import { FullAccessPaywall } from "@/components/FullAccessPaywall";
import { FullAccessProvider, useFullAccess } from "@/purchases/FullAccessContext";
import {
  ensureFirstUseTimestamp,
  recordAutomaticPaywallShown,
  shouldShowAutomaticPaywall,
} from "@/purchases/paywallSchedule";

import Home from "@/pages/home";
import Practice from "@/pages/practice";
import Mistakes from "@/pages/mistakes";
import Settings from "@/pages/settings";
import Dictionary from "@/pages/dictionary";
import DictionaryVerb from "@/pages/dictionary-verb";
import Tenses from "@/pages/tenses";
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
      <Route path="/tenses" component={Tenses} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [, navigate] = useLocation();
  const { settings, updateSettings } = useSettings();
  const {
    entitlementReady,
    hasFullAccess,
    paywallOpen,
    openPaywall,
  } = useFullAccess();
  const autoPaywallShownThisLaunch = useRef(false);

  useEffect(() => {
    ensureFirstUseTimestamp(localStorage);
  }, []);

  useEffect(() => {
    if (!settings) return;
    const shouldShow = shouldShowAutomaticPaywall({
      storage: localStorage,
      entitlementReady,
      hasFullAccess,
      onboardingComplete: settings.hasCompletedOnboarding,
      shownThisLaunch: autoPaywallShownThisLaunch.current,
      paywallOpen,
    });
    if (!shouldShow) return;
    autoPaywallShownThisLaunch.current = true;
    recordAutomaticPaywallShown(localStorage);
    openPaywall();
  }, [entitlementReady, hasFullAccess, openPaywall, paywallOpen, settings]);

  if (!settings) return null;

  const handleOnboardingComplete = async (dailyGoal: number) => {
    await updateSettings({ hasCompletedOnboarding: true, dailyGoal });
    // Full onboarding can be launched from a non-home route after Clear All
    // Data. Return the user to the normal app entry point once it is complete.
    navigate("/");
  };

  const hasCompleted = settings.hasCompletedOnboarding;

  return (
    <>
      {hasCompleted ? <Router /> : <Onboarding onComplete={handleOnboardingComplete} />}
    </>
  );
}

function App() {
  useSystemUI();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <FullAccessProvider>
            {import.meta.env.VITE_CAPACITOR === "true" ? (
              <WouterRouter hook={useHashLocation}>
                <AppContent />
              </WouterRouter>
            ) : (
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AppContent />
              </WouterRouter>
            )}
            <FullAccessPaywall />
          </FullAccessProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
