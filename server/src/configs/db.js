import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "ajarin_id",
    });
    console.log(`MongoDB Connected: ${connect.connection.host}`);
    return connect;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error; // Throw error instead of exit
  }
};

export default connectDB;
