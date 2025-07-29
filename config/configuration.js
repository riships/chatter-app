import { configDotenv } from "dotenv";
configDotenv();

const myConfig = {
    DBURI: process.env.DBURI || "mongodb://localhost:27017/chat-app",
    PORT: process.env.PORT || 3000
}

export default myConfig;