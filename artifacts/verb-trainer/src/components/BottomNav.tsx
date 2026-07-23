import { Link, useLocation } from "wouter";
import { Home, Dumbbell, AlertCircle, BookOpen, Settings } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/practice", label: "Practice", icon: Dumbbell },
    { href: "/mistakes", label: "Mistakes", icon: AlertCircle },
    { href: "/dictionary", label: "Dictionary", icon: BookOpen },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe-area spacer — uses env() with a non-zero fallback for Samsung One UI
          and other Android OEMs that may report env(safe-area-inset-bottom) as 0
          even when a gesture navigation bar is present. */}
      <div style={{ height: 'max(env(safe-area-inset-bottom, 0px), 0px)' }} />
    </nav>
  );
}
