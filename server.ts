import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import roleRoutes from "./routes/roleRoute.js";
import userRoutes from "./routes/userRoutes.js"; 
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/auth.js";
import taskRoutes from "./routes/taskRoutes.js"
import cors from 'cors'

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is running");
});


app.use("/api/auth", authRoutes);
app.use("/api/role", authMiddleware, roleRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/tasks",authMiddleware,taskRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});