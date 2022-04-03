import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
const connectDB = async () => {
  // Connecting to the database
  try{const conn =  mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
   
      console.log("Successfully connected to database");
  }catch(error) {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    }
}
export default connectDB;