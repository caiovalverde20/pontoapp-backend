import { Router } from "express";
import userRouter from "./userRoutes";
import workRouter from "./pontoRoutes";

const router = Router();

router.use("/users", userRouter);
router.use("/ponto", workRouter);

export default router;
