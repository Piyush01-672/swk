import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

let db;

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected (Native Driver)");
    db = client.db();
    return db;
  } catch (error) {
    console.error("❌ Connection error:", error.message);
    process.exit(1);
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};
