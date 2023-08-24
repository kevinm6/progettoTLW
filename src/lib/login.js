// import { config } from "./../config/prefs.js";

/**
 * Maybe is useful use the objectid of mongodb to save it in localStorage and go on
 */

// import { ObjectId } from "mongodb";
import { getUsers, getUser, dbUserCollection } from "./user.js";
import { hash } from "./utils.js";
import { ObjectId } from "mongodb"
/**
 * Async function to get specific user from id
 *
 * @param {string} req - request passed from express
 * @param {string} res - response passed from express
 * @returns {object | string} user information from id passed as request param or status error
 */
export async function login(req, res) {
   let login = req.body;
   if (login.email == undefined) {
      res.status(400).send("Missing Email");
      return;
   }
   if (login.nickname == undefined) {
      res.status(400).send("Missing Nickname");
      return;
   }
   if (login.password == undefined) {
      res.status(400).send("Missing Password");
      return;
   }

   login.password = hash(login.password);

   let collection = await dbUserCollection();
   var filter = {
      $and: [{ email: login.email }, { nickname: login.nickname }, { password: login.password }],
   };
   let loggedUser = await collection.findOne(filter);
   if (loggedUser == null) {
      res.status(401).send("Unauthorized");
   } else {
      // Invia solo l'_id dell'utente
      res.json({
         _id: loggedUser._id,
         nickname: loggedUser.nickname,
         email: loggedUser.email
      });
   }
}


export async function authuser(req, res) {
   let login = req.body;
   console.log(login._id);
   console.log(login.nickname);
   console.log(login.email);
   let collection = await dbUserCollection();

   var filter = {
      $and: [
         { _id: new ObjectId(login._id) },
         { email: login.email },
         { nickname: login.nickname }
      ],
   };

   let loggedUser = await collection.findOne(filter);
   if (loggedUser == null) {
      res.status(401).send("Unauthorized");
   } else {
      res.json(loggedUser);
   }
}

