// api/cases.js
const { MongoClient, ObjectId } = require('mongodb');

// رابط الاتصال بقاعدة البيانات، يتم الحصول عليه من متغيرات البيئة في Vercel
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = async (req, res) => {
  try {
    await client.connect();
    const database = client.db('my-case-manager-db'); // يمكنك تغيير هذا الاسم
    const collection = database.collection('cases');

    // التعامل مع طلبات GET (جلب جميع القضايا)
    if (req.method === 'GET') {
      const cases = await collection.find({}).toArray();
      res.status(200).json(cases);
    } 
    // التعامل مع طلبات POST (إضافة قضية جديدة)
    else if (req.method === 'POST') {
      const newCase = req.body;
      const result = await collection.insertOne(newCase);
      res.status(201).json(result.ops[0]);
    } 
    // التعامل مع طلبات PUT (تعديل قضية)
    else if (req.method === 'PUT') {
      const { _id, ...updatedData } = req.body;
      const result = await collection.updateOne(
        { _id: new ObjectId(_id) },
        { $set: updatedData }
      );
      res.status(200).json(result);
    } 
    // التعامل مع طلبات DELETE (حذف قضية)
    else if (req.method === 'DELETE') {
      const { _id } = req.body;
      const result = await collection.deleteOne({ _id: new ObjectId(_id) });
      res.status(200).json(result);
    } 
    // التعامل مع أي طلبات أخرى غير مدعومة
    else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
};