import { Link, useLocation } from "wouter";
import { Home, Dumbbell, AlertCircle, BarChart2, Settings } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/practice", label: "Practice", icon: Dumbbell },
    { href: "/mistakes", label: "Mistakes", icon: AlertCircle },
    { href: "/stats", label: "Stats", icon: BarChart2 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-card border-t border-border flex justify-around items-center h-16 px-2 z-50">
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
    </nav>
  );
}
