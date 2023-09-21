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
 * Handles the request to retrieve data for a specific community.
 *
 * @description This function takes the community's creator ID from the HTTP request and returns the
 * corresponding community data, if present in the database. If the community is not found,
 * it will return an HTTP 404 response. In case of missing or invalid input,
 * it returns a 400 status. For internal errors, a 500 status with an error
 * message will be returned.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {data} - JSON data if found.
 *
 * @throws {Error} - If an error occurs while retrieving community data.
 *
 */
export async function getCommunity(req, res) {
   if (req == undefined) {
      res.status(400).send("Missing creator ID");
      utils.log("[COMMUNITY]> getCommunity > ERROR 400: MISSING CREATOR ID ");
      return;
   }
   if (!utils.isValidString(req)) {
      res.status(400).send("Invalid creator ID");
      utils.log("[COMMUNITY]> getCommunity > ERROR 400: INVALID CREATOR ID ");
      return;
   }
   let cid = req;
   try {
      let collection = await dbCommunityCollection();
      let community = await collection
         .findOne({ creatorId: new ObjectId(cid) });
      if (!community) {
         res.json(null);
         utils.log("[COMMUNITY]> getCommunity > ERROR 404: COMMUNITY NOT FOUND");
         return;
      }
      res.json(community);
      utils.log("[COMMUNITY]> getCommunity > SUCCESS: FETCHED COMMUNITY "+JSON.stringify(community));
      return;
   } catch (e) {
      res.status(500).send("Internal Error");
      utils.log("[COMMUNITY]> getCommunity > ERROR 500: INTERNAL ERROR "+e);
      return;
   }
}

/**
 * Handles the request to retrieve data for a specific community.
 *
 * @description This function takes the community's creator ID from the HTTP request and returns the
 * corresponding community data, if present in the database. If the community is not found,
 * it will return an HTTP 404 response. In case of missing or invalid input,
 * it returns a 400 status. For internal errors, a 500 status with an error
 * message will be returned.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {data} - JSON ARRAY data if found.
 *
 * @throws {Error} - If an error occurs while retrieving community data.
 *
 */
export async function getCommunities(req, res) {
   if (req == undefined) {
      res.status(400).send("Missing creator ID");
      utils.log("[COMMUNITY]> getCommunities > ERROR 400: MISSING CREATOR ID ");
      return;
   }
   if (!utils.isValidString(req)) {
      res.status(400).send("Invalid creator ID");
      utils.log("[COMMUNITY]> getCommunities > ERROR 400: INVALID CREATOR ID ");
      return;
   }
   let cid = req;
   try {
      let collection = await dbCommunityCollection();
      const community= await collection.find({ creatorId: new ObjectId(cid) }).toArray();
      if (community.length==0) {
         res.status(404).send("Community not found"); 
         utils.log("[COMMUNITY]> getCommunities > ERROR 404: COMMUNITY NOT FOUND");
         return;
      }
      res.json(community);
      utils.log("[COMMUNITY]> getCommunities > SUCCESS: FETCHED COMMUNITY ");
      return;
   } catch (e) {
      res.status(500).send("Internal Error");
      utils.log("[COMMUNITY]> getCommunities > ERROR 500: INTERNAL ERROR "+e);
      return;
   }
}




/**
 * Adds a playlist to a community.
 *
 * @param {string} playlist_id - The ID of the playlist to add.
 * @param {string} community_id - The ID of the community.
 * @param {string} owner_id - The ID of the owner of the playlist.
 * @param {Object} res - The response object to send HTTP responses.
 *
 * @throws {Error} Returns a 400 error if parameters are missing or invalid.
 * @throws {Error} Returns a 404 error if the community is not found.
 * @throws {Error} Returns a 400 error if the playlist already exists in the community.
 * @throws {Error} Returns a 500 error if an unknown error occurs.
 *
 * @returns {void}
 */
