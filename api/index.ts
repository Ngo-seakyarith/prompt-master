import express from "express";
import { registerRoutes } from "../server/routes";

console.log("API Index - Starting serverless function");
console.log("Environment check:");
console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "NOT SET");
console.log("- BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL ? "Set" : "NOT SET");
console.log("- BETTER_AUTH_SECRET:", process.env.BETTER_AUTH_SECRET ? "Set" : "NOT SET");
console.log("- GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Set" : "NOT SET");
console.log("- GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID ? "Set" : "NOT SET");

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Logging middleware (before routes)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Initialize routes (cached to avoid re-initialization in serverless)
let routesInitialized = false;
const initializeRoutes = async () => {
  if (!routesInitialized) {
    console.log("Initializing routes...");
    try {
      await registerRoutes(app);
      console.log("Routes initialized successfully");
    } catch (error) {
      console.error("Failed to initialize routes:", error);
      throw error;
    }

    // Error handling middleware
    app.use((err: any, req: any, res: any, next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error(`Error: ${status} - ${message}`, err);
      res.status(status).json({ message });
    });

    routesInitialized = true;
  }
};

// Export for Vercel serverless
export default async (req: any, res: any) => {
  console.log(`Request: ${req.method} ${req.url}`);

  // Simple health check
  if (req.url === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        database: process.env.DATABASE_URL ? 'configured' : 'missing',
        auth_url: process.env.BETTER_AUTH_URL ? 'configured' : 'missing',
        auth_secret: process.env.BETTER_AUTH_SECRET ? 'configured' : 'missing',
        google_client: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing',
        github_client: process.env.GITHUB_CLIENT_ID ? 'configured' : 'missing'
      }
    });
  }

  try {
    await initializeRoutes();
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({
      error: "Serverless function failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
