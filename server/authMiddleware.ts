import type { RequestHandler } from "express";
import { auth } from "./auth";

// Better Auth middleware for Express
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user to request
    (req as any).user = session.user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Development mode bypass (for local testing)
export const devAuthBypass: RequestHandler = (req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development' ||
                       process.env.REPL_SLUG === undefined ||
                       req.hostname.includes('localhost') ||
                       req.hostname.includes('127.0.0.1');

  if (isDevelopment && process.env.SKIP_AUTH === 'true') {
    console.log('🚨 DEVELOPMENT MODE: Bypassing authentication');
    // Create a mock user for development
    (req as any).user = {
      id: 'dev-user-123',
      email: 'dev@example.com',
      name: 'Dev User',
    };
    return next();
  }

  next();
};
