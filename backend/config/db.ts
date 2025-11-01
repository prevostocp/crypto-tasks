import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://dvdcba:Inspiron15_@cluster0.xwsjaca.mongodb.net/Cryptotasks')
    .then(() => console.log('DB CONNECTED'));
}