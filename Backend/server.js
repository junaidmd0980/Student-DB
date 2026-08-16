import 'dotenv/config';
import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import { connectRedis } from './src/config/redis.js';

connectToDB()
connectRedis()

app.listen(3000 , () => {
    console.log("Server is runnning on port 3000")
})

