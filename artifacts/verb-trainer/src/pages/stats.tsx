import { useStats } from "../hooks/useStats";
import { BottomNav } from "../components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function Stats() {
  const { stats } = useStats();

  if (!stats) return null;

  const accuracy = stats.totalAnswers > 0 
    ? Math.round((stats.totalCorrect / stats.totalAnswers) * 100) 
    : 0;

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-0">
      <div className="w-full max-w-md mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Statistics</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Total Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAnswers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{accuracy}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Best Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{stats.bestStreak}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.sessionAnswers}</div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
