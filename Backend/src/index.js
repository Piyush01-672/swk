import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"; // Changed to named import
import authRoutes from "./routes/auth.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import usersRoutes from "./routes/users.routes.js";
import serviceRoutes from "./routes/service.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB()
  .then(() => {
    // Health Check
    app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/worker-profiles", workerRoutes);
    app.use("/api/bookings", bookingRoutes);
    app.use("/api/users", usersRoutes);
    app.use("/api/service_categories", serviceRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("Failed to start server due to DB connection error", err);
  });
