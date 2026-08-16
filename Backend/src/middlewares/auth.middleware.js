import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import config from "../config/config.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader =
      typeof req.headers?.authorization === "string"
        ? req.headers.authorization
        : typeof req.get === "function"
        ? req.get("Authorization")
        : null;

    if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: access token missing",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: access token missing",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(accessToken, config.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access token expired",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }


    if (!decoded.id || !decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token payload",
      });
    }

    const session = await sessionModel.findOne({
      _id: decoded.sessionId,
      user: decoded.id,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session is no longer valid",
      });
    }

    const user = await userModel
      .findById(decoded.id)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    req.userId = decoded.id;
    req.sessionId = decoded.sessionId;
    req.session = session;

    next();
  } catch (error) {
    console.error("protect middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const permit = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
