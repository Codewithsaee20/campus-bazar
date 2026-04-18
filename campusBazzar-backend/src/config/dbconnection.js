import mongoose from "mongoose";
import dns from "node:dns";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI is missing in .env");
    }

    // Some networks block SRV DNS lookups used by mongodb+srv.
    // Force known public resolvers to improve reliability in development.
    const dnsServers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,1.1.1.1")
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);

    if (dnsServers.length > 0) {
        dns.setServers(dnsServers);
    }

    const maxAttempts = Number(process.env.DB_CONNECT_RETRIES || 5);
    const retryDelayMs = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 2000);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 10000,
            });
            console.log("Db connected succesfully");
            return;
        } catch (error) {
            console.error(`Error connecting to DB (attempt ${attempt}/${maxAttempts}):`, error?.message || error);

            if (attempt === maxAttempts) {
                throw error;
            }

            await sleep(retryDelayMs);
        }
    }
};

export default connectDB;