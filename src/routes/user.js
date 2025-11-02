import express from "express";
import UserController from "../controllers/user.js";
import auth from "../middleware/auth.js";   // ✅ YOUR middleware

const router = express.Router();

// ✅ Add Personal Transaction
router.post("/transaction/personal", auth, UserController.addPersonalTransaction);

export default router;
