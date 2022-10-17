// adapted from:
// https://www.mongodb.com/developer/languages/javascript/integrate-mongodb-vercel-functions-serverless-experience/
// https://github.com/vercel/next.js/tree/canary/examples/with-mongodb

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

export let mongoClientPromise = null;
let mongoClient = null;
let database = null;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    mongoClientPromise = new MongoClient(uri, options).connect();
    global._mongoClientPromise = mongoClientPromise;
  } else {
    mongoClientPromise = global._mongoClientPromise;
  }
} else {
  mongoClientPromise = new MongoClient(uri, options).connect();
}

export async function connectToDatabase() {
  // console.log("=====MONDGOB CONNECT ATTMPET");
  try {
    if (mongoClient && database) {
      return database;
    }
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClient) {
        mongoClient = await mongoClientPromise;
        global._mongoClient = mongoClient;
      } else {
        mongoClient = global._mongoClient;
      }
    } else {
      mongoClient = await mongoClientPromise;
    }
    // console.log("====CLIENT LOG", mongoClient);
    database = await mongoClient.db();
    // console.log("====DATABSE LOG", database);
    return database;
  } catch (e) {
    console.error("FINAL TRY ERROR ", e);
  }
}
