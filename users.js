// api/users.js
import { MongoClient, ObjectId } from 'mongodb';

// استبدل بـ URI الخاص بك
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
    if (!client.isConnected()) await client.connect();
    return client.db(process.env.MONGODB_DB);
}

export default async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('users');
        
        if (req.method === 'GET') {
            const users = await collection.find({}).toArray();
            return res.status(200).json(users);
        }
        
        if (req.method === 'POST') {
            const newUser = req.body;
            const result = await collection.insertOne(newUser);
            return res.status(201).json({ message: 'User added', _id: result.insertedId });
        }
        
        if (req.method === 'PUT') {
            const { _id, ...updatedData } = req.body;
            const result = await collection.updateOne(
                { _id: new ObjectId(_id) },
                { $set: updatedData }
            );
            return res.status(200).json({ message: 'User updated', result });
        }
        
        if (req.method === 'DELETE') {
            const { _id } = req.body;
            await collection.deleteOne({ _id: new ObjectId(_id) });
            return res.status(200).json({ message: 'User deleted' });
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};