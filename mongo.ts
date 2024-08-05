import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_ATLAS_URI || '', {
  driverInfo: { name: 'langchainjs' },
});
await client.connect();
export const collection = client.db('langchain').collection('memory');
export const sessionId = new ObjectId().toString();
