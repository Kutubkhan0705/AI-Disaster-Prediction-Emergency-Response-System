import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import floodRoutes from "./routes/floodRoutes.js";
import earthquakeRoutes from "./routes/earthquakeRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import cycloneRoutes from "./routes/cycloneRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import disasterRoutes from "./routes/disasterRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Make io accessible inside controllers via req.app.get("io")
app.set("io", io);

// ---- Middleware ----
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(morgan("dev"));

// ---- Routes ----
app.get("/", (req, res) => {
  res.json({ message: "AI Disaster Prediction & Alert System API is running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/flood", floodRoutes);
app.use("/api/earthquake", earthquakeRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/cyclone", cycloneRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/disasters", disasterRoutes);

// ---- Socket.io real-time events ----
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on("joinRegion", (region) => {
    socket.join(region);
    console.log(`Socket ${socket.id} joined region room: ${region}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ---- Error handling ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
  });
};

startServer();
