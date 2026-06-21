import { useSettings } from "../hooks/useSettings";
import { BottomNav } from "../components/BottomNav";
import { Card, CardContent } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { getDB } from "../db";

export default function Settings() {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  const handleClearData = async () => {
    if (confirm("Are you sure you want to clear all progress and stats? This cannot be undone.")) {
      const db = await getDB();
      const tx = db.transaction(['progress', 'stats'], 'readwrite');
      await tx.objectStore('progress').clear();
      await tx.objectStore('stats').clear();
      await tx.done;
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-0">
      <div className="w-full max-w-md mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select 
              value={settings.difficulty} 
              onValueChange={(val: any) => updateSettings({ difficulty: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner (Basic Tenses)</SelectItem>
                <SelectItem value="intermediate">Intermediate (Perfect & Continuous)</SelectItem>
                <SelectItem value="advanced">Advanced (All including Passives)</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                <SelectItem value="10">10 Exercises</SelectItem>
                <SelectItem value="25">25 Exercises</SelectItem>
                <SelectItem value="50">50 Exercises</SelectItem>
                <SelectItem value="100">100 Exercises</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select 
              value={settings.theme} 
              onValueChange={(val: any) => updateSettings({ theme: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark Mode</SelectItem>
                <SelectItem value="light">Light Mode</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="mt-8 border-destructive/20">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1">
                <Label className="text-destructive font-bold">Danger Zone</Label>
                <p className="text-sm text-muted-foreground">Reset all progress and start fresh.</p>
              </div>
              <Button variant="destructive" className="w-full" onClick={handleClearData}>
                Clear All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
