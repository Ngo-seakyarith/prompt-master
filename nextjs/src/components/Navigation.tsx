"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, User } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useTranslation();
  
  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/progress"],
    queryFn: async () => {
      const res = await fetch("/api/progress");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const completedModules = userProgress.filter((p: any) => p.isCompleted).length;
  const totalModules = 50;
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/courses", label: t.nav.courses },
    { href: "/playground", label: t.nav.playground },
    { href: "/goals", label: t.nav.goals },
    { href: "/certificates", label: t.nav.certificates },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-primary cursor-pointer">
                PromptMaster
              </h1>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 items-baseline space-x-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isActive(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Desktop Progress & Controls */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {t.common.progress}: {overallProgress}%
              </div>
              <div className="w-24 h-2 bg-muted rounded-full">
                <div 
                  className="h-2 bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              
              {/* Language Switcher */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "km" : "en")}
              >
                {language === "en" ? "🇰🇭 KM" : "🇺🇸 EN"}
              </Button>
              
              <Link href="/api/auth/signout">
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground">
                  {t.common.progress}: {overallProgress}%
                </div>
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(language === "en" ? "km" : "en")}
                >
                  {language === "en" ? "🇰🇭 ភាសាខ្មែរ" : "🇺🇸 English"}
                </Button>
                <Link href="/api/auth/signout">
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
