/* User lib functions to manage User, used like an interface module */
import { ObjectId } from "mongodb";
import { Db } from "./database.js";
import { hash } from "./utils.js";


/**
 * Community Collection from MongoDB
 */
export const dbCommunityCollection = () => Db('community');


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
   let cid = req;

   let collection = await dbCommunityCollection();
   let community = await collection
      .findOne({ creatorId: new ObjectId(cid) });

   if (community == null) {
      res.json({'error': "No community found"});
      return;
   }
   res.send(community);
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
      .find({ creatorId: new ObjectId(id) })
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
   let newCommunity = req.body;
   newCommunity.creatorId = new ObjectId(req.body.creatorId);

   for (const member in newCommunity.members) {
      let memberId = newCommunity.members[member]._id;
      newCommunity.members[member]._id = new ObjectId(memberId);
   }

   let collection = await dbCommunityCollection();
   // check collision
   let community = await collection
      .findOne({'creatorId': newCommunity.creatorId});

   if (community == null) {
      community = await collection.insertOne(newCommunity);
   } else {
      let errorMsg = "Community already present for current user.\n\
Only one community for user is allowed.\n\
Do you want to go to your community?"
      res.json({'error': errorMsg});
      return;
   }

   res.send(community);
}


/**
 * Async function to update an existing user
 *
 * @param res - response passed from express
 * @param id - id of the user to be updated
 * @param updateduser - user to be updated
 */
export async function updateCommunity(req, res) {
   let cid = req.body.creatorId;
   let member = req.body.member;
   console.log(member);

   var filter = { creatorId: new ObjectId(cid) };

   let collection = await dbCommunityCollection();

   switch (req.body.op) {
      case 'removeMember':
         var members = {
           $pull: { members: { _id: new ObjectId(member._id) } },
         }
         let community = await collection.updateOne(filter, members)
         console.log(community);

         res.json(community);
         break;

      default:
         console.log("Default action required, fallback and return!");
         return;
   }
   return;

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
   } catch (e) {
      console.error("Error deleting community.\n", e);
   }
}

