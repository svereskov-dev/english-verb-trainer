import { Link } from "wouter";
import { useStats } from "../hooks/useStats";
import { useSettings } from "../hooks/useSettings";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Flame, Target, Trophy, Clock } from "lucide-react";
import { BottomNav } from "../components/BottomNav";

export default function Home() {
  const { stats } = useStats();
  const { settings } = useSettings();

  if (!stats || !settings) return null;

  const progress = Math.min(100, Math.round((stats.sessionAnswers / settings.dailyGoal) * 100));

  return (
    <div className="min-h-[100dvh] pb-20 md:pb-0 bg-background flex flex-col items-center">
      <div className="w-full max-w-md p-6 space-y-8 mt-4">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">English Verb Trainer</h1>
          <p className="text-muted-foreground">Master forms. Build fluency. No fluff.</p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Target className="text-primary w-5 h-5" />
                Daily Goal
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
              <p className="text-sm text-primary font-medium text-center">Daily goal reached! Keep going!</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4 flex flex-col items-center justify-center space-y-1">
              <Flame className="w-6 h-6 text-orange-500 mb-1" />
              <span className="text-2xl font-bold">{stats.currentStreak}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Streak</span>
            </CardContent>
          </Card>
          
          <Card className="bg-card">
            <CardContent className="p-4 flex flex-col items-center justify-center space-y-1">
              <Trophy className="w-6 h-6 text-yellow-500 mb-1" />
              <span className="text-2xl font-bold">{stats.totalAnswers}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Practiced</span>
            </CardContent>
          </Card>
        </div>

        <div className="pt-4">
          <Link href="/practice" className="w-full">
            <Button size="lg" className="w-full h-14 text-lg font-bold rounded-xl" data-testid="btn-start-practice">
              Start Practice
            </Button>
          </Link>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
