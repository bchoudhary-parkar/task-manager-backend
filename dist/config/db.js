import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URL = process.env.MONGO_URI || "";
export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");
    }
    catch (err) {
        console.error("Database connection failed", err);
    }
};
//# sourceMappingURL=db.js.map