import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/authRouter.js"
import urlsRouter from "./routes/urlsRouter.js"
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRouter);
app.use(urlsRouter);





const PORT = process.env.PORT || 5008;
app.listen(PORT, () => console.log("Servidor Online porta 4000"));