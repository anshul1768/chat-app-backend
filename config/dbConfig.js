import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongo_uri = process.env.MONGO_DB_URI;
    console.log(mongo_uri);
    const connect = await mongoose.connect(mongo_uri);

    if(connect){
        console.log(`MongoDB connect successfully`);
    }
    else{

    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB
