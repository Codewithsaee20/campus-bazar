import mongoose from "mongoose";
import dns from "node:dns";

const applyDnsOverrides = () => {
    const rawDnsServers = process.env.MONGO_DNS_SERVERS;

    if (!rawDnsServers) {
        return;
    }

    const servers = rawDnsServers
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);

    if (servers.length === 0) {
        return;
    }

    dns.setServers(servers);
    console.log(`Using custom DNS servers for MongoDB resolution: ${servers.join(", ")}`);
};

const getConnectionOptions = () => {
    const isDevEnvironment = process.env.NODE_ENV !== "production";

    return {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        ...(isDevEnvironment && {
            retryWrites: true,
            w: "majority",
        }),
    };
};

const connectDB = async () => {
    try {
        applyDnsOverrides();

        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            console.warn('MONGO_URI is not set; starting without a database connection.');
            return false;
        }

        const connectionOptions = getConnectionOptions();
        await mongoose.connect(mongoUri, connectionOptions);
        console.log("Db connected successfully");
        return true;
    } catch (error) {
        const isSrvDnsError = error?.syscall === "querySrv" && error?.code === "ECONNREFUSED";
        const isNetworkError = error?.code === "ENOTFOUND" || error?.message?.includes("getaddrinfo");

        if ((isSrvDnsError || isNetworkError) && process.env.MONGO_URI_DIRECT) {
            try {
                console.warn("Network/DNS error detected; trying MONGO_URI_DIRECT fallback...");
                const connectionOptions = getConnectionOptions();
                await mongoose.connect(process.env.MONGO_URI_DIRECT, connectionOptions);
                console.log("Db connected successfully using MONGO_URI_DIRECT fallback");
                return true;
            } catch (fallbackError) {
                console.error("Error connecting to DB with MONGO_URI_DIRECT:", fallbackError);
            }
        }

        if (isSrvDnsError) {
            console.error("MongoDB SRV DNS lookup failed. Solutions:");
            console.error("  1. Set MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1");
            console.error("  2. Use MONGO_URI_DIRECT (direct connection without SRV)");
        }

        if (isNetworkError) {
            console.error("Network connectivity error detected. For mobile networks:");
            console.error("  1. Ensure MongoDB Atlas Network Access allows 0.0.0.0/0");
            console.error("  2. Or add specific teammate IP via Dashboard → Network Access");
        }

        console.error("Error connecting to DB:", error?.message);
        console.warn('Starting backend without a database connection.');
        return false;
    }
};

export default connectDB;