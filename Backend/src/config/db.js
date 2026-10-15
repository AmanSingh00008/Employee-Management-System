
import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `MongoDB connected: ${connection.connection.name}`
    );

    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};
