import { Link, useLocation } from "wouter";
import { useStats } from "../hooks/useStats";
import { useSettings } from "../hooks/useSettings";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Check, X, Target, SlidersHorizontal } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { isDailyGoalReached } from "../lib/dailyProgress";

export default function Home() {
  const [, navigate] = useLocation();
  const { stats } = useStats();
  const { settings } = useSettings();

  if (!stats || !settings) return null;

  const handleChooseMode = () => {
    sessionStorage.setItem("openTrainingMenu", "true");
    navigate("/practice");
  };

  const progress = Math.min(100, Math.round((stats.sessionAnswers / settings.dailyGoal) * 100));
  const goalReached = isDailyGoalReached(stats.sessionAnswers, settings.dailyGoal);

  return (
    <div className="min-h-[100dvh] nav-safe-pad pt-safe bg-background flex flex-col items-center">
      <div className="w-full max-w-md p-6 space-y-8 mt-4">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">English Verb Trainer</h1>
          <p className="text-muted-foreground">Go get your goal</p>
        </div>

        {/* Unified statistics panel — informational and non-interactive. */}
        <Card className="border-border bg-background/40 shadow-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Target className={goalReached ? "text-green-500 w-5 h-5" : "text-primary w-5 h-5"} />
                Daily Progress
              </h2>
              <span className="text-muted-foreground text-sm font-medium">
                {stats.sessionAnswers} / {settings.dailyGoal}
              </span>
            </div>

            <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  goalReached ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {goalReached && (
              <p className="text-sm text-green-500 font-medium text-center">
                Great job! Keep going!
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div className="p-4 flex flex-col items-center justify-center space-y-1">
              <Check className="w-6 h-6 text-green-500 mb-1" />
              <span className="text-2xl font-bold">{stats.dailyCorrect}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Correct</span>
              </div>

              <div className="p-4 flex flex-col items-center justify-center space-y-1">
              <X className="w-6 h-6 text-red-500 mb-1" />
              <span className="text-2xl font-bold">{stats.dailyIncorrect}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Incorrect</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Button asChild size="hero" className="w-full" data-testid="btn-start-practice">
            <Link href="/practice">
              Practice
            </Link>
          </Button>

          {/* Choose Training Mode — secondary CTA; uses the secondary/elevated
              surface so it reads as clearly interactive, secondary only to
              Practice. */}
          <Button
            variant="secondary"
            size="hero"
            className="w-full"
            onClick={handleChooseMode}
            data-testid="btn-choose-mode"
          >
            <SlidersHorizontal size={18} />
            Choose Training Mode
          </Button>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
