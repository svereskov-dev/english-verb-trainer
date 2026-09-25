import { useState, type MouseEvent } from "react";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { useSettings } from "../hooks/useSettings";
import { Onboarding } from "../components/Onboarding";
import { BottomNav } from "../components/BottomNav";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { clearLearningData } from "../db";
import { clearLearningBrowserStorage } from "../storage/clearAllData";
import { useFullAccess } from "../purchases/FullAccessContext";
import { ChevronRight, FileText, Lock, Mail, Shield, Unlock } from "lucide-react";
import { useLocation } from "wouter";
import { Separator } from "../components/ui/separator";

const PRIVACY_POLICY_URL = "https://sites.google.com/view/verbflow-privacy/";
const SUPPORT_EMAIL = "verbflowapp@gmail.com";

function handlePrivacyPolicyClick(event: MouseEvent<HTMLAnchorElement>): void {
  if (!Capacitor.isNativePlatform()) return;

  event.preventDefault();
  void Browser.open({ url: PRIVACY_POLICY_URL }).catch(error => {
    console.error("[PrivacyPolicy] failed to open native browser:", error);
    window.open(PRIVACY_POLICY_URL, "_blank", "noopener,noreferrer");
  });
}

export default function Settings() {
  const [, navigate] = useLocation();
  const { settings, updateSettings } = useSettings();
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const { hasFullAccess, openPaywall } = useFullAccess();

  if (!settings) return null;

  if (showGuide) {
    return (
      <Onboarding
        startScreen={1}
        endScreen={2}
        onComplete={() => setShowGuide(false)}
      />
    );
  }

  /**
   * Reset learning data without touching settings or access state.
   *
   * Called only after the user confirms via the AlertDialog (never via
   * window.confirm, which is silently suppressed on Samsung WebView and some
   * Capacitor Android configurations).
   *
   * The database is not deleted, browser storage is not cleared wholesale, and
   * the native entitlement plugin is never called. This preserves settings,
   * Review Access, paywall scheduling, and purchased Full Access.
   */
  const executeClear = async () => {
    setClearing(true);
    setClearError(null);

    try {
      console.log("[ClearData] clearing learning IndexedDB stores…");
      await clearLearningData();
      console.log("[ClearData] progress and stats cleared");

      console.log("[ClearData] clearing learning browser storage…");
      clearLearningBrowserStorage(localStorage, sessionStorage);
      console.log("[ClearData] learning browser storage cleared");

      console.log("[ClearData] learning data cleared — reloading app…");
      window.location.reload();

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ClearData] failed:", err);
      setClearError(`Clear failed: ${msg}. Please try again or reinstall the app.`);
      setClearing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background nav-safe-pad pt-safe flex flex-col">
      <div className="w-full max-w-md mx-auto p-6 space-y-6 flex-1">
        <h1 className="text-3xl font-bold">Settings</h1>

        <div>
          <div className="space-y-4">
          <div className="space-y-2">
            <Label>Daily Goal</Label>
            <Select
              value={settings.dailyGoal.toString()}
              onValueChange={(val) => updateSettings({ dailyGoal: parseInt(val) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 words</SelectItem>
                <SelectItem value="20">20 words</SelectItem>
                <SelectItem value="35">35 words</SelectItem>
                <SelectItem value="50">50 words</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Progress — uses AlertDialog instead of window.confirm() so it
              works reliably on Samsung WebView and all Capacitor environments. */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full"
                variant="destructive"
                disabled={clearing}
              >
                {clearing ? "Clearing…" : "Clear Progress"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-2xl border-border/80 bg-card p-7 text-center shadow-2xl sm:max-w-sm">
              <AlertDialogHeader className="space-y-3 !text-center">
                <AlertDialogTitle className="text-center text-xl font-bold tracking-tight">
                  Clear progress?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="!flex-row !justify-center !space-x-0 gap-3">
                <AlertDialogCancel className="mt-0">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={executeClear}
                >
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Inline error message — shown if any step of the clear fails */}
          {clearError && (
            <p className="text-sm text-red-400 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2">
              {clearError}
            </p>
          )}

          </div>

          <div className="mt-6">
            <Separator className="bg-border" />
          </div>

          <div className="mt-6">
            <Button
              type="button"
              className="w-full"
              variant="secondary"
              onClick={() => setShowGuide(true)}
            >
              Repeat Guide
            </Button>

            <Button
              type="button"
              className="mt-4 w-full"
              variant={hasFullAccess ? "success" : "primary"}
              disabled={hasFullAccess}
              onClick={() => {
                if (!hasFullAccess) openPaywall();
              }}
            >
              {hasFullAccess ? (
                <Unlock size={16} aria-hidden="true" />
              ) : (
                <Lock size={16} aria-hidden="true" />
              )}
              {hasFullAccess ? "Full Access Unlocked" : "Unlock Full Access"}
            </Button>

            <section className="mt-8" aria-labelledby="support-legal-heading">
              <h2
                id="support-legal-heading"
                className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Support &amp; Legal
              </h2>
              <div className="divide-y divide-border border-y border-border">
                <button
                  type="button"
                  onClick={() => navigate("/settings/licenses")}
                  className="flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <FileText className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1">Third-Party Licenses</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
                <a
                  href={PRIVACY_POLICY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handlePrivacyPolicyClick}
                  className="flex min-h-12 items-center gap-3 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Shield className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1">Privacy Policy</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </a>
                <div className="flex min-h-[60px] items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
                  <Mail className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="leading-5">Contact Support</span>
                    <span className="select-text text-xs leading-4 text-muted-foreground">
                      {SUPPORT_EMAIL}
                    </span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
