import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { user, session, account, verification } from "@shared/schema";

console.log("Auth config - BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
console.log("Auth config - BETTER_AUTH_SECRET:", process.env.BETTER_AUTH_SECRET ? "Set" : "Not set");
console.log("Auth config - GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set");
console.log("Auth config - GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID ? "Set" : "Not set");

// Check if required env vars are missing (don't throw, just log)
const missingVars = [];
if (!process.env.BETTER_AUTH_SECRET) missingVars.push("BETTER_AUTH_SECRET");
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) missingVars.push("Google OAuth");
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) missingVars.push("GitHub OAuth");

if (missingVars.length > 0) {
  console.error("Missing required environment variables:", missingVars);
  // Don't throw here, let the function continue with defaults
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "dummy-client-secret",
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  secret: process.env.BETTER_AUTH_SECRET || "dummy-secret-for-development",
  trustedOrigins: [
    "http://localhost:5000",
    "http://localhost:5173",
    "https://promptmastertest.vercel.app",
    process.env.BETTER_AUTH_URL,
  ].filter((origin): origin is string => Boolean(origin)),
});
