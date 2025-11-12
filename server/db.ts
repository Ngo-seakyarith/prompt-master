import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
console.log("Database URL configured:", databaseUrl ? "Yes" : "No");

let sql;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is not set!");
  // Create a dummy connection for development
  sql = neon("postgresql://dummy:dummy@localhost:5432/dummy");
} else {
  try {
    sql = neon(databaseUrl);
    console.log("Database connection initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    // Fallback to dummy connection
    sql = neon("postgresql://dummy:dummy@localhost:5432/dummy");
  }
}

export const db = drizzle(sql);
