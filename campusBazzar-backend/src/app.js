import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));
app.use(express.json({limit: '100mb'}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

import authRouter from "./routes/authRoute.js";
import healthCheckRouter from "./routes/healthCheckRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import listingRouter from "./routes/listingRoute.js";
import orderRouter from "./routes/orderRoute.js";
import paymentRouter from "./routes/paymentRoute.js";


app.use("/api/v1/health", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/listings", listingRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payments", paymentRouter);

// Global error handler - must be the last middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const code = err.errorCode || "INTERNAL_ERROR";

    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
        },
    });
});

export default app;