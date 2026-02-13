import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import portfolioRoutes from "./routes/portfolioRouter.js";
import testimonialRoutes from "./routes/testimonialRouter.js";
import mediaRoutes from "./routes/mediaRouter.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import path from 'path';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: "*",
  credentials: true
}));

// Body parser middleware for JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.get("/", (req, res) => {
  res.send("Server Running");
});

app.use("/api/projects", portfolioRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/media", mediaRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Uploads directory: ${path.join(process.cwd(), 'uploads')}`);
  });
});