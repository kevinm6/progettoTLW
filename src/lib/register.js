/**
 * TODO: add description of module
 */
import { dbUserCollection } from "./user.js";

/**
 * Async function to register new user
 *
 * @param {string} req - request passed from express
 * @param {string} res - response passed from express
 * @returns {object | string} user information to be passed to register new user or stautus error
 */
export async function register(req, res) {
   let newUser = req.body;

   if (
      !newUser.name ||
      !newUser.email ||
      !newUser.nickname ||
      !newUser.password
   ) {
      res.status(400).send("Missing required fields");
      return;
   }

   newUser.password = hash(newUser.password);

   const userCollection = await dbUserCollection();
   try {
      let newUser = await userCollection.insertOne(newUser);

      res.status(201).send("User registered successfully");
      res.json(newUser);
   } catch (error) {
      res.status(500).send("Error registering user");
   } finally {
      userCollection.close();
   }
}
