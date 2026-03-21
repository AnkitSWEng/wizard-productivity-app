// /lib/db.js
import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const db = await mongoose.connect(process.env.MONGODB_URI);

  isConnected = db.connections[0].readyState === 1;
}