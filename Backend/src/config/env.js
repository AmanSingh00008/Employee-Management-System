import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name, defaultValue = "") {
  return process.env[name] || defaultValue;
}

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: parseInt(optional("PORT", "4000"), 10),

  MONGODB_URI: required("MONGODB_URI"),

  ACCESS_TOKEN_SECRET: required("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: required("REFRESH_TOKEN_SECRET"),

  ACCESS_TOKEN_TTL: optional("ACCESS_TOKEN_TTL", "15m"),
  REFRESH_TOKEN_TTL_DAYS: parseInt(optional("REFRESH_TOKEN_TTL_DAYS", "7"), 10),

  // Comma-separated list → array
  CORS_ORIGINS: optional("CORS_ORIGINS", "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  PRIVATE_DOCUMENT_DIR: optional("PRIVATE_DOCUMENT_DIR", "./private-documents"),
};
