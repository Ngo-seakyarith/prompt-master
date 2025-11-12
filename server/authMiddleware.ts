import type { RequestHandler } from "express";
import { auth } from "./auth";

// Better Auth middleware for Express
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    console.log("Auth middleware: checking session for", req.path);
    console.log("Headers:", req.headers.authorization ? "Has auth header" : "No auth header");

    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    console.log("Session result:", session ? "Found session" : "No session");

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user to request
    (req as any).user = session.user;
    console.log("User attached:", session.user.email);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
