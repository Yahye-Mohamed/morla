import mongoose from "mongoose";

const globalForMongo = globalThis;

if (!globalForMongo.__morlaMongo) {
  globalForMongo.__morlaMongo = { conn: null, promise: null };
}

const cached = globalForMongo.__morlaMongo;

export async function connectMongo() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((client) => client);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
