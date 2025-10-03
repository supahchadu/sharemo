import mongoose from 'mongoose';

let isConnected = false; // cehck connction stats

export const connectToDB = async() => {
    mongoose.set('strictQuery', true);

    if(!process.env.MONGODB_URL) return console.log('MONGODB_URL not found');
    if(isConnected) return console.log('connected to Database');

    try{
        await mongoose.connect(process.env.MONGODB_URL);
    }catch(error){
        console.log(error);
    }
}