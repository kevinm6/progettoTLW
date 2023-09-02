import { MongoClient } from "mongodb";
import { mongodb } from "../config/prefs.js";

let _db;

/**
 * Create a singleton for MongoDB connection
 *
 * @param collection - if present, collection of database to connect
 * @returns _db - database instance of MongoDB
 *
 * @usage
 * ```javascript
 *   const dbUserCollection = () => Db('<collection_name>');
 *   let collection = await dbUserCollection();       // è necessario attendere la connessione e response al db
 * ```
 */
export const Db = async (collection) => {
   // console.log(collection, collection == undefined)
   if(_db && ! collection == undefined) {
      return _db;
   }
   try {
      let client = new MongoClient(mongodb.uri).db(mongodb.dbName);
      if (collection) {
         _db = client.collection(collection);
         console.log(`🗂️ MongoDB connected to collection < ${collection} >`)
      } else {
         _db = client;
         console.log("✅ MongoDB connected successful")
      }
   } catch (e) {
      console.error(`🔴 Error connection with MongoDB:\n\t${e.message}`);
      process.exit(1);
   }
   return _db
}
