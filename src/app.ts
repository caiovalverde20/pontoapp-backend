import express from "express";
import router from "./routes";
import { AppDataSource } from "./database";
import cors from "cors";


const app = express();
const PORT = process.env.PORT || 3000;
AppDataSource.initialize();

app.use(express.json());
app.use(cors());

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
