export interface Course {
  id: string;
  titleKey: string;
  descriptionKey: string;
  order: number;
  isActive: boolean;
  modules: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  content: any;
  isActive: boolean;
  userProgress?: UserProgress;
}

export interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  score: number;
  isCompleted: boolean;
  attempts: number;
  lastAttempt: Date;
}

export interface PlaygroundModel {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}

export interface PlaygroundTest {
  id: string;
  userId: string;
  promptId?: string;
  promptText: string;
  models: string[];
  parameters: any;
  results: PlaygroundTestResult[];
  totalCost: string;
  createdAt: Date;
}

export interface PlaygroundTestResult {
  modelName: string;
  response: string;
  tokenCount: number;
  cost: string;
  responseTime: number;
  error?: string;
}

export interface TestRequest {
  promptText: string;
  models: string[];
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
}
