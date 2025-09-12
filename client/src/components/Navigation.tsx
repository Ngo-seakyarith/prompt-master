import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { UserProgress } from "@shared/schema";

export default function Navigation() {
  const [location] = useLocation();
  
  // Fetch user progress for real progress calculation
  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"]
  });

  // Calculate actual progress
  const completedModules = userProgress.filter(p => p.isCompleted).length;
  const totalModules = 5; // We have 5 modules
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const navItems = [
    { href: "/", label: "Dashboard", id: "dashboard" },
    { href: "/modules", label: "Modules", id: "modules" },
    { href: "/practice", label: "Practice", id: "practice" },
    { href: "/progress", label: "Progress", id: "progress" }
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer" data-testid="logo">
                  PromptMaster
                </h1>
              </Link>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link key={item.id} href={item.href}>
                    <span
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        location === item.href || (item.href === "/" && location === "")
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      data-testid={`nav-${item.id}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground" data-testid="progress-indicator">
              Progress: {overallProgress}%
            </div>
            <div className="w-24 h-2 bg-muted rounded-full">
              <div 
                className="h-2 bg-secondary rounded-full transition-all duration-500" 
                style={{ width: `${overallProgress}%` }}
                data-testid="progress-bar"
              ></div>
            </div>
            <button className="p-2 rounded-full bg-primary text-primary-foreground" data-testid="user-menu">
              <i className="fas fa-user w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
