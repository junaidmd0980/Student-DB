import mongoose from "mongoose";


async function connetToDB() {

    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected To Database")
    }
    catch(err){
        console.log(err)
    }
    
}

export default connetToDB;