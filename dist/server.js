import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import roleRoutes from "./routes/roleRoute.js";
import cors from 'cors';
dotenv.config();
connectDB();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.get("/", (_req, res) => {
    res.send("Server is running");
});
app.use((req, _res, next) => {
    // Mock user with all permissions for testing
    req.user = { permissions: [1, 2, 3, 4], roleId: 'admin', email: 'admin@test.com' };
    next();
});
app.use("/api", roleRoutes);
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map