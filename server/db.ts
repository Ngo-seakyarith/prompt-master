import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
console.log("Database URL configured:", process.env.DATABASE_URL ? "Yes" : "No");
export const db = drizzle(sql);
