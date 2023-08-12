/* User lib functions to manage User, used like an interface module */
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { Db } from "./database.js";

const dbUserCollection = async () => await Db('users');
dbUserCollection()

function hash(input) {
   return crypto.createHash('md5').update(input).digest('hex')
}

// TODO: Nelle funzioni sottostanti dobbiamo verificare meglio gli utenti ed eseguire
//       una validazione dei dati nuovi/aggiornati!
//       In questo modo possiamo gestire diversamente i vari check per dati mancanti ecc..



export async function getUser(req) {
   var id = req.params.id;
   console.log(id)

   console.log(dbUserCollection)
   return

   // var mongoClient = await new mongoClient(mongodb.url).connect();
   // var user = await mongoClient
   //    .db(mongodb.dbName)
   //    .collection("users")
   //    .find({ _id: new ObjectId(id) })
   //    .project({ password: 0 })
   //    .toArray();
   // res.json(user);
}


export async function getUsers(res) {
   // console.log(dbUserCollection)
   let user = dbUserCollection();
   res.json(user);
}

/**
 * Async function to update an existing user
 *
 * @param mongoClient - client mongo passed to avoid import of module
 * @param res - response passed from express
 * @param id - id of the user to be updated
 * @param updateduser - user to be updated
 */
export async function updateUser(mongoClient, res, id, updatedUser) {
   if (updatedUser.name == undefined) {
      res.status(400).send('Missing Name')
      return
   }
   if (updatedUser.nickname == undefined) {
      res.status(400).send('Missing Nickname')
      return
   }
   if (updatedUser.email == undefined) {
      res.status(400).send('Missing Email')
      return
   }
   if (updatedUser.password == undefined) {
      res.status(400).send('Missing Password')
      return
   }
   updatedUser.password = hash(updatedUser.password)
   try {

      var filter = { _id: new ObjectId(id) }

      var updatedUserToInsert = {
         $set: updatedUser,
      }

      var item = await mongoClient
         .db(mongodb.dbName)
         .collection(mongodb.collections.users)
         .updateOne(filter, updatedUserToInsert)
      res.send(item)
   } catch (e) {
      if (e.code == 11000) {
         res.status(400).send('Utente già presente')
         return
      }
      res.status(500).send(`Errore generico: ${e}`)
   }
}


/**
 * Async function to add a new user, if doesn't exist
 *
 * @param mongoClient - client mongo passed to avoid import of module
 * @param res - response passed from express
 * @param user - user to be created
 */
export async function addUser(mongoClient, res, user) {
   console.log(mongoClient)
   if (user.name == undefined) {
      res.status(400).send('Missing Name')
      return
   }
   if (user.nickname == undefined) {
      res.status(400).send('Missing Nickname')
      return
   }
   if (user.email == undefined) {
      res.status(400).send('Missing Email')
      return
   }
   if (user.password == undefined || user.password.length < 3) {
      res.status(400).send('Password is missing or too short')
      return
   }

   user.password = hash(user.password)

   try {
      var items = await mongoClient
         .db(mongodb.dbName)
         .collection(mongodb.collections.users)
         .insertOne(user)

      res.json(items)
   } catch (e) {
      if (e.code == 11000) {
         res.status(400).send('Utente già presente')
         return
      }
      res.status(500).send(`Errore generico: ${e}`)
   }
}

/**
 * Async function to delete a user
 *
 * @param mongoClient - client mongo passed to avoid import of other module
 * @param res - response passed from express
 * @param id - id of user to be deleted
 */
export async function deleteUser(mongoClient, res, id) {
   let index = users.findIndex((user) => user.id == id)
   if (index == -1) {
      res.status(404).send('User not found')
      return
   }
   users = users.filter((user) => user.id != id)
   res.json(users)
   try {
      var items = await mongoClient
         .db(mongodb.dbName)
         .collection(mongodb.collections.users)
         .deleteOne(user)

      res.json(items)
   } catch (e) {
      if (e.code == 11000) {
         res.status(400).send('Utente già presente')
         return
      }
      res.status(500).send(`Errore generico: ${e}`)
   }
}
