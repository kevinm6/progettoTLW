import { ObjectId } from "mongodb";
import { Db } from "./database.js";
import { hash,isValidDate,isValidString,isValidPassword, parseTags,isValidNickname,log,isValidEmail } from "./utils.js";
import { deletePlaylist, deleteUserPlaylists}from "./playlist.js";
export const dbUserCollection = () => Db('users');

/**
 * Fetches user information by their unique ID.
 *
 * This function retrieves user details based on a provided unique ID. It performs validation checks to ensure the ID is a valid string.
 * If the ID is valid, it attempts to find the user in the database collection. If found, it sends a JSON response with the user's details.
 * If the user is not found or if any error occurs during the process, appropriate error responses are sent.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {String} req.params.id - The unique ID of the user to be fetched.
 *
 * @returns {void} This function sends an HTTP response to the client. A JSON response with the user's details is sent upon success.
 * If the provided ID is invalid or if an error occurs during the retrieval process, appropriate error responses are sent.
 *
 * @throws {400} Invalid Parameter - If the provided user ID is not a valid string.
 * @throws {500} Internal Error - If an internal server error occurs during the retrieval process.
 *
 * @example
 * // Fetch user information by ID
 * getUser(req, res);
 */
export async function getUser(req, res) {
   let collection = await dbUserCollection();
   let id = req.params.id;
   if (!isValidString(id) ){
      res.status(400).send('invalid parameter');
      log("[USER]> getUser > ERROR 400: Invalid Parameter");
      return;
   }
   try{
      let user = await collection.findOne({ _id: new ObjectId(id) })
      res.json(user);
      log("[USER]> getUser > SUCCESS: FETCHED USER");
      return;
   }catch(e){
      res.status(500).send('Internal Error');
      log("[USER]> getUser > ERROR 500: Internal Error "+e);
      return;  
   }
}

/**
 * Retrieves a list of all users from the database.
 *
 * This function fetches a list of all users stored in the database collection. It performs the database query and sends a JSON response with the list of users.
 * The function does not accept any parameters as it retrieves all users from the collection.
 *
 * @param {Object} res - The Express response object.
 *
 * @returns {void} This function sends an HTTP response to the client. A JSON response containing a list of all users is sent upon success.
 * If an error occurs during the retrieval process, an appropriate error response is sent.
 *
 * @throws {500} Internal Error - If an internal server error occurs during the retrieval process.
 */

export async function getUsers(res) {
   try{
   let collection = await dbUserCollection();
   let users = await collection
      .find({})
      .project({})
      .toArray();
   res.json(users);
   }catch(e){
      res.status(500).send('Internal Error nickname');
      log("[USER]> getUsers > ERROR 500: INTERNAL ERROR");
      return;      
   }
}

/**
 * Updates user information by their unique ID.
 *
 * This function allows for the update of various user details, including name, nickname, email, surname, and birth date.
 * Before updating, it performs validation checks to ensure that the provided data is valid.
 *
 * @param {Object} res - The Express response object.
 * @param {String} id - The unique ID of the user to be updated.
 * @param {Object} updatedUser - An object containing the updated user information.
 * @param {String} updatedUser.name - The updated name of the user.
 * @param {String} updatedUser.nickname - The updated nickname of the user.
 * @param {String} updatedUser.email - The updated email address of the user.
 * @param {String} updatedUser.surname - The updated surname of the user (optional).
 * @param {String} updatedUser.date - The updated birth date of the user (in "yyyy-mm-dd" format).
 *
 * @returns {void} This function sends an HTTP response to the client. A status code of 200 indicates a successful update.
 * If any validation checks fail or an error occurs during the update process, appropriate error responses are sent.
 *
 * @throws {400} Missing Parameter - If any of the required parameters (name, nickname, email) are missing.
 * @throws {400} Invalid Name - If the provided name is not a valid string.
 * @throws {400} Invalid Nickname - If the provided nickname is not valid (e.g., contains spaces).
 * @throws {400} Invalid Email - If the provided email is not a valid email address.
 * @throws {400} Invalid Birth Date - If the provided birth date is not in "yyyy-mm-dd" format.
 * @throws {500} Internal Error - If an internal server error occurs during the update process.
 */
export async function updateUser(res, id, updatedUser) {
   if (updatedUser.name == undefined || updatedUser.nickname == undefined || updatedUser.email == undefined) {
      res.status(400).send('Missing parameter');
      log("[USER]> updatedUser > ERROR 400: Missing Parameters");
      return;
   }
   if(!isValidString(updatedUser.name)){
      res.status(400).send('Invalid name');
      log("[USER]> updateUser > ERROR 400: Invalid name");
      return;
   }
   if(!isValidNickname(updatedUser.nickname)){
      res.status(400).send('Invalid nickname');
      log("[USER]> updateUser > ERROR 400: Invalid nickname");
      return;
   }
   if(!isValidEmail(updatedUser.email)){
      res.status(400).send('Invalid nickname');
      log("[USER]> updateUser > ERROR 400: Invalid email");
      return;
   }
   if(!isValidDate(updatedUser.date)){
      res.status(400).send('Invalid birth date');
      log("[USER]> updateUser > ERROR 400: Invalid birth date");
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
            date: updatedUser.date
         },
      };
      var item = await dbUserCollection();
      item.updateOne(filter, updatedUserToInsert);
      res.status(200).send();
      log("[USER]> updateUser > SUCCESS: UPDATED USER "+JSON.stringify(updatedUserToInsert));
      return;
   } catch (e) {
      res.status(500).send('Internal Error');
      log("[USER]> updateUser > ERROR 500: Internal Error");
      return;
   }
}

/**
 * Deletes a user from the database by their ID.
 *
 * This function deletes a user from the database based on their unique ID. It expects an ID as a parameter and performs the deletion operation.
 *
 * @param {Object} res - The Express response object.
 * @param {string} id - The unique ID of the user to be deleted.
 *
 * @returns {void} This function sends an HTTP response to the client. It returns a success response (HTTP status 200) upon successful deletion.
 * If any error occurs during the deletion process, an appropriate error response is sent.
 *
 * @throws {400} Bad Request - If the `id` parameter is missing or is not a valid string.
 * @throws {500} Internal Error - If an internal server error occurs during the deletion process.
 */
export async function deleteUser(res, id) {
   console.log(id);
   if (id == undefined) {
      res.status(400).send('Missing parameter');
      log("[USER]> deleteUser > ERROR 400: Missing Parameters");
      return;
   }
   if(!isValidString(id)){
      res.status(400).send('Invalid id');
      log("[USER]> deleteUser > ERROR 400: Invalid ID");
      return;      
   }
   id=new ObjectId(id);
   try {
      var items = await dbUserCollection();
      await items.deleteOne({_id:id});
      //deletes user's playlists
      var playlistdel=await deleteUserPlaylists(id);
      res.status(200).send();
      log("[USER]> deleteUser > SUCCESS: USER DELETED");
      return;  
   } catch (e) {
      res.status(500).send('Internal Error');
      log("[USER]> deleteUser > ERROR 500: INTERNAL ERROR");
      return;  
   }
}

