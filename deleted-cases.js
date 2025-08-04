// api/deleted-cases.js
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
        const collection = db.collection('deleted_cases');
        
        if (req.method === 'GET') {
            const deletedCases = await collection.find({}).toArray();
            return res.status(200).json(deletedCases);
        }
        
        if (req.method === 'POST') {
            const { _id } = req.body;
            const caseToRestore = await collection.findOne({ _id: new ObjectId(_id) });
            if (caseToRestore) {
                // Restore case by moving it back to the main collection
                await db.collection('cases').insertOne(caseToRestore);
                await collection.deleteOne({ _id: new ObjectId(_id) });
                return res.status(200).json({ message: 'Case restored successfully' });
            }
            return res.status(404).json({ message: 'Case not found in recycle bin' });
        }
        
        if (req.method === 'DELETE') {
            const { _id } = req.body;
            if (_id) {
                // Permanently delete a single case
                await collection.deleteOne({ _id: new ObjectId(_id) });
                return res.status(200).json({ message: 'Case permanently deleted' });
            } else {
                // Clear all deleted cases
                await collection.deleteMany({});
                return res.status(200).json({ message: 'Recycle bin cleared successfully' });
            }
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};