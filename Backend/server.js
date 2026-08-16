import 'dotenv/config';
import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import { connectRedis } from './src/config/redis.js';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

connectToDB()
connectRedis()

app.listen(3000 , () => {
    console.log("Server is runnning on port 3000")
})

