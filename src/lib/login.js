import { getUsers, getUser, dbUserCollection } from "./user.js";
import { hash,isValidDate,isValidString,isValidPassword, parseTags,isValidNickname,isValidEmail,log } from "./utils.js";
import { ObjectId } from "mongodb"

/**
 * Handles user login.
 *
 * This function processes login requests and checks the provided credentials.
 * If the login is successful, it returns user information.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {void}
 */
export async function login(req, res) {
   let login = req.body;
   console.log(login)
   if (login.email == undefined && login.nickname == undefined) {
      res.status(400).send("Missing Parameter");
      log("[LOGIN]> login > ERROR 400: missing parameter");
      return;
   }
   if (login.password == undefined) {
      res.status(400).send("Missing Parameter");
      log("[LOGIN]> login > ERROR 400: missing parameter");
      return;
   }
   if (!isValidEmail(login.email) && !isValidString(login.nickname)) {
      res.status(400).send("Invalid Nickname or Email");
      log("[LOGIN]> login > ERROR 400: missing parameter");
      return;
   }
   if (!isValidString(login.password) || !isValidPassword(login.password)) {
      res.status(400).send("Password is invalid");
      log("[LOGIN]> login > ERROR 400: missing parameter");
      return;
   }
   login.password = hash(login.password);
   let collection = await dbUserCollection();
   var filter = {
      $or: [
         { $and: [ { email: login.email }, { password: login.password } ] },
         { $and: [ { nickname: login.nickname }, { password: login.password } ] },
      ],
   };
   try{
      let loggedUser = await collection.findOne(filter);
      if (loggedUser == null) {
         res.status(401).send("Unauthorized");
         log("[LOGIN]> login > ERROR 401: unauthorized parameter");
         return;
      } else {
         res.json({
            _id: loggedUser._id,
            nickname: loggedUser.nickname,
            email: loggedUser.email
         });
         log("[LOGIN]> login > USER "+loggedUser._id+" LOGGED IN");
         return;
      }
   }catch(e){
      res.status(500).send("An erorr has occurred. Try again later");
      log("[LOGIN]> login > ERROR 500: INTERNAL ERROR : "+e);
      return;
   }

}

/**
 * Authenticates a user based on provided credentials.
 *
 * This function verifies user authentication by matching the provided
 * credentials against the database records.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {void}
 */
export async function authuser(req, res) {
   let login = req.body;
   let collection = await dbUserCollection();
   if(!isValidString(login._id)){
      res.status(400).send("Invalid ID");
      log("[LOGIN]> authuser > ERROR 400: missing parameter ");
      return;
   }
   if(!isValidEmail(login.email) ){
      res.status(400).send("Invalid Email");
      log("[LOGIN]> authuser > ERROR 400: missing email");
      return;
   }
   if(!isValidString(login.nickname) ){
      res.status(400).send("Invalid Nickname");
      log("[LOGIN]> authuser > ERROR 400: missing nickname");
      return;
   }
   var filter = {
      $and: [
         { _id: new ObjectId(login._id) },
         { email: login.email },
         { nickname: login.nickname }
      ],
   };
   try{
      let loggedUser = await collection.findOne(filter);
      if (loggedUser == null) {
         res.status(401).send("Unauthorized");
         log("[LOGIN]> authuser > ERROR 401: missing parameter");
         return;
      } else {
         res.json(loggedUser);
         log("[LOGIN]> authuser >  USER "+login._id+" AUTHORIZED");
         return;
      }
   }catch(e){
      res.status(500).send("Internal Error");
      log("[LOGIN]> authuser > ERROR 500: INTERNAL ERROR " + e);
      return;
   }
}

