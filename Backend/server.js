
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";

let server;

const startServer = async () => {
  try {
    // Connect to MongoDB before accepting API requests.
    await connectDB();

    server = app.listen(env.PORT, () => {
      console.log(
        `Server running at http://localhost:${env.PORT}`
      );
    });
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exitCode = 1;
  }
};

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down...`);

  if (!server) {
    mongoose.disconnect().finally(() => {
      process.exit(0);
    });
    return;
  }

  server.close(async () => {
    try {
      await mongoose.disconnect();
      console.log("Database disconnected.");
      process.exit(0);
    } catch (error) {
      console.error("Shutdown failed:", error.message);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
