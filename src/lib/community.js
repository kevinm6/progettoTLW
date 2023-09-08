/* User lib functions to manage User, used like an interface module */
import { ObjectId } from "mongodb";
import { Db } from "./database.js";
import { hash } from "./utils.js";
import { dbUserCollection } from "./user.js";


/**
 * Community Collection from MongoDB
 */
export const dbCommunityCollection = async () => await Db('community');


/**
 * TODO:
 *  - improve
 *  - complete functions
 *  - complete docs
 */

/**
 * Async function to get specific community from id
 *
 * @param req - request passed from express
 * @returns {object} community information from id passed as request param
 */
export async function getCommunity(req, res) {
   let creatorId = req;

   let collection = await dbCommunityCollection();
   let community = await collection
      .findOne({ 'creatorId': new ObjectId(creatorId) });

   // console.log("Community:" , community == null, community)

   if (community == null) {
      res.redirect("/createcommunity");
      return;
   }
   res.send(community);
   return community;
}


/**
 * Async function to get all community members
 *
 * @param {object} res - response passed from express
 * @returns {array.<object>} array of users
 */
export async function getMembersOfCommunity(req, res) {
   let id = req.params.id;
   let collection = await dbCommunityCollection();
   let community = await collection
      .find({ creator: new ObjectId(id) })
      .project({})
      .toArray();
   // console.log(community);
   res.json(community);
}

/**
 * Async function to create specific community from id
 *
 * @param req - request passed from express
 * @returns {object} community information from id passed as request param
 */
export async function createCommunity(req, res) {
   console.log("Creating community...", req);

   // let collection = await dbCommunityCollection();
   // let community = await collection
   //    .findOne({ 'creatorId': new ObjectId(creatorId) });

   // // console.log("Community:" , community == null, community)

   // if (community == null) {
   //    res.redirect("/createcommunity");
   //    return;
   // }
   // res.send(community);
   // return community;
}



/**
 * Async function to update an existing user
 *
 * @param res - response passed from express
 * @param id - id of the user to be updated
 * @param updateduser - user to be updated
 */
export async function updateCommunity(res, id, updatedUser) {
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
      var item = await dbCommunityCollection();
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
export async function deleteCommunity(req, res) {
   let creatorId = req.body.creatorId;
   let creatorObjectId = new ObjectId(creatorId);
   try {
      let filter = { 'creatorId': creatorObjectId };

      let collection = await dbCommunityCollection();
      let communities = await collection
         .findOneAndDelete(filter);

      res.send(communities);
      return communities;
   } catch (e) {
      console.error("Error deleting community.\n", e);
   }
}

