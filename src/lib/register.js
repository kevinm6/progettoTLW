/**
 * TODO: add description of module
 */
import { dbUserCollection } from "./user.js";
import {hash} from "./utils.js";

/**
 * Async function to add a new user, if it doesn't exist
 *
 * @param mongoClient - client mongo passed to avoid import of module
 * @param res - response passed from express
 * @param user - user to be created
 */
export async function register(res, user) {
   if (user.name == undefined) {
      res.status(400).send('Missing Name');
      return;
   }
   if (user.nickname == undefined) {
      res.status(400).send('Missing Nickname');
      return;
   }
   if (user.email == undefined) {
      res.status(400).send('Missing Email');
      return;
   }
   if (user.password == undefined || user.password.length < 3) {
      res.status(400).send('Password is missing or too short');
      return;
   }

   user.password = hash(user.password);

   try {
      var collection = await dbUserCollection();

      // Check if email or nickname already exist in the database
      const existingUser = await collection.findOne({
         $or: [
            { email: user.email },
            { nickname: user.nickname }
         ]
      });

      if (existingUser) {
         res.status(400).send("User with the same email or nickname already exists!");
         return;
      }

      collection.insertOne(user);
      // risposta affermativa con un 200 onde evitare oggetti circolari
      res.status(200).send();
   } catch (e) {
      if (e.code == 11000) {
         res.status(400).send("User already exists!");
         return;
      }
      res.status(500).send(`Generic Error: ${e}`);
   }
}

