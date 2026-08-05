import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";

export async function register(req, res) {
    const { username, email, password } = req.body;
    try {

        const isAlreadyRegistered = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if(isAlreadyRegistered) {
            return res.status(409).json({
                message: "Username or email is already registered",
            });
        }

        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        const refreshToken = jwt.sign({
            id: user._id,
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

        const accessToken = jwt.sign({
            id: user._id,
            sessionId: session._id
        }, config.JWT_SECRET, {
            expiresIn: "15m"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
                accessToken
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
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

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

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