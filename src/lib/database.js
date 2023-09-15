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
   try {
      const client = new MongoClient(mongodb.uri).db(mongodb.dbName);
      if (collection && _db != client.collection(collection)) {
         _db = client.collection(collection);
         console.log(`🗂️ MongoDB connected to collection < ${collection} >`);
      } else if (!collection && _db != client) {
         _db = client;
         console.log("✅ MongoDB connected successful");
      }
   } catch (e) {
      console.error(`🔴 Error connection with MongoDB:\n\t${e.message}`);
      process.exit(1);
   }
   return _db;
};

// export let DbCollectionsValidator = () => {
//    let db = Db();

//    db.runCommand({
//       collMod: 'playlists',
//       validator: {
//          $jsonSchema: {
//             bsonType: "object",
//             required: ["phone", "name"],
//             properties: {
//                phone: {
//                   bsonType: "string",
//                   description: "phone must be a string and is required",
//                },
//                name: {
//                   bsonType: "string",
//                   description: "name must be a string and is required",
//                },
//             },
//          },
//       },
//       validationLevel: "strict",
//    });

//    db.runCommand({
//       collMod: 'community',
//       validator: {
//          $jsonSchema: {
//             bsonType: "object",
//             required: ["phone", "name"],
//             properties: {
//                phone: {
//                   bsonType: "string",
//                   description: "phone must be a string and is required",
//                },
//                name: {
//                   bsonType: "string",
//                   description: "name must be a string and is required",
//                },
//             },
//          },
//       },
//       validationLevel: "strict",
//    });

//    db.runCommand({
//       collMod: 'users',
//       validator: {
//          $jsonSchema: {
//             bsonType: "object",
//             required: ["phone", "name"],
//             properties: {
//                phone: {
//                   bsonType: "string",
//                   description: "phone must be a string and is required",
//                },
//                name: {
//                   bsonType: "string",
//                   description: "name must be a string and is required",
//                },
//             },
//          },
//       },
//       validationLevel: "strict",
//    });
// };
