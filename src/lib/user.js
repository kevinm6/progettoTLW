/* User lib functions to manage User, used like an interface module */
import { ObjectId } from "mongodb";
import { Db } from "./database.js";
import { hash } from "./utils.js";
import { deletePlaylist, deleteUserPlaylists}from "./playlist.js";


/**
 * User Collection from MongoDB
 */
export const dbUserCollection = () => Db('users');



/*
 * TODO: Nelle funzioni sottostanti dobbiamo verificare meglio gli utenti ed eseguire
 *       una validazione dei dati nuovi/aggiornati!
 *       In questo modo possiamo gestire diversamente i vari check per dati mancanti ecc..
 */


/**
 * Async function to get specific user from id
 *
 * @param req - request passed from express
 * @returns {object} user information from id passed as request param
 */
export async function getUser(req, res) {
   let id = req.params.id;
   let collection = await dbUserCollection();
   let user = await collection
      .findOne({ _id: new ObjectId(id) })
   res.json(user);
}


/**
 * Async function to get all users
 *
 * @param {object} res - response passed from express
 * @returns {array.<object>} array of users
 */
export async function getUsers(res) {
   let collection = await dbUserCollection();
   let users = await collection
      .find({})
      .project({})
      .toArray();
   res.json(users);
}


/**
 * Async function to update an existing user
 *
 * @param mongoClient - client mongo passed to avoid import of module
 * @param res - response passed from express
 * @param id - id of the user to be updated
 * @param updateduser - user to be updated
 */
export async function updateUser(res, id, updatedUser) {
   console.log(id);
   if (updatedUser.name == undefined) {
      res.status(400).send('Missing Name');
      return;
   }
   if (updatedUser.nickname == undefined) {
      res.status(400).send('Missing Nickname');
      return;
   }
   if (updatedUser.email == undefined) {
      res.status(400).send('Missing Email');
      return;
   }

   try {
      var filter = { _id: new ObjectId(id) };
      var updatedUserToInsert = {
         $set: {
            name: updatedUser.name,
            nickname: updatedUser.nickname,
            email: updatedUser.email,
            surname: updatedUser.surname,
         },
      };

      if (updatedUser.password !== undefined && updatedUser.password !== "") {
         updatedUserToInsert.$set.password = hash(updatedUser.password);
      }
      console.log(updatedUserToInsert);
      var item = await dbUserCollection();
      item.updateOne(filter, updatedUserToInsert);
      console.log("OK");
      res.status(200).send();
   } catch (e) {
      if (e.code == 11000) {
         res.status(400).send("User already exists!");
         return;
      }
      res.status(500).send(`Generic Error: ${e}`);
   }
}


/**
 * Async function to delete a user
 *
 * @param mongoClient - client mongo passed to avoid import of other module
 * @param res - response passed from express
 * @param id - id of user to be deleted
 */
export async function deleteUser(res, id) {
   id= new ObjectId(id);
   try {
      var items = await dbUserCollection();
      await items.deleteOne({_id:id});
      var playlistdel=await deleteUserPlaylists(id);
      res.status(200).send();
   } catch (e) {
      if (e.code == 11000) {
         res.status(400).send("Error while deleting user!");
         console.log(e);
         return
      }
      res.status(500).send(`Generic Error: ${e}`);
      console.log(e);
   }
}

