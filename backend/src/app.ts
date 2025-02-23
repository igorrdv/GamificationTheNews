import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import webhookRoutes from "./routes/webhookRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();
const server = express();

server.use(cors());
server.use(express.urlencoded({ extended: true }));

server.use(express.json());

server.use("/api/webhook", webhookRoutes);
server.use("/api/users", userRoutes);
server.use("/api/admin", adminRoutes);

server.use((req: Request, res: Response) => {
  res.status(404);
  res.json({ error: "Endpoint não encontrado." });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Servidor rodando");
});