export async function addPlaylistToCommunity(playlist_id, community_id, owner_id, res) {
   if(community_id ==undefined || playlist_id == undefined || owner_id==undefined){
      res.status(400).send("Missing parameter");
      utils.log("[COMMUNITY]> addPlaylistToCommunity > ERROR 400: INVALID CREATOR ID ");
      return;
   }
   if(!utils.isValidString(community_id)){
      res.status(400).send("Invalid community id");
      utils.log("[COMMUNITY]> addPlaylistToCommunity > ERROR 400: INVALID CREATOR ID ");
      return;
   }
   try {
      const collection = await dbCommunityCollection();
      const filter = {
         _id: new ObjectId(community_id),
         creatorId: new ObjectId(owner_id),
      };
      playlist_id = new ObjectId(playlist_id);
      const community = await collection.findOne(filter);
      if (!community) {
         res.status(404).send("Community not found");
         utils.log("[COMMUNITY]> addPlaylistToCommunity > ERROR 400: INVALID CREATOR ID ");
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
         res.status(400).send("Playlist Already exists in community");
         utils.log("[COMMUNITY]> addPlaylistToCommunity > ERROR 400: PLAYLIST ALREADY EXISTS IN COMMUNITY ");
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
         utils.log("[COMMUNITY]> addPlaylistToCommunity > SUCCESS: ADDED PALYLIST "+playlist_id+" TO COMMUNITY "+community_id);
         return;
      } else {
         res.status(500).send("playlist not added due to an unknown error");
         utils.log("[COMMUNITY]> addPlaylistToCommunity > ERROR 500: INTERNAL ERROR WHILE ADDING PLAYLIST ");
         return;
      }
   } catch (error) {
      res.status(500).send("Internal error");
      utils.log("[COMMUNITY]> addPlaylistToCommunity > ERROR 500: INTERNAL ERROR : "+error);
      return;
   }
}

/**
 * @description Deletes a community based on the provided creator ID. This function handles the deletion
 * of a community associated with a specific creator. It ensures that the creator ID is provided
 * and valid, performs the deletion, and provides appropriate HTTP responses.
 *
 * @param {Object} req - The request object containing parameters.
 * @param {Object} res - The response object to send HTTP responses.
 *
 * @throws {Error} Returns a 400 error if the creatorId is missing or invalid.
 * @throws {Error} Returns a 404 error if the community is not found.
 * @throws {Error} Returns a 500 error if an internal error occurs.
 *
 * @returns {void}
 */
export async function deleteCommunity(req, res) {
   let creatorId = req.body.creatorId;
   if(creatorId==undefined){
      res.status(400).send("Missing Parameter");
      utils.log("[COMMUNITY]> deleteCommunity > ERROR 400 : MISSING creatorId");
      return;
   }
   if(!utils.isValidString(creatorId)){
      res.status(400).send("Invalid Parameter");
      utils.log("[COMMUNITY]> deleteCommunity > ERROR 400 : INVALID creatorId");
      return;      
   }
   let creatorObjectId = new ObjectId(creatorId);
   try {
      let filter = { 'creatorId': creatorObjectId };

      let collection = await dbCommunityCollection();
      let communities = await collection
         .findOneAndDelete(filter);
      if(!communities){
         res.status(404).send("Community not found");
         utils.log("[COMMUNITY]> deleteCommunity > ERROR 404 : COMMUNITY NOT FOUND");
         return;
      }
      res.send(communities);
      utils.log("[COMMUNITY]> deleteCommunity > SUCCESS : DELETED COMMUNITY "+creatorId);
      return;
   } catch (e) {
      res.status(500).send("Internal Error");
      utils.log("[COMMUNITY]> deleteCommunity > ERROR 500 : INTERNAL ERROR");
      return;
   }
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
      let memberId = newCommunity.members[member].uid;
      newCommunity.members[member].uid = new ObjectId(memberId);
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
         let mem = req.body.member;
         let memberId = (typeof mem == 'string') ?  mem : JSON.parse(req.body.member);
         update = {
           $pull: { 'members': { 'uid': new ObjectId(memberId) } },
         };

         break;
      case 'removePlaylist':
         let pid = req.body.pid;
         update = {
           $pull: { 'playlists': { 'pid': new ObjectId(pid) } },
         };

         break;
      case 'addMember':
         let mid = req.body.mid;
         update = {
            $push: { 'members': { 'uid': new ObjectId(mid) } },
          }

         break;
      case 'updateInfo':
         let info = req.body.info;
         update = {
            $set: { 'name': info.name, 'desc': info.desc },
          }

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





