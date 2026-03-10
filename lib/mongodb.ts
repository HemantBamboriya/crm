import { MongoClient, ServerApiVersion } from 'mongodb';

const dbName = process.env.MONGODB_DB ?? 'civiccrm';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const mongoOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  const clientPromise =
    global._mongoClientPromise ?? new MongoClient(uri, mongoOptions).connect();

  if (process.env.NODE_ENV !== 'production') {
    global._mongoClientPromise = clientPromise;
  }

  const client = await clientPromise;
  return client.db(dbName);
}
