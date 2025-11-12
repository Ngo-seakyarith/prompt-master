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
