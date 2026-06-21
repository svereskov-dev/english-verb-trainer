import { BottomNav } from "../components/BottomNav";
import { AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "wouter";

export default function Mistakes() {
  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-0 flex flex-col">
      <div className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Mistakes Review</h1>
          <p className="text-muted-foreground">
            Feature coming soon! You will be able to review specific items you previously answered incorrectly.
          </p>
        </div>
        <Link href="/practice">
          <Button variant="default">Back to Practice</Button>
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
