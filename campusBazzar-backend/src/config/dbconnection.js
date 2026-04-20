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

const connectDB = async () => {
    try {
        applyDnsOverrides();

        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            console.warn('MONGO_URI is not set; starting without a database connection.');
            return false;
        }

        await mongoose.connect(mongoUri);
        console.log("Db connected succesfully");
        return true;
    } catch (error) {
        const isSrvDnsError = error?.syscall === "querySrv" && error?.code === "ECONNREFUSED";

        if (isSrvDnsError && process.env.MONGO_URI_DIRECT) {
            try {
                console.warn("SRV DNS lookup failed; trying MONGO_URI_DIRECT fallback...");
                await mongoose.connect(process.env.MONGO_URI_DIRECT);
                console.log("Db connected successfully using MONGO_URI_DIRECT fallback");
                return true;
            } catch (fallbackError) {
                console.error("Error connecting to DB with MONGO_URI_DIRECT:", fallbackError);
            }
        }

        if (isSrvDnsError) {
            console.error("MongoDB SRV DNS lookup failed. Set MONGO_DNS_SERVERS (for example: 8.8.8.8,1.1.1.1) or use MONGO_URI_DIRECT.");
        }

        console.error("Error connecting to DB:", error);
        console.warn('Starting backend without a database connection.');
        return false;
    }
};

export default connectDB;