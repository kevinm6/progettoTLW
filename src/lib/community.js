/* User lib functions to manage User, used like an interface module */
import { ObjectId } from "mongodb";
import { Db } from "./database.js";
import * as utils from "./utils.js";
import * as playlist from "./playlist.js";


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
   console.log(req)
   let cid = req;

   let collection = await dbCommunityCollection();
   let community = await collection
      .findOne({ creatorId: new ObjectId(cid) });
   res.json(community);
}

export async function getCommunities(creator_id, res) {
   const cid = creator_id;
   try {
      const collection = await dbCommunityCollection();
      const communities = await collection.find({ creatorId: new ObjectId(cid) }).toArray();
      res.json(communities);
   } catch (error) {
      res.status(500).send('Internal Error');
      console.error(error);
   }
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
   for (const playlist in newCommunity.playlists) {
      let pid = newCommunity.playlists[pid]._id;
      newCommunity.members[member]._id = new ObjectId(pid);
   }

   let collection = await dbCommunityCollection();
   // check collision
   let community = await collection
      .findOne({ 'creatorId': newCommunity.creatorId });

   if (community == null) {
      community = await collection.insertOne(newCommunity);
   } else {
      let errorMsg = "Community already present for current user.\n\
Only one community for user is allowed.\n\
Do you want to go to your community?"
      res.json({ 'error': errorMsg });
      return;
   }

   res.send(community);
}


export async function addPlaylistToCommunity(playlist_id, community_id, owner_id, res) {
   console.log("OK");
   try {
      const collection = await dbCommunityCollection();
      const filter = {
         _id: new ObjectId(community_id),
         creatorId: new ObjectId(owner_id),
      };
      playlist_id = new ObjectId(playlist_id);
      const community = await collection.findOne(filter);
      if (!community) {
         res.status(404).send("Community not found.");
         return;
      }

      /**
       * .some() è un metodo degli array che verifica se almeno un elemento dell'array soddisfa una determinata condizione. 
       * In questo caso,cerco di vedere se almeno una playlist all'interno dell'array playlists soddisfa la condizione.
       * Dentro la funzione callback playlist => playlist.pid.equals(playlist_id), eseguo un confronto tra l'ID della playlist (playlist.pid) e l'ID della playlist 
       * che sto cercando di aggiungere (playlist_id) usando il metodo .equals().
       */
      const playlistExists = community.playlists.some(playlist => playlist.pid.equals(playlist_id));
      if (playlistExists) {
         res.status(400).send("Playlist already exists in the community.");
         return;
      }
      const playlistObject = {
         pid: playlist_id
      };
      const updateDoc = {
         $push: {
            playlists: playlistObject
         },
      };
      const comupdate = await collection.updateOne(filter, updateDoc);
      if (comupdate.modifiedCount === 1) {
         res.status(200).send();
      } else {
         res.status(500).send("Playlist not added to community.");
      }
   } catch (error) {
      res.status(500).send("Internal Error: " + error.message);
   }
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
   var filter = { creatorId: new ObjectId(cid) };
   var update = {};

   switch (req.body.op) {
      case 'removeMember':
         let member = JSON.parse(req.body.member);
         update = {
           $pull: { 'members': { 'uid': new ObjectId(member._id) } },
         };

         break;

      case 'removePlaylist':
         let pid = req.body.pid;
         update = {
           $pull: { 'playlists': { 'pid': new ObjectId(pid) } },
         };

         break;

      default:
         console.log("No action required, fallback and return!");
         return;
   }

   try {
      console.log(filter, update);
      let collection = await dbCommunityCollection();
      let community = await collection.updateOne(filter, update);

      res.status(200).json(community);
   } catch (e) {
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

