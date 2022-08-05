import { Router } from "express";
import validateUser from "../middlewares/validateUser.js";
import { urlShorten, getUrls, redirectToUrl } from "../controllers/urlsController.js";

const router = Router();

router.post("/urls/shorten", validateUser, urlShorten);
router.get("/urls/:id",getUrls);
router.get("/urls/open/:shortUrl", redirectToUrl);

export default router;
