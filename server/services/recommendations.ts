import { IStorage } from "../storage";
import { MODULES, COURSES } from "../../client/src/lib/constants";
import type { User, UserProgress, Goal, Certificate, ExerciseAttempt, QuizAttempt } from "@shared/schema";

export interface Recommendation {
  id: string;
  type: 'next-in-sequence' | 'goal-aligned' | 'review-needed' | 'similar-interests' | 'difficulty-progressive' | 'time-based';
  moduleId?: string;
  courseId?: string;
  title: string;
  description: string;
  reasoning: string;
  priorityScore: number; // 0-100, higher = more important
  estimatedTime?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  metadata: {
    currentProgress?: number;
    averageScore?: number;
    timeToComplete?: string;
    goalAlignment?: string;
    prerequisitesMet?: boolean;
    userEngagement?: 'high' | 'medium' | 'low';
  };
}

export interface RecommendationAnalysis {
  recommendations: Recommendation[];
  userProfile: {
    totalModulesCompleted: number;
    averageScore: number;
    preferredDifficulty: string;
    learningVelocity: number; // modules per week
    strongAreas: string[];
    improvementAreas: string[];
    goalAlignment: number; // 0-100
  };
}

// Type guard for difficulty levels
function isValidDifficulty(difficulty: string): difficulty is 'beginner' | 'intermediate' | 'advanced' {
  return ['beginner', 'intermediate', 'advanced'].includes(difficulty);
}

export class RecommendationService {
  constructor(private storage: IStorage) {}

  async generateRecommendations(userId: string): Promise<RecommendationAnalysis> {
    // Gather all user data
    const [userProgress, goals, certificates, exerciseAttempts, quizAttempts] = await Promise.all([
      this.storage.getUserProgress(userId),
      this.storage.getUserGoals(userId),
      this.storage.getUserCertificates(userId),
      this.getAllUserExerciseAttempts(userId),
      this.getAllUserQuizAttempts(userId)
    ]);

    // Analyze user profile
    const userProfile = this.analyzeUserProfile(userProgress, exerciseAttempts, quizAttempts, goals);
    
    // Generate different types of recommendations
    const recommendations: Recommendation[] = [];
    
    // 1. Next-in-sequence recommendations
    recommendations.push(...this.getNextInSequenceRecommendations(userProgress, certificates, userProfile));
    
    // 2. Goal-aligned recommendations
    recommendations.push(...this.getGoalAlignedRecommendations(userProgress, goals, userProfile));
    
    // 3. Review-needed recommendations
    recommendations.push(...this.getReviewNeededRecommendations(userProgress, exerciseAttempts, userProfile));
    
    // 4. Similar-interests recommendations
    recommendations.push(...this.getSimilarInterestsRecommendations(userProgress, userProfile));
    
    // 5. Difficulty-progressive recommendations
    recommendations.push(...this.getDifficultyProgressiveRecommendations(userProgress, certificates, userProfile));
    
    // 6. Time-based recommendations
    recommendations.push(...this.getTimeBasedRecommendations(userProgress, goals, userProfile));

    // Sort by priority score and remove duplicates
    const sortedRecommendations = this.prioritizeAndDeduplicateRecommendations(recommendations);

    return {
      recommendations: sortedRecommendations,
      userProfile
    };
  }

  private async getAllUserExerciseAttempts(userId: string): Promise<ExerciseAttempt[]> {
    const attempts: ExerciseAttempt[] = [];
    for (const module of MODULES) {
      try {
        const moduleAttempts = await this.storage.getUserExerciseAttempts(userId, module.id);
        attempts.push(...moduleAttempts);
      } catch (error) {
        // Continue if module not found
      }
    }
    return attempts;
  }

