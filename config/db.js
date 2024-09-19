import mongoose from "mongoose";
import myConfig from "./configuration.js";

const connectMongoDb = async () => {
    try {
        const client = await mongoose.connect(myConfig.DBURI);
        console.log("Mongo DB Connected Successfully!");
        return client
    } catch (error) {
        console.log(error.message);
    }
}


export default connectMongoDb;