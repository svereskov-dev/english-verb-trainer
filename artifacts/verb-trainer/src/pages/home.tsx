import { Link, useLocation } from "wouter";
import { useStats } from "../hooks/useStats";
import { useSettings } from "../hooks/useSettings";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Flame, Target, SlidersHorizontal } from "lucide-react";
import { BottomNav } from "../components/BottomNav";

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

  return (
    <div className="min-h-[100dvh] nav-safe-pad pt-safe bg-background flex flex-col items-center">
      <div className="w-full max-w-md p-6 space-y-8 mt-4">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">English Verb Trainer</h1>
          <p className="text-muted-foreground">Go get your goal</p>
        </div>

        {/* Daily Progress — informational widget, kept at page level so it
            doesn't compete visually with the action buttons below. */}
        <Card className="border-border/40 bg-background shadow-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Target className="text-primary w-5 h-5" />
                Daily Progress
              </h2>
              <span className="text-muted-foreground text-sm font-medium">
                {stats.sessionAnswers} / {settings.dailyGoal}
              </span>
            </div>

            <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {progress >= 100 && (
              <p className="text-sm text-primary font-medium text-center">Great job! Keep going!</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border bg-background/40 shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center space-y-1">
              <Flame className="w-6 h-6 text-green-500 mb-1" />
              <span className="text-2xl font-bold">{stats.totalCorrect}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Correct</span>
            </CardContent>
          </Card>

          <Card className="border-border bg-background/40 shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center space-y-1">
              <Flame className="w-6 h-6 text-red-500 mb-1" />
              <span className="text-2xl font-bold">{stats.totalIncorrect}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Incorrect</span>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/practice" className="w-full block">
            <Button size="lg" className="w-full h-14 text-lg font-bold rounded-xl" data-testid="btn-start-practice">
              Start Practice
            </Button>
          </Link>

          {/* Choose Training Mode — secondary CTA; uses the secondary/elevated
              surface so it reads as clearly interactive, secondary only to
              Start Practice. */}
          <Button
            variant="secondary"
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl shadow-sm"
            onClick={handleChooseMode}
            data-testid="btn-choose-mode"
          >
            <SlidersHorizontal size={18} className="mr-2" />
            Choose Training Mode
          </Button>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
