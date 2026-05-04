import mongoose from "mongoose";

const connectDb = async () => {
    try{
        await mongoose.connect(process.env.DATA_URL,{
             dbName:"Xe"
        });
           console.log("MongoDB connected!");
    }catch(error){
        console.log("Error connecting to the database:", error);
        process.exit(1);
    }
};
export default connectDb;