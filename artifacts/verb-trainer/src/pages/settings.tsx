import { useState } from "react";
import { deleteDB } from "idb";
import { useSettings } from "../hooks/useSettings";
import { BottomNav } from "../components/BottomNav";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { closeDB } from "../db";

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  if (!settings) return null;

  /**
   * Execute the full data-wipe sequence.
   *
   * Called only after the user confirms via the AlertDialog (never via
   * window.confirm, which is silently suppressed on Samsung WebView and some
   * Capacitor Android configurations).
   *
   * Sequence:
   *  1. Close the idb singleton connection — prevents a "blocked" state when
   *     deleteDB fires on Samsung / Capacitor WebView.
   *  2. Delete the entire IndexedDB database.
   *  3. Clear localStorage completely.
   *  4. Clear sessionStorage completely.
   *  5. Reload to a clean app state.
   *
   * Every step is wrapped in try/catch.  If anything fails the error is shown
   * in the UI instead of being swallowed silently.
   */
  const executeClear = async () => {
    setClearing(true);
    setClearError(null);

    try {
      // ── Step 1: close the open DB connection ───────────────────────────────
      console.log("[ClearData] closing DB connection…");
      await closeDB();
      console.log("[ClearData] DB connection closed");

      // ── Step 2: delete the IndexedDB database ──────────────────────────────
      console.log("[ClearData] deleting IndexedDB 'verb-trainer-db'…");
      await deleteDB("verb-trainer-db", {
        // `blocked` fires when another tab / frame still holds a connection.
        // Log it so it shows up in device logs; deletion will still proceed
        // once those connections close.
        blocked(currentVersion, event) {
          console.warn(
            `[ClearData] deleteDB blocked (currentVersion=${currentVersion})`,
            event,
          );
        },
      });
      console.log("[ClearData] IndexedDB deleted");

      // ── Step 3: clear localStorage ─────────────────────────────────────────
      console.log("[ClearData] clearing localStorage…");
      localStorage.clear();
      console.log("[ClearData] localStorage cleared");

      // ── Step 4: clear sessionStorage ──────────────────────────────────────
      console.log("[ClearData] clearing sessionStorage…");
      sessionStorage.clear();
      console.log("[ClearData] sessionStorage cleared");

      // ── Step 5: reload ────────────────────────────────────────────────────
      console.log("[ClearData] all storage cleared — reloading app…");
      window.location.reload();

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ClearData] failed:", err);
      setClearError(`Clear failed: ${msg}. Please try again or reinstall the app.`);
      setClearing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background nav-safe-pad pt-safe">
      <div className="w-full max-w-md mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

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

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(val: string) => {
                if (val === "dark") {
                  updateSettings({ theme: "dark" });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark Mode</SelectItem>
                <SelectItem value="light" disabled>
                  Light Mode (Coming Soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Data — uses AlertDialog instead of window.confirm() so it
              works reliably on Samsung WebView and all Capacitor environments. */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full"
                variant="destructive"
                disabled={clearing}
              >
                {clearing ? "Clearing…" : "Clear All Data"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your progress, statistics, and
                  mistakes. Your daily goal and theme settings will also be reset.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={executeClear}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
      </div>
      <BottomNav />
    </div>
  );
}
