import { configDotenv } from "dotenv";
configDotenv();

const myConfig = {
    DBURI: process.env.DBURI,
    PORT: process.env.PORT
}

export default myConfig;