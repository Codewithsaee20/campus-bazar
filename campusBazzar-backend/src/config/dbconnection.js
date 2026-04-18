import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Db connected succesfully");
    } catch (error) {
        console.error("Error connecting to DB:", error);
    }
}

export default connectDB;