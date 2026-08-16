import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";
import otpModel from "../models/otp.model.js";
import {
  getGraceResponse,
  saveGraceResponse,
  acquireRefreshLock,
  releaseRefreshLock,
  waitForGraceResponse,
} from "../utils/refreshGrace.js";

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}



export async function register(req, res) {
  const { username, password } = req.body;
  const email = req.body.email?.trim().toLowerCase();

  try {
    if (!username || !email || !password) {
      return res.status(400).json({
        message:
          "Username, email, and password are required",
      });
    }

    const normalizedUsername = username.trim();

    const isAlreadyRegistered =
      await userModel.findOne({
        $or: [
          { username: normalizedUsername },
          { email },
        ],
      });

    if (isAlreadyRegistered) {
      return res.status(409).json({
        message:
          "Username or email is already registered",
      });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const otp = String(generateOtp());

    const html = getOtpHtml(otp);

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await otpModel.deleteMany({
      email,
    });

    await otpModel.create({
      username: normalizedUsername,
      email,
      passwordHash: hashedPassword,
      otpHash,
      expiresAt,
    });

    await sendEmail(
      email,
      "OTP Verification",
      `Your OTP code is ${otp}`,
      html
    );

    return res.status(200).json({
      message: "OTP sent successfully",
      email,
    });
  } catch (error) {
    console.error("register error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function login(req, res) {
    try {

        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
    
        if(!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

    
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    
        const isValidPassword = hashedPassword === user.password;
        
        if(!isValidPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const refreshToken = await jwt.sign({
            id: user._id
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        });

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        const accessToken = await jwt.sign({
            id: user._id,
            sessionId: session._id
        }, config.JWT_SECRET, {
            expiresIn: "15m"
        });

        res.cookie(
            "refreshToken",
            refreshToken,
            refreshCookieOptions()
        );

        return res.status(200).json({
            message: "Loggged in successfully",
            user: {
                username: user.username,
                email: user.email
            },
            accessToken
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function getMe(req, res) {
    try {
        
        const token = req.headers.authorization?.split(" ")[1];

        if(!token) {
            return res.status(401).json({
                message: "Token not found"
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id);

        if(!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user: {
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

export async function refreshToken(req, res) {
  const incomingRefreshToken =
    req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      message: "Refresh token not found",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      config.JWT_SECRET
    );
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }

  const oldRefreshTokenHash = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");

  try {
    /*
     * Step 1:
     * If another request already rotated this token,
     * return the exact same result.
     */
    const existingGraceResponse =
      await getGraceResponse(oldRefreshTokenHash);

    if (existingGraceResponse) {
      res.cookie(
        "refreshToken",
        existingGraceResponse.refreshToken,
        refreshCookieOptions()
      );

      return res.status(200).json({
        message: "Refresh accepted during grace period",
        accessToken: existingGraceResponse.accessToken,
      });
    }

    /*
     * Step 2:
     * Allow only one request to perform rotation.
     */
    const lockValue = await acquireRefreshLock(
      oldRefreshTokenHash
    );

    if (!lockValue) {
      /*
       * Another request is currently rotating the token.
       * Wait until its result appears in Redis.
       */
      const graceResponse =
        await waitForGraceResponse(oldRefreshTokenHash);

      if (!graceResponse) {
        return res.status(409).json({
          message:
            "Refresh token rotation is currently in progress",
        });
      }

      res.cookie(
        "refreshToken",
        graceResponse.refreshToken,
        refreshCookieOptions()
      );

      return res.status(200).json({
        message: "Refresh accepted during grace period",
        accessToken: graceResponse.accessToken,
      });
    }

    try {
      /*
       * Step 3:
       * Recheck Redis after acquiring the lock.
       * Another request may have completed just before this one.
       */
      const responseAfterLock =
        await getGraceResponse(oldRefreshTokenHash);

      if (responseAfterLock) {
        res.cookie(
          "refreshToken",
          responseAfterLock.refreshToken,
          refreshCookieOptions()
        );

        return res.status(200).json({
          message: "Refresh accepted during grace period",
          accessToken: responseAfterLock.accessToken,
        });
      }

      /*
       * Step 4:
       * Find the session using only the hash.
       */
      const session = await sessionModel.findOne({
        refreshTokenHash: oldRefreshTokenHash,
        revoked: false,
      });

      if (!session) {
        return res.status(401).json({
          message: "Invalid or reused refresh token",
        });
      }

      if (String(session.user) !== String(decoded.id)) {
        return res.status(401).json({
          message: "Refresh token does not belong to this session",
        });
      }

      /*
       * Step 5:
       * Create the new token pair.
       */
      const newRefreshToken = jwt.sign(
        {
          id: decoded.id,
          sessionId: session._id.toString(),
        },
        config.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      const newRefreshTokenHash = crypto
        .createHash("sha256")
        .update(newRefreshToken)
        .digest("hex");

      const accessToken = jwt.sign(
        {
          id: decoded.id,
          sessionId: session._id.toString(),
        },
        config.JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      /*
       * Step 6:
       * Update MongoDB with only the new hash.
       */
      session.refreshTokenHash = newRefreshTokenHash;
      await session.save();

      /*
       * Step 7:
       * Store the first response temporarily in Redis.
       *
       * This is not stored in MongoDB.
       * It disappears automatically after 5 seconds.
       */
      const graceResponse = {
        refreshToken: newRefreshToken,
        accessToken,
      };

      await saveGraceResponse(
        oldRefreshTokenHash,
        graceResponse
      );

      res.cookie(
        "refreshToken",
        newRefreshToken,
        refreshCookieOptions()
      );

      return res.status(200).json({
        message: "Access token refreshed successfully",
        accessToken,
      });
    } finally {
      await releaseRefreshLock(
        oldRefreshTokenHash,
        lockValue
      );
    }
  } catch (error) {
    console.error("refreshToken error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function logout(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token not found"
            });
        }

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        console.log(refreshTokenHash);
        
        const session = await sessionModel.findOneAndDelete({
            refreshTokenHash,
            revoked: false
        });

        if (!session) {
            return res.status(400).json({
                message: "Invalid refresh token"
            });
        }


        res.clearCookie(
            "refreshToken",
            refreshCookieOptions()
        );

        return res.status(200).json({
            message: "Logged out successfully"
        });
        
    } catch (error) {
        console.error("logout error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function logoutAll(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh Token not found"
            });
        }

        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

        await sessionModel.deleteMany({
            user: decoded.id,
            revoked: false
        });

        res.clearCookie(
            "refreshToken",
            refreshCookieOptions()
        );

        return res.status(200).json({
            message: "Logged out from all devices successfully"
        });
    } catch (error) {
        console.error("logoutAll error:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Refresh token expired"
            });
        }
        return res.status(401).json({
            message: "Invalid refresh token"
        });
    }
}


export async function verifyEmail(req, res) {
    const { otp } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    try {
      if (!email || !otp) {
        return res.status(400).json({
          message: "Email and OTP are required",
        });
      }

      const normalizedOtp = String(otp).trim();

      if (!/^\d{6}$/.test(normalizedOtp)) {
        return res.status(400).json({
          message: "OTP must be a 6-digit number",
        });
      }

      const otpHash = crypto
        .createHash("sha256")
        .update(normalizedOtp)
        .digest("hex");

      const otpDoc = await otpModel.findOne({
        email,
        otpHash,
        expiresAt: {
          $gt: new Date(),
        },
      });

      if (!otpDoc) {
        return res.status(400).json({
          message: "Invalid or expired OTP",
        });
      }

      const isAlreadyRegistered =
        await userModel.findOne({
          $or: [
            { username: otpDoc.username },
            { email: otpDoc.email },
          ],
        });

      if (isAlreadyRegistered) {
        await otpModel.deleteMany({
          email,
        });

        return res.status(409).json({
          message:
            "Username or email is already registered",
        });
      }

      const user = await userModel.create({
        username: otpDoc.username,
        email: otpDoc.email,
        password: otpDoc.passwordHash,
      });

      await otpModel.deleteMany({
        email: otpDoc.email,
      });

      const refreshToken = await jwt.sign({
          id: user._id
      }, config.JWT_SECRET, {
          expiresIn: "7d"
      });

      const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

      const session = await sessionModel.create({
          user: user._id,
          refreshTokenHash,
          ip: req.ip,
          userAgent: req.headers["user-agent"]
      });

      const accessToken = await jwt.sign({
          id: user._id,
          sessionId: session._id
      }, config.JWT_SECRET, {
          expiresIn: "15m"
      });

      res.cookie(
          "refreshToken",
          refreshToken,
          refreshCookieOptions()
      );

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          username: user.username,
          email: user.email,
        },
        accessToken
      });
    } catch (error) {
      console.error("verifyEmail error:", error);

      return res.status(500).json({
          message: "Internal server error",
      });
    }
}