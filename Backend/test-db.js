import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing connection...');
const uri = process.env.MONGO_URI;
console.log('URI:', uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'undefined');

if (!uri) {
    console.error('No MONGO_URI found');
    process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log('Successfully connected to MongoDB!');
        await client.db().command({ ping: 1 });
        console.log('Ping successful');
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await client.close();
    }
}

run();
