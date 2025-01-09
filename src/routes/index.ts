import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("PontoApp API is running");
});

export default router;
