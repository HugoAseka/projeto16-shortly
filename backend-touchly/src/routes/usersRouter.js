import { Router } from "express";
import { getUserUrls } from "../controllers/usersController.js";
import validateUser from "../middlewares/validateUser.js";

const router = Router();

router.get("/users/me", validateUser, getUserUrls);

export default router;
