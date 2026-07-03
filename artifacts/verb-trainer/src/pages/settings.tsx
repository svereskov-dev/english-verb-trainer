import { useSettings } from "../hooks/useSettings";
import { BottomNav } from "../components/BottomNav";
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
      // Clear persisted practice configuration
      localStorage.removeItem("practice_config");
      localStorage.removeItem("practice_config_date");
      // Clear any in-progress exercise session
      sessionStorage.removeItem("exercise_session");
      sessionStorage.removeItem("mistakeReview");
      window.location.reload();
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

          <Button className="w-full" onClick={handleClearData}>
            Clear All Data
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
