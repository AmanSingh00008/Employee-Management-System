import { randomUUID } from "node:crypto";

export const requestId = (req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-ID", req.requestId);
  next();
};