import { MongoClient } from "mongodb";
import { mongodb } from "../config/prefs.js";

let _db;

/**
 * Create a singleton for MongoDB connection
 *
 * @param collection - if present, collection of database to use
 * @return _db - database instance of MongoDB
 */
export const Db = async (collection) => {
   // console.log(!collection, collection == undefined)
   if(_db && ! collection == undefined) {
      // console.log(_db);
      return _db;
   }
   let client;
   try {
      client = new MongoClient(mongodb.uri).db(mongodb.dbName);
      if (collection) {
         _db = client.collection(collection);
      } else {
         _db = client;
      }
      console.log("✅ MongoDB connected successful")
   } catch (e) {
      console.error(`⚠️ Error connection with MongoDB:\n\t${e.message}`);
      process.exit(1);
   }
   return _db
}

