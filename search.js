// api/cases/search.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
    if (!client.isConnected()) await client.connect();
    return client.db(process.env.MONGODB_DB);
}

export default async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('cases');
        
        if (req.method === 'POST') {
            const searchCriteria = req.body;
            let query = {};
            
            // Build the query dynamically based on search criteria
            for (const key in searchCriteria) {
                if (searchCriteria[key]) {
                    // Use a case-insensitive regex for text fields
                    query[key] = new RegExp(searchCriteria[key], 'i');
                }
            }
            
            const results = await collection.find(query).toArray();
            return res.status(200).json(results);
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};