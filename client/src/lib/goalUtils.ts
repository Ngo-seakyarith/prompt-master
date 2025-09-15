import { MODULES } from "@/lib/constants";
import type { Goal, UserProgress } from "@shared/schema";

/**
 * Safely parse goal notes JSON data, providing fallback values for corrupted data
 */
export function safeParseNotes(notes: string | null | undefined): any {
  if (!notes || typeof notes !== 'string') {
    return {};
  }

  try {
    const parsed = JSON.parse(notes);
    // Ensure we return an object, not arrays or primitives
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.warn('Failed to parse goal notes JSON, using fallback:', error);
    return {};
  }
}

/**
 * Safely format a date string, returning a fallback for invalid dates
 */
export function safeFormatDate(dateString: string | Date | null | undefined): Date {
  if (!dateString) {
    return new Date();
  }

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  } catch (error) {
    console.warn('Failed to parse date, using current date as fallback:', error);
    return new Date();
  }
}

/**
 * Safely get a numeric value with fallback
 */
export function safeGetNumber(value: any, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return fallback;
}

/**
 * Progress calculation result interface
 */
export interface GoalProgress {
  currentValue: number;
  targetValue: number;
  progress: number;
  isCompleted: boolean;
}

/**
 * Reliably calculate goal progress using authoritative MODULES mapping
 * This replaces the brittle moduleId.startsWith logic with proper module resolution
 */
export function calculateGoalProgress(
  goal: Goal, 
  userProgress: UserProgress[]
): GoalProgress {
  const goalMetadata = safeParseNotes(goal.notes);
  const goalType = goalMetadata.type || "module_count";
  
  let currentValue = 0;
  let targetValue = safeGetNumber(goal.targetModulesPerWeek, 1);
  let isCompleted = false;

  switch (goalType) {
    case "course_completion":
      if (goal.courseId) {
        // Use authoritative MODULES mapping instead of brittle startsWith
        const courseModules = MODULES.filter(m => m.courseId === goal.courseId);
        const completedModules = courseModules.filter(m => 
          userProgress.find(p => p.moduleId === m.id)?.isCompleted
        );
        currentValue = completedModules.length;
        targetValue = courseModules.length;
        isCompleted = currentValue >= targetValue && targetValue > 0;
      }
      break;
    
    case "module_count":
      if (goal.courseId) {
        // Course-specific module count
        const courseModules = MODULES.filter(m => m.courseId === goal.courseId);
        const completedModules = courseModules.filter(m => 
          userProgress.find(p => p.moduleId === m.id)?.isCompleted
        );
        currentValue = completedModules.length;
      } else {
        // Global module count across all courses
        const completedModules = userProgress.filter(p => p.isCompleted);
        currentValue = completedModules.length;
      }
      isCompleted = currentValue >= targetValue;
      break;

    case "progress_percentage":
      if (goal.courseId) {
        const courseModules = MODULES.filter(m => m.courseId === goal.courseId);
        const completedModules = courseModules.filter(m => 
          userProgress.find(p => p.moduleId === m.id)?.isCompleted
        );
        const totalModules = courseModules.length;
        currentValue = totalModules > 0 ? Math.round((completedModules.length / totalModules) * 100) : 0;
        isCompleted = currentValue >= targetValue;
      }
      break;

    case "streak":
      // For streak goals, use metadata or calculate based on recent activity
      currentValue = goalMetadata.currentStreak || 0;
      isCompleted = currentValue >= targetValue;
      break;
  }

  return {
    currentValue,
    targetValue,
    progress: targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0,
    isCompleted
  };
}

/**
 * Determine goal status based on progress and target date
 */
export function getGoalStatus(goal: Goal, userProgress: UserProgress[]): 'active' | 'completed' | 'expired' {
  const progress = calculateGoalProgress(goal, userProgress);
  const now = new Date();
  const targetDate = safeFormatDate(goal.targetDate);
  
  if (progress.isCompleted) {
    return 'completed';
  }
  
  if (targetDate < now) {
    return 'expired';
  }
  
  return 'active';
}

/**
 * Get all available courses that can be used for course-specific goals
 */
export function getAvailableCourses() {
  const courseIds = Array.from(new Set(MODULES.map(m => m.courseId)));
  return courseIds.map(courseId => ({
    id: courseId,
    moduleCount: MODULES.filter(m => m.courseId === courseId).length
  }));
}