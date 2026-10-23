import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import Session from "../models/session.model.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || "15m",
  });
}

function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: `${process.env.REFRESH_TOKEN_TTL_DAYS || 7}d`,
  });
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function setRefreshCookie(res, token) {
  const days = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "7", 10);
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: days * 24 * 60 * 60 * 1000,
  });
}

function isDuplicateKeyError(error) {
  return error?.code === 11000;
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const isFirstAccount = (await User.countDocuments()) === 0;

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: isFirstAccount ? "super_admin" : "employee",
    });

    const refreshToken = signRefreshToken(user._id);
    const accessToken = signAccessToken(user._id);

    await Session.create({
      userId: user._id,
      refreshTokenHash: hashToken(refreshToken),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      message: "Account created successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({ message: "Unable to create account" });
  }
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function login(req, res) {
  try {
    const { email, password, loginAs } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const allowedLoginRoles = ["employee", "manager", "admin"];
    if (loginAs && !allowedLoginRoles.includes(loginAs)) {
      return res.status(400).json({ message: "Invalid login role" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
    if (!user || typeof user.passwordHash !== "string") {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Your account is not active" });
    }

    const roleMatches = !loginAs ||
      (loginAs === "admin" && ["super_admin", "hr_admin"].includes(user.role)) ||
      user.role === loginAs;

    if (!roleMatches) {
      return res.status(403).json({
        message: `This account does not have the ${loginAs} role`,
      });
    }

    const refreshToken = signRefreshToken(user._id);
    const accessToken = signAccessToken(user._id);

    await Session.create({
      userId: user._id,
      refreshTokenHash: hashToken(refreshToken),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    user.lastLoginAt = new Date();
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      message: "Logged in successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to log in" });
  }
}

// ─── Get Me ──────────────────────────────────────────────────────────────────

export async function getMe(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ─── Refresh Token ───────────────────────────────────────────────────────────

export async function refreshToken(req, res) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const session = await Session.findOne({
      userId: decoded.sub,
      refreshTokenHash: hashToken(token),
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({ message: "Session invalid or revoked" });
    }

    const user = await User.findById(decoded.sub);
    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    // Rotate tokens
    const newRefreshToken = signRefreshToken(user._id);
    const newAccessToken = signAccessToken(user._id);

    session.refreshTokenHash = hashToken(newRefreshToken);
    await session.save();

    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logout(req, res) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(400).json({ message: "Refresh token not found" });
  }

  try {
    const session = await Session.findOne({
      refreshTokenHash: hashToken(token),
      revoked: false,
    });

    if (session) {
      session.revoked = true;
      await session.save();
    }
  } catch {
    // Ignore DB errors — still clear the cookie
  }

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out successfully" });
}

// ─── Logout All Devices ──────────────────────────────────────────────────────

export async function logoutAll(req, res) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(400).json({ message: "Refresh token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    await Session.updateMany({ userId: decoded.sub, revoked: false }, { revoked: true });

    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out from all devices successfully" });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
