import { MongoClient, Db } from "mongodb";
import { env } from "./env";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = env.mongodb.uri;
const dbName = env.mongodb.db;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!uri) {
  throw new Error(
    "Kérlek definiáld a MONGODB_URI környezeti változót a .env.local fájlban."
  );
}

if (!dbName) {
  throw new Error(
    "Kérlek definiáld a MONGODB_DB környezeti változót a .env.local fájlban."
  );
}

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const options = {};

  let clientPromise: Promise<MongoClient>;

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    if (process.env.NODE_ENV === "development") {
      global._mongoClientPromise = undefined;
    }
  }
}