  private async getAllUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    try {
      return await this.storage.getUserQuizAttempts(userId);
    } catch (error) {
      return [];
    }
  }

  private analyzeUserProfile(
    userProgress: UserProgress[], 
    exerciseAttempts: ExerciseAttempt[], 
    quizAttempts: QuizAttempt[],
    goals: Goal[]
  ) {
    const completedModules = userProgress.filter(p => p.isCompleted);
    const totalModulesCompleted = completedModules.length;
    
    // Calculate average score from all attempts
    const allScores = [
      ...userProgress.map(p => p.score || 0),
      ...exerciseAttempts.map(e => e.score),
      ...quizAttempts.map(q => (q.score / q.maxScore) * 100)
    ].filter(score => score > 0);
    
    const averageScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
    
    // Determine preferred difficulty based on completed courses
    const completedCourseIds = Array.from(new Set(completedModules
      .map(p => MODULES.find(m => m.id === p.moduleId)?.courseId)
      .filter(Boolean)));
    
    const completedCourses = COURSES.filter(c => completedCourseIds.includes(c.id));
    const difficultyDistribution = completedCourses.reduce((acc, course) => {
      acc[course.difficulty] = (acc[course.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const preferredDifficulty = Object.entries(difficultyDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'beginner';
    
    // Calculate learning velocity (modules per week)
    const recentProgress = userProgress
      .filter(p => p.lastAttempt && new Date(p.lastAttempt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .filter(p => p.isCompleted);
    
    const learningVelocity = recentProgress.length > 0 ? (recentProgress.length / 4) : 1; // per week
    
    // Identify strong and improvement areas based on course performance
    const coursePerformance = COURSES.map(course => {
      const courseModules = MODULES.filter(m => m.courseId === course.id);
      const courseProgress = userProgress.filter(p => 
        courseModules.some(m => m.id === p.moduleId)
      );
      
      if (courseProgress.length === 0) return null;
      
      const avgScore = courseProgress.reduce((sum, p) => sum + (p.score || 0), 0) / courseProgress.length;
      const completionRate = courseProgress.filter(p => p.isCompleted).length / courseModules.length;
      
      return {
        courseId: course.id,
        title: course.title,
        avgScore,
        completionRate,
        overallPerformance: (avgScore * 0.7) + (completionRate * 100 * 0.3)
      };
    }).filter(Boolean);
    
    const sortedPerformance = coursePerformance.sort((a, b) => b!.overallPerformance - a!.overallPerformance);
    const strongAreas = sortedPerformance.slice(0, 3).map(p => p!.title);
    const improvementAreas = sortedPerformance.slice(-2).map(p => p!.title);
    
    // Calculate goal alignment
    const activeGoals = goals.filter(g => new Date(g.targetDate) > new Date());
    const goalAlignment = activeGoals.length > 0 ? 
      Math.min(totalModulesCompleted / Math.max(1, activeGoals.reduce((sum, g) => sum + g.targetModulesPerWeek, 0)) * 100, 100) : 50;

    return {
      totalModulesCompleted,
      averageScore,
      preferredDifficulty,
      learningVelocity,
      strongAreas,
      improvementAreas,
      goalAlignment
    };
  }

  private getNextInSequenceRecommendations(
    userProgress: UserProgress[], 
    certificates: Certificate[], 
    userProfile: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const completedModuleIds = new Set(userProgress.filter(p => p.isCompleted).map(p => p.moduleId));
    const completedCourseIds = new Set(certificates.map(c => c.courseId));
    
    // For each course, find the next logical module
    for (const course of COURSES) {
      if (completedCourseIds.has(course.id)) continue; // Course already completed
      
      const courseModules = MODULES
        .filter(m => m.courseId === course.id)
        .sort((a, b) => a.order - b.order);
      
      // Find the next incomplete module in sequence
      let nextModule = null;
      let prerequisitesMet = true;
      
      for (const module of courseModules) {
        if (!completedModuleIds.has(module.id)) {
          nextModule = module;
          break;
        }
      }
      
      if (nextModule) {
        // Check if user has started this course
        const courseProgress = userProgress.filter(p => 
          courseModules.some(m => m.id === p.moduleId)
        );
        
        const priorityScore = courseProgress.length > 0 ? 85 : 70; // Higher if course is started
        
        recommendations.push({
          id: `next-seq-${nextModule.id}`,
          type: 'next-in-sequence',
          moduleId: nextModule.id,
          courseId: course.id,
          title: `Continue with ${nextModule.title}`,
          description: `Next module in ${course.title}`,
          reasoning: `You're making good progress in ${course.title}. ${nextModule.title} is the next logical step in your learning journey.`,
          priorityScore,
          estimatedTime: course.estimatedDuration,
          difficulty: isValidDifficulty(course.difficulty) ? course.difficulty : 'beginner',
          metadata: {
            currentProgress: (courseProgress.filter(p => p.isCompleted).length / courseModules.length) * 100,
            prerequisitesMet,
            timeToComplete: course.estimatedDuration,
            userEngagement: priorityScore > 80 ? 'high' : 'medium'
          }
        });
      }
    }
    
    return recommendations;
  }

  private getGoalAlignedRecommendations(
    userProgress: UserProgress[], 
    goals: Goal[], 
    userProfile: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const activeGoals = goals.filter(g => new Date(g.targetDate) > new Date());
    
    for (const goal of activeGoals) {
      if (!goal.courseId) continue; // Skip global goals for now
      
      const course = COURSES.find(c => c.id === goal.courseId);
      if (!course) continue;
      
      const courseModules = MODULES
        .filter(m => m.courseId === goal.courseId)
        .sort((a, b) => a.order - b.order);
      
      const completedInCourse = userProgress.filter(p => 
        courseModules.some(m => m.id === p.moduleId) && p.isCompleted
      ).length;
      
      const remainingModules = courseModules.length - completedInCourse;
      const daysUntilGoal = Math.max(0, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      const weeksUntilGoal = Math.max(0.1, daysUntilGoal / 7);
      
      const requiredVelocity = remainingModules / weeksUntilGoal;
      const urgencyScore = Math.min(requiredVelocity / goal.targetModulesPerWeek, 2); // 0-2 scale
      
      // Find next incomplete module in goal course
      const nextModule = courseModules.find(m => 
        !userProgress.some(p => p.moduleId === m.id && p.isCompleted)
      );
      
      if (nextModule) {
        const priorityScore = Math.min(95, 70 + (urgencyScore * 15)); // Higher urgency = higher priority
        
        recommendations.push({
          id: `goal-${goal.id}-${nextModule.id}`,
          type: 'goal-aligned',
          moduleId: nextModule.id,
          courseId: goal.courseId,
          title: `${nextModule.title} (Goal Priority)`,
          description: `Essential for reaching your goal by ${new Date(goal.targetDate).toLocaleDateString()}`,
          reasoning: `This module is critical for achieving your goal to complete ${course.title} by ${new Date(goal.targetDate).toLocaleDateString()}. You need to complete ${remainingModules} modules in ${Math.ceil(weeksUntilGoal)} weeks.`,
          priorityScore,
          estimatedTime: course.estimatedDuration,
          difficulty: isValidDifficulty(course.difficulty) ? course.difficulty : 'beginner',
          metadata: {
            currentProgress: (completedInCourse / courseModules.length) * 100,
            goalAlignment: `${Math.ceil(weeksUntilGoal)} weeks remaining`,
            timeToComplete: `${Math.ceil(remainingModules / goal.targetModulesPerWeek)} weeks at target pace`,
            userEngagement: urgencyScore > 1.5 ? 'high' : urgencyScore > 1 ? 'medium' : 'low'
          }
        });
      }
    }
    
    return recommendations;
  }

  private getReviewNeededRecommendations(
    userProgress: UserProgress[], 
    exerciseAttempts: ExerciseAttempt[], 
    userProfile: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const lowScoreThreshold = 70; // Below this score suggests review needed
    
    // Find modules with low scores that might need review
    const modulesNeedingReview = userProgress.filter(p => 
      p.isCompleted && (p.score || 0) < lowScoreThreshold
    );
    
    for (const progress of modulesNeedingReview) {
      const module = MODULES.find(m => m.id === progress.moduleId);
      const course = module ? COURSES.find(c => c.id === module.courseId) : null;
      
      if (!module || !course) continue;
      
      // Check exercise performance for this module
      const moduleExercises = exerciseAttempts.filter(e => e.moduleId === progress.moduleId);
      const exerciseScores = moduleExercises.map(e => e.score);
      const avgExerciseScore = exerciseScores.length > 0 ? 
        exerciseScores.reduce((a, b) => a + b, 0) / exerciseScores.length : progress.score || 0;
      
      const scoreDifference = lowScoreThreshold - (progress.score || 0);
      const priorityScore = Math.min(90, 50 + scoreDifference); // Higher priority for lower scores
      
      recommendations.push({
        id: `review-${progress.moduleId}`,
        type: 'review-needed',
        moduleId: progress.moduleId,
        courseId: module.courseId,
        title: `Review ${module.title}`,
        description: `Strengthen your understanding with a score boost`,
        reasoning: `Your score of ${progress.score}% in ${module.title} suggests there's room for improvement. A review could help solidify these concepts before moving forward.`,
        priorityScore,
        estimatedTime: "30-45 minutes",
        difficulty: isValidDifficulty(course.difficulty) ? course.difficulty : 'beginner',
        metadata: {
          currentProgress: 100, // Already completed
          averageScore: Math.round(avgExerciseScore),
          userEngagement: avgExerciseScore < 60 ? 'low' : 'medium'
        }
      });
    }
    
    return recommendations.slice(0, 3); // Limit review recommendations
  }

  private getSimilarInterestsRecommendations(
    userProgress: UserProgress[], 
    userProfile: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const completedModuleIds = new Set(userProgress.filter(p => p.isCompleted).map(p => p.moduleId));
    
    // Find courses where user has shown strong performance
    const strongCourses = COURSES.filter(course => {
      const courseModules = MODULES.filter(m => m.courseId === course.id);
      const courseProgress = userProgress.filter(p => 
        courseModules.some(m => m.id === p.moduleId)
      );
      
      if (courseProgress.length === 0) return false;
      
      const avgScore = courseProgress.reduce((sum, p) => sum + (p.score || 0), 0) / courseProgress.length;
      return avgScore >= 75; // Strong performance threshold
    });
    
    // Recommend similar courses or advanced topics
    for (const strongCourse of strongCourses) {
      // Find related courses by difficulty progression or topic similarity
      const relatedCourses = COURSES.filter(course => 
        course.id !== strongCourse.id &&
        !userProgress.some(p => MODULES.some(m => m.courseId === course.id && m.id === p.moduleId)) &&
        (
          // Same difficulty level with different focus
          course.difficulty === strongCourse.difficulty ||
          // Next difficulty level
          (strongCourse.difficulty === 'beginner' && course.difficulty === 'intermediate') ||
          (strongCourse.difficulty === 'intermediate' && course.difficulty === 'advanced')
        )
      );
      
      for (const relatedCourse of relatedCourses.slice(0, 2)) { // Limit to 2 per strong course
        const firstModule = MODULES
          .filter(m => m.courseId === relatedCourse.id)
          .sort((a, b) => a.order - b.order)[0];
        
        if (firstModule) {
          const priorityScore = strongCourse.difficulty === relatedCourse.difficulty ? 65 : 75;
          
          recommendations.push({
            id: `similar-${strongCourse.id}-${relatedCourse.id}`,
            type: 'similar-interests',
            moduleId: firstModule.id,
            courseId: relatedCourse.id,
            title: `Explore ${relatedCourse.title}`,
            description: `Based on your success in ${strongCourse.title}`,
            reasoning: `Since you performed well in ${strongCourse.title}, you might enjoy ${relatedCourse.title}. It builds on similar concepts ${relatedCourse.difficulty !== strongCourse.difficulty ? 'with increased complexity' : 'with a different focus'}.`,
            priorityScore,
            estimatedTime: relatedCourse.estimatedDuration,
            difficulty: isValidDifficulty(relatedCourse.difficulty) ? relatedCourse.difficulty : 'beginner',
            metadata: {
              currentProgress: 0,
              userEngagement: 'medium'
            }
          });
        }
      }
    }
    
    return recommendations.slice(0, 4); // Limit similar interest recommendations
  }

  private getDifficultyProgressiveRecommendations(
    userProgress: UserProgress[], 
    certificates: Certificate[], 
    userProfile: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const completedCourseIds = new Set(certificates.map(c => c.courseId));
    
    // Check for beginner courses completed, suggest intermediate
    const completedBeginnerCourses = COURSES.filter(c => 
      c.difficulty === 'beginner' && completedCourseIds.has(c.id)
    );
    
    if (completedBeginnerCourses.length > 0 && userProfile.averageScore >= 75) {
      const intermediateCourses = COURSES.filter(c => 
        c.difficulty === 'intermediate' && !completedCourseIds.has(c.id)
      );
      
      for (const course of intermediateCourses.slice(0, 2)) {
        const firstModule = MODULES
          .filter(m => m.courseId === course.id)
          .sort((a, b) => a.order - b.order)[0];
        
        if (firstModule) {
          recommendations.push({
            id: `diff-prog-${course.id}`,
            type: 'difficulty-progressive',
            moduleId: firstModule.id,
            courseId: course.id,
            title: `Level Up: ${course.title}`,
            description: `Ready for intermediate challenges`,
            reasoning: `With an average score of ${Math.round(userProfile.averageScore)}% and ${completedBeginnerCourses.length} beginner course(s) completed, you're ready to tackle intermediate-level content in ${course.title}.`,
            priorityScore: 80,
            estimatedTime: course.estimatedDuration,
            difficulty: isValidDifficulty(course.difficulty) ? course.difficulty : 'beginner',
            metadata: {
              currentProgress: 0,
              prerequisitesMet: true,
              userEngagement: 'high'
            }
          });
        }
      }
    }
    
    return recommendations;
  }

  private getTimeBasedRecommendations(
    userProgress: UserProgress[], 
    goals: Goal[], 
    userProfile: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Analyze learning patterns by time
    const recentActivity = userProgress.filter(p => 
      p.lastAttempt && 
      new Date(p.lastAttempt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last week
    );
    
    // If user has been active recently, suggest continuing momentum
    if (recentActivity.length > 0 && userProfile.learningVelocity > 1) {
      const incompleteCourses = COURSES.filter(course => {
        const courseModules = MODULES.filter(m => m.courseId === course.id);
        const completedInCourse = userProgress.filter(p => 
          courseModules.some(m => m.id === p.moduleId) && p.isCompleted
        ).length;
        
        return completedInCourse > 0 && completedInCourse < courseModules.length; // Partially completed
      });
      
      for (const course of incompleteCourses.slice(0, 2)) {
        const courseModules = MODULES
          .filter(m => m.courseId === course.id)
          .sort((a, b) => a.order - b.order);
        
        const nextModule = courseModules.find(m => 
          !userProgress.some(p => p.moduleId === m.id && p.isCompleted)
        );
        
        if (nextModule) {
          recommendations.push({
            id: `time-momentum-${nextModule.id}`,
            type: 'time-based',
            moduleId: nextModule.id,
            courseId: course.id,
            title: `Keep the Momentum: ${nextModule.title}`,
            description: `Strike while you're in the learning zone`,
            reasoning: `You've been actively learning with ${recentActivity.length} activities this week. Keep the momentum going with the next module in ${course.title}.`,
            priorityScore: 78,
            estimatedTime: "45-60 minutes",
            difficulty: isValidDifficulty(course.difficulty) ? course.difficulty : 'beginner',
            metadata: {
              userEngagement: 'high',
              timeToComplete: "Now - you're in the zone!"
            }
          });
        }
      }
    }
    
    return recommendations;
  }

  private prioritizeAndDeduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    // Remove duplicates by moduleId
    const seen = new Set<string>();
    const unique = recommendations.filter(rec => {
      const key = rec.moduleId || rec.courseId || rec.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Sort by priority score (descending)
    return unique
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 10); // Limit to top 10 recommendations
  }
}