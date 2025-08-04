// api/activities.js
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
    if (!client.isConnected()) await client.connect();
    return client.db(process.env.MONGODB_DB);
}

export default async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('activities');
        
        if (req.method === 'GET') {
            const activities = await collection.find({}).sort({ timestamp: -1 }).toArray();
            return res.status(200).json(activities);
        }
        
        if (req.method === 'POST') {
            const newActivity = {
                ...req.body,
                timestamp: new Date()
            };
            const result = await collection.insertOne(newActivity);
            return res.status(201).json({ message: 'Activity logged', _id: result.insertedId });
        }
        
        if (req.method === 'DELETE') {
            await collection.deleteMany({});
            return res.status(200).json({ message: 'Activity log cleared' });
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};