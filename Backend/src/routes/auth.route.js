import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/get-me", authController.getMe)
router.get("/refresh-token", authController.refreshToken)
router.get("/logout", authController.logout)
router.get("/logout-all", authController.logoutAll)
router.post("/verify-email", authController.verifyEmail)


export default router;