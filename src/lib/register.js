import { dbUserCollection } from "./user.js";
import { hash,isValidDate,isValidString,isValidPassword, parseTags,isValidNickname,log } from "./utils.js";

/**
 * Registers a new user in the system.
 *
 * This function registers a new user in the system by processing user registration data. It expects an Express response object (`res`) and a user object (`user`) containing registration information. The function validates the user data and stores it in the database if it meets the criteria.
 *
 * @param {Object} res - The Express response object.
 * @param {Object} user - The user object containing registration information.
 * @param {string} user.name - The user's full name.
 * @param {string} user.nickname - The user's chosen nickname.
 * @param {string} user.email - The user's email address.
 * @param {string} user.password - The user's password.
 * @param {string} user.date - The user's birth date in the format 'yyyy-mm-dd'.
 *
 * @returns {void} This function sends an HTTP response to the client. It returns a success response (HTTP status 200) upon successful registration.
 * If any error occurs during the registration process, an appropriate error response is sent.
 * 
 * @throws {400} Bad Request - If any of the required registration parameters (`name`, `nickname`, `email`, `password`) is missing or if any of them is invalid (e.g., empty, not a valid string).
 * @throws {400} Bad Request - If the `date` parameter is missing or not in a valid date format ('yyyy-mm-dd').
 * @throws {400} Bad Request - If the password is not valid (less than 7 characters).
 * @throws {400} Bad Request - If the nickname is not valid (e.g., contains spaces).
 * @throws {400} Bad Request - If the email or nickname is already associated with an existing user.
 * @throws {500} Internal Error - If an internal server error occurs during the registration process.
 */
export async function register(res, user) {
   if (user.name == undefined || user.nickname == undefined || user.email == undefined || user.password == undefined ) {
      res.status(400).send('Missing parameter');
      log("[REGISTER]> register > ERROR 400: missing parameter");
      return;
   }
   if(!isValidDate(user.date)){
      res.status(400).send('invalid Date!');
      log("[REGISTER]> register > ERROR 400: invalid date");
      return;
   }
   if(!isValidString(user.name) || !isValidString(user.email) || !isValidString(user.password)){
      res.status(400).send('Some of the data is invalid. Check and try again!');
      log("[REGISTER]> register > ERROR 400: invalid data");
      return;
   }
   if(!isValidPassword(user.password)){
      res.status(400).send('Password is not valid. It must be at least 7 characters long!');
      log("[REGISTER]> register > ERROR 400: invalid password");
      return;
   }
   if(!isValidNickname(user.nickname)){
      res.status(400).send('Nickname is not valid!'); 
      log("[REGISTER]> register > ERROR 400: invalid nickname");
      return;
   }
   user.password = hash(user.password);
   console.log(user.password);
   try {
      var userCollection = await dbUserCollection();
      // Check if email or nickname already exist in the database
      const existingUser = await userCollection.findOne({
         $or: [ { email: user.email }, { nickname: user.nickname } ]
      });
      if (existingUser) {
         res.status(400).send("User with the same email or nickname already exists!");
         log("[REGISTER]> register > ERROR 400: USER "+user.email+"ALREADY EXISTS");
         return;
      }
      userCollection.insertOne(user);
      // risposta affermativa con un 200 onde evitare oggetti circolari
      res.status(200).send();
      log("[REGISTER]> register > SUCCESS: USER REGISTEREED "+JSON.stringify(user));
   } catch (e) {
      if (e.code == 11000) {
         res.status(400).send("User already exists!");
         log("[REGISTER]> register > ERROR 400: USER "+user.email+"ALREADY EXISTS");
         return;
      }
      res.status(500).send(`Generic Error: ${e}`);
      log("[REGISTER]> register > ERROR 500: INTERNAL ERROR : " +e);
      return;
   }
}
