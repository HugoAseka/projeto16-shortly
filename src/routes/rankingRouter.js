import { getRankings } from "../controllers/rankingContoller.js";
import { Router } from "express";

const router = Router();

router.get("/ranking",getRankings);

export default router;