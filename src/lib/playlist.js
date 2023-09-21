/* Playlist & Tracks lib functions to manage User */

import { Db } from "./database.js";
import { ObjectId } from "mongodb";
import * as utils from "./utils.js";
export const dbPlaylistCollection = () => Db('playlists');


/**
 * This function is useful to create Indexes if doesn't already exists, to improve
 * search in DB with 'case insensitive' queries
 */
(async function() {
   let collection = await dbPlaylistCollection();
   let indexes = await collection.listIndexes().toArray();
   if (Object.keys(indexes).length == 4) return;

   let tagIndex = await collection.createIndex({ 'tags': 1 }, {
      collation: { locale: 'en', strength: 2 }
   });
   let titleIndex = await collection.createIndex({ 'songs.title': 1 }, {
      collation: { locale: 'en', strength: 2 }
   });
   let artistIndex = await collection.createIndex({ 'songs.artist': 2 }, {
      collation: { locale: 'en', strength: 2 }
   });
   console.log(`Indexes created: ${tagIndex}, ${titleIndex}, ${artistIndex}`);
})()


/**
 * @description Retrieves all public playlists
 * @param {Object} res - The response object used to send the playlists.
 * @param {string} req - Request sent from the client
 */
export async function getPublicPlaylists(req, res) {
   let query = req.query.q != 'null' ? req.query.q : null;

   try {
      let collection = await dbPlaylistCollection();
      let filter = null;

      if (query) {
         filter = {
            $or: [
               { $and: [{ "tags": `${query}` }, { "private": false }] },
               { $and: [{ "songs.title": `${query}` }, { "private": false }] },
               { $and: [{ "songs.artist": `${query}` }, { "private": false }] }
            ]
         };
      } else {
         filter = { private: false };
      }
      let playlists = await collection
         .find(filter)
         .collation({ locale: 'en', strength: 2 })
         .toArray();
      res.send(playlists);
   } catch (error) {
      res.status(500).send(`Error while fetching playlists: ${error.message}`);
   }
}

/**
 * Retrieves playlists owned by a user.
 *
 * @description This function retrieves playlists owned by a user based on the provided `owner_id`. It expects an Express response object (`res`) and the `owner_id` as parameters. 
 * The function validates the `owner_id` and queries the database for playlists owned by the specified user. If successful, it returns the playlists as an HTTP response.
 *
 * @param {Object} res - The Express response object.
 * @param {string} owner_id - The unique identifier of the user whose playlists are to be retrieved.
 *
 * @returns {void} This function sends an HTTP response to the client containing the user's playlists (if found) or an error response if any issue occurs.
 *
 * @throws {400} Bad Request - If the `owner_id` parameter is missing or not a valid string.
 * @throws {500} Internal Error - If an internal server error occurs during the database query or any other operation.
 *
 */
export async function getUserPlaylists(res, owner_id) {
   if(owner_id==undefined){
      res.status(400).send("Missing user_id");
      utils.log("[PLAYLIST]> getUserPlaylist > ERROR 400: missing nickname");
      return;
   }
   if(!utils.isValidString(owner_id )){
      res.status(400).send("Invalid owner_id");
      utils.log("[PLAYLIST]> getUserPlaylist > ERROR 400: Invalid Owner_id");
      return;
   }
   try {
      const collection = await dbPlaylistCollection();
      const playlists = await collection
         .find({ owner_id: new ObjectId(owner_id) })
         .project({})
         .toArray();
      res.status(200).send(playlists);
      utils.log("[PLAYLIST]> getUserPlaylist > SUCCESS: Fetched "+owner_id+" PLAYLISTS");
      return;
   } catch (error) {
      res.status(500).send("Internal Error");
      utils.log("[PLAYLIST]> getUserPlaylist > ERROR 500: Internal Error");
      return;
   }
}

/**
 * Adds a song to a playlist identified by its playlist ID.
 * @description This function adds a song to a playlist identified by its playlist ID.
 * It validates the provided song data and checks if the song already exists in the playlist before adding it.
 * If successful, it returns a 200 OK response.
 * If any errors occur, it sends an appropriate error response.
 * @param {Object} res - The HTTP response object.
 * @param {string} playlistID - The ID of the playlist where the song will be added.
 * @param {Object} songData - The data of the song to be added to the playlist.
 * @param {string} songData.id - The ID of the song.
 * @param {string} songData.title - The title of the song.
 * @param {string} songData.artist - The artist(s) of the song.
 * @param {string} songData.duration - The duration of the song (in the format "00:04:29").
 * @param {string} songData.year - The year the song was released (in the format "yyyy").
 * @param {string} songData.album - The album where the song belongs.
 * @param {string} songData.owner_id - The ID of the owner of the song.
 * 
 * @returns {void}
 * 
 * @throws {Object} 400 Bad Request if any required parameter is missing or data is invalid.
 * @throws {Object} 400 Bad Request if the song already exists in the playlist.
 * @throws {Object} 500 Internal Server Error if any unexpected error occurs during the operation.
 * 

 */
export async function addSongToPlaylist(res, playlistID,songData) {
   if(playlistID==undefined){
      res.status(400).send("Missing Parameter");
      utils.log("[PLAYLIST]> addSongToPlaylist > ERROR 400: Missing playlistID");
      return;     
   }
   if (songData.id === undefined || songData.title === undefined || songData.artist === undefined || songData.duration === undefined || songData.year === undefined || songData.album === undefined) {
      res.status(400).send("Missing Parameter");
      utils.log("[PLAYLIST]> addSongToPlaylist > ERROR 400: Missing Parameter");
      return;
   }
   if(!utils.isValidString(songData.id)){
      res.status(400).send("Invalid song ID");
      utils.log("[PLAYLIST]> addSongToPlaylist > ERROR 400: Invalid song ID");
      return;      
   }
   if(!utils.isValidString(songData.title)){
      res.status(400).send("Invalid song title");
      utils.log("[PLAYLIST]> addSongToPlaylist > ERROR 400: Invalid song title");
      return;      
   }
   if(!utils.isValidYear(songData.year)){
      res.status(400).send("Invalid song year");
      utils.log("[PLAYLIST]> addSongToPlaylist > ERROR 400: Invalid song year");
      return;      
   }
   if(!utils.isValidDuration(songData.duration)){
      res.status(400).send("Invalid song duration");
      utils.log("[PLAYLIST]> addSongToPlaylist > ERROR 400: Invalid song duration");
      return;      
   }
   if(!utils.isValidAlbum(songData.album)){
      res.status(400).send("Invalid song year");
      utils.log("[PLAYLIST]> addSongToPlaylist > ERROR 400: Invalid song year");
      return;      
   }
   if(!utils.isValidArtist(songData.artist)){
      res.status(400).send("Invalid song artists");
      utils.log("[PLAYLIST]> addSongToPlaylist > ERROR 400: Invalid song artist");
      return;      
   }
   if(!utils.isValidString(songData.playlistID)){
      res.status(400).send("Invalid playlist id");
      utils.log("[PLAYLIST]> addSongToPlaylist > ERROR 400: Invalid playlistID");
      return;      
   }

   try {
      let filter = { _id: new ObjectId(playlistID),owner_id: new ObjectId(songData.owner_id) }
      let updateDoc = {
         $push: {
            songs: {
               id: songData.id,
               title: songData.title,
               artist: songData.artist,
               duration: songData.duration,
               year: songData.year,
               album: songData.album
            }
         },
      }
      let collection = await dbPlaylistCollection();
      const exists=await utils.songExistsInPlaylist(collection,playlistID, songData);
      if (exists){
         res.status(400).send("Song is already in the playlist");
         utils.log("[PLAYLIST]> addSongToPlaylist > ERROR 400: SONG ALREADY IN PLAYLIST");
         return; 
      }
      let playlists = await collection.updateOne(filter, updateDoc);
      res.status(200).send("SUCCESS");
      utils.log("[PLAYLIST]> addSongToPlaylist > SUCCESS: ADDED SONG "+JSON.stringify(songData)+" TO PLAYLIST "+playlistID);
      return; 
   } catch (e) {
      res.status(500).send("INTERNAL ERROR");
      utils.log("[PLAYLIST]> addSongToPlaylist > ERROR 500: INTERNAL ERROR: "+e);
      return; 
   }
}

/**
 * Removes a song with the specified track ID from a playlist owned by the given owner ID.
* @description
 * This function removes a song identified by its `track_id` from a playlist identified by its `playlist_id`.
 * The playlist is required to be owned by the user with the specified `owner_id`.
 *
 * The function performs the following checks:
 *
 * - Ensures that `playlist_id`, `track_id`, and `owner_id` are provided; otherwise, it responds with a 400 Bad Request status.
 * - Validates the format of `playlist_id`, `track_id`, and `owner_id`. If they fail validation, it responds with a 400 Bad Request status.
 * - Checks if the playlist with the specified `playlist_id` and owned by `owner_id` exists. If not, it responds with a
 *   404 Not Found status.
 * - Attempts to remove the song with the provided `track_id` from the playlist. If successful, it responds with a 200 OK status.
 * - If the specified track is not found in the playlist, it responds with a 404 Not Found status.
 * - In the event of any unexpected errors occurring during the removal process, the function will respond with a
 *   500 Internal Server Error status.
 * @param {Object} res - The HTTP response object.
 * @param {string} playlist_id - The ID of the playlist from which the song will be removed.
 * @param {string} track_id - The ID of the song (track) to be removed.
 * @param {string} owner_id - The ID of the owner of the playlist.
 *
 * @returns {void}
 *
 * @throws {Object} 400 Bad Request if any required parameter is missing or data is invalid.
 * @throws {Object} 404 Not Found if the specified playlist or track is not found.
 * @throws {Object} 500 Internal Server Error if an unexpected error occurs during the operation.
 *
 */
export async function removeSongFromPlaylist(res, playlist_id, track_id, owner_id) {
   if(playlist_id == undefined || track_id == undefined || owner_id == undefined){
      res.status(400).send("Missing Parameters");
      utils.log("[PLAYLIST]> removeSongFromPlaylist > ERROR 400: MISSING PARAMETERS");
      return;      
   }
   if(!utils.isValidString(playlist_id)){
      res.status(400).send("Invalid playlist id");
      utils.log("[PLAYLIST]> removeSongFromPlaylist > ERROR 400: Invalid playlist id");
      return;      
   } 
   if(!utils.isValidString(track_id)){
      res.status(400).send("Invalid track id");
      utils.log("[PLAYLIST]> removeSongFromPlaylist > ERROR 400: Invalid track id");
      return;      
   } 
   if(!utils.isValidString(owner_id)){
      res.status(400).send("Invalid owner id");
      utils.log("[PLAYLIST]> removeSongFromPlaylist > ERROR 400: Invalid owner id");
      return;      
   }     
   var playlistCollection = await dbPlaylistCollection();
   try {
      var filter = {
         _id: new ObjectId(playlist_id),
         owner_id: new ObjectId(owner_id)
      };
      var update = {
         $pull: {
            songs: {
               id: track_id
            }
         }
      };
      var result = await playlistCollection.updateOne(filter, update);
      if (result.modifiedCount === 1) {
         res.status(200).send("Song removed successfully");
         console.log(`[PLAYLIST] >> USER ${owner_id} SUCCESFULLY REMOVED ${track_id} FROM ${owner_id}`)
      } else {
         res.status(404).send("Track not found in playlist");
         utils.log("[PLAYLIST]> removeSongFromPlaylist > ERROR 404: Track not found in playlist");
         return;   

      }
   } catch (e) {
      res.status(500).send("Internal Error");
      utils.log("[PLAYLIST]> removeSongFromPlaylist > ERROR 500: INTERNAL ERROR : "+e);
      return;   
   }
}

/**
 * Creates a new playlist with specified details.
 *
 * @param {Object} res - The HTTP response object.
 * @param {Object} playlist - An object containing details of the playlist to be created.
 * @param {string} playlist.title - The title of the new playlist.
 * @param {string} playlist.description - A description of the new playlist.
 * @param {Array} playlist.tags - An array of tags associated with the playlist.
 * @param {Array} playlist.songs - An array of song data objects to be included in the playlist.
 * @param {string} playlist.owner_id - The ID of the owner of the playlist.
 * @param {boolean} playlist.private - A boolean flag indicating whether the playlist is private.
 *
 * @returns {void}
 *
 * @throws {Object} 400 Bad Request if any required parameter is missing or data is invalid.
 * @throws {Object} 500 Internal Server Error if an unexpected error occurs during the operation.
 *
 * @description
 * This function creates a new playlist with the specified details. It expects a valid HTTP response object (`res`)
 * and an object (`playlist`) containing the parameters above descripted
 *
 * The function performs multiple checks to ensure the validity of the provided data, including the validation of
 * `title`, `description`, `tags`, `songs`, `owner_id`, and `private`. If any of these parameters are missing or
 * fail validation, the function responds with a 400 Bad Request status code and an appropriate error message.
 *
 * If all validations pass, the function inserts the new playlist into the database collection and responds with a
 * 200 OK status code, indicating that the playlist has been successfully created.

 * In the event of any unexpected errors occurring during the playlist creation process, the function will respond
 * with a 500 Internal Server Error status code.
 *
 */
export async function createplaylist(res, playlist) {
   console.log(playlist);
   if (
      playlist.title === undefined ||
         playlist.description === undefined ||
         playlist.tags === undefined ||
         playlist.songs === undefined ||
         playlist.owner_id === undefined ||
         playlist.private === undefined
   ) {
      res.status(400).send("Missing parameter");
      utils.log("[PLAYLIST]> createPlaylist > ERROR 400: MISSING PARAMETER");
      return; 
   }
   if(!utils.isValidPlaylistTitle(playlist.title)){
      res.status(400).send("Invalid playlist title");
      utils.log("[PLAYLIST]> createPlaylist > ERROR 400: INVALID PLAYLIST TITLE");
      return;      
   }
   if(!utils.isValidPlaylistDescription(playlist.description)){
      res.status(400).send("Invalid playlist description");
      utils.log("[PLAYLIST]> createPlaylist > ERROR 400: INVALID PLAYLIST DESCRIPTION");
      return;      
   } 
   if(!utils.isValidString(playlist.owner_id)){
      res.status(400).send("Invalid playlist owner");
      utils.log("[PLAYLIST]> createPlaylist > ERROR 400: INVALID PLAYLIST OWNER ID");
      return;      
   } 
   if(!utils.isValidTags(playlist.tags)){
      res.status(400).send("Invalid playlist tags");
      utils.log("[PLAYLIST]> createPlaylist > ERROR 400: INVALID PLAYLIST TAGS");
      return;      
   } 
   if(!utils.isValidPrivacy(playlist.private)){
      res.status(400).send("Invalid privacy option");
      utils.log("[PLAYLIST]> createPlaylist > ERROR 400: INVALID PRIVACY OPTION");
      return;      
   } 
   try {
      var playlistCollection = await dbPlaylistCollection();
      playlist.owner_id = new ObjectId(playlist.owner_id);
      await playlistCollection.insertOne(playlist); 
      res.status(200).send();
      utils.log("[PLAYLIST]> createPlaylist > SUCCESS: PLAYLIST SUCCESFULLY CREATED");
      return;   
   } catch (e) {
      res.status(500).send("Internal Error");
      utils.log("[PLAYLIST]> createPlaylist > ERROR 500: INTERNAL ERROR : "+e);
      return;   
   }
}

/**
 * Deletes a playlist with the specified playlist ID, owned by the given owner ID.
 *
 * @param {Object} res - The HTTP response object.
 * @param {string} playlistID - The ID of the playlist to be deleted.
 * @param {string} ownerID - The ID of the owner of the playlist.
 *
 * @returns {void}
 *
 * @throws {Object} 400 Bad Request if any required parameter is missing or data is invalid.
 * @throws {Object} 404 Not Found if the playlist with the specified ID and owner ID is not found.
 * @throws {Object} 500 Internal Server Error if an unexpected error occurs during the operation.
 *
 * @description
 * This function deletes a playlist identified by its playlist ID and owned by the specified owner ID. It expects
 * a valid HTTP response object (`res`), a `playlistID` (string), and an `ownerID` (string) as parameters.
 *
 * The function performs the following checks:
 *
 * - Ensures that both `playlistID` and `ownerID` are provided; otherwise, it responds with a 400 Bad Request status.
 * - Validates the format of `playlistID` and `ownerID`. If they fail validation, it responds with a 400 Bad Request status.
 * - Checks if the playlist with the specified `playlistID` and owned by `ownerID` exists. If not, it responds with a
 *   404 Not Found status.
 *
 * If all checks pass, the function proceeds to delete the playlist from the database collection and responds with
 * a 200 OK status, indicating that the playlist has been successfully deleted.
 *
 * In the event of any unexpected errors occurring during the deletion process, the function will respond with a
 * 500 Internal Server Error status.
 */

export async function deletePlaylist(res, playlistID, ownerID) {
   if (
      playlistID === undefined ||
         ownerID === undefined
   ) {
      res.status(400).send("Missing Parameters");
      utils.log("[PLAYLIST]> deletePlaylist > ERROR 400: MISSING PARAMETERS");
      return; 
   }
   if(!utils.isValidString(playlistID)){
      res.status(400).send("Invalid playlist id");
      utils.log("[PLAYLIST]> deletePlaylist > ERROR 400: INVALID PLAYLIST ID");
      return; 
   }
   if(!utils.isValidString(ownerID)){
      res.status(400).send("Invalid owner id");
      utils.log("[PLAYLIST]> deletePlaylist > ERROR 400: INVALID OWNER ID");
      return; 
   }
   playlistID = new ObjectId(playlistID);
   try {
      var playlistCollection = await dbPlaylistCollection();
      const playlist = await playlistCollection.findOne({ _id: playlistID, owner_id: new ObjectId(ownerID) });
      if (!playlist) {
         res.status(404).send("Playlist not found");
         utils.log("[PLAYLIST]> deletePlaylist > ERROR 404: PLAYLIST NOT FOUND");
         return; 
      }
      await playlistCollection.deleteOne({ _id: playlistID });
      res.status(200).send('Playlist deleted');
      utils.log("[PLAYLIST]> deletePlaylist > SUCCESS: PLAYLIST "+playlistID+" DELETED");
      return; 
   } catch (e) {
      res.status(500).send("Internal Error");
      utils.log("[PLAYLIST]> deletePlaylist > ERROR 500: INTERNAL ERROR : "+e);
      return; 
   }
}

/**
 * Fetches a specific playlist from a database and responds with it as JSON.
 *
 * @param {Object} res - The HTTP response object to send the response.
 * @param {string} owner_id - The ID of the playlist owner.
 * @param {string} playlistid - The ID of the playlist to retrieve.
 * @returns {Promise} A promise representing the process of fetching and responding with the playlist.
 *
 * @throws {Error} If an error occurs during playlist retrieval or response, an exception is thrown.
 */
export async function getPlaylist(res, owner_id, playlistid) {
   console.log(owner_id + " is fetching playlist " + playlistid);
   try {
      const collection = await dbPlaylistCollection();
      const playlist = await collection.findOne({ _id: new ObjectId(playlistid), owner_id: new ObjectId(owner_id) });
      if (!playlist) {
         res.status(404).send("Playlist not found");
         console.log(`[PLAYLIST] >> ERROR 404 WHILE TRYING TO FETCH PLAYLIST ${playlistid}`)
         return;
      }

      res.json(playlist);
      console.log(`[PLAYLIST] >> SUCCESFULLY FETCHED PLAYLIST ${playlistid}`)

   } catch (error) {
      res.status(500).send(`Error while fetching playlist: ${error.message}`);
      console.log(`[PLAYLIST] >> ERROR 500 WHILE FETCHING PLAYLIST`)
   }
}


/**
 * Retrieves a playlist by its ID.
 * 
 * @description This function retrieves a playlist by its unique ID. It checks the validity of the provided
 * playlist ID and returns the playlist data if found. If the playlist does not exist, it returns a 404 Not Found response.
 * In case of any unexpected errors, it sends a 500 Internal Server Error response.
 * @param {Object} res - The HTTP response object.
 * @param {string} playlistid - The ID of the playlist to retrieve.
 * 
 * @returns {void}
 * 
 * @throws {Object} 400 Bad Request if the playlist ID is missing or invalid.
 * @throws {Object} 404 Not Found if the playlist with the provided ID does not exist.
 * @throws {Object} 500 Internal Server Error if any unexpected error occurs during the operation.
 * 
 */
export async function getPlaylistFromId(res, playlistid) {
   if(playlistid==undefined){
      res.status(400).send("Missing playlist id");
      utils.log("[PLAYLIST]> getPlaylistFromId > ERROR 400: Missing playlist id");
      return;     
   }
   if(!utils.isValidString(playlistid)){
      res.status(400).send("Invalid playlistid");
      utils.log("[PLAYLIST]> getPlaylistFromId > ERROR 400: Invalid playlist id");
      return;     
   }
   try {
      const collection = await dbPlaylistCollection();
      const playlist = await collection.findOne({ _id: new ObjectId(playlistid) });
      if (!playlist) {
         res.status(404).send("Playlist not found");
         utils.log("[PLAYLIST]> getPlaylistFromId > ERROR 404: Playlist not found");
         return; 
      }

      res.json(playlist);
      utils.log("[PLAYLIST]> getPlaylistFromId > SUCCESS: SUCCESFULLY FETCHED PLAYLIST "+playlistid);
      return; 

   } catch (error) {
      res.status(500).send("INTERNAL ERROR");
      utils.log("[PLAYLIST]> getPlaylistFromId > ERROR 500: INTERNAL ERROR "+error);
      return; 
   }
}
/**
 * Updates the details of a playlist identified by its playlist ID.
 * @description
 * This function updates the details of a playlist identified by its playlist ID.
 * It expects the new title, description, tags, owner ID, and privacy status to be provided in the playlistData object.
 * If successful, it returns a 200 OK response.
 * If the specified playlist ID is not found, it returns a 404 Not Found response.
 * If any errors occur during the update process, it sends an appropriate error response.
 * 
 * @param {Object} res - The HTTP response object.
 * @param {string} playlistID - The ID of the playlist to be updated.
 * @param {Object} playlistData - The updated data for the playlist.
 * @param {string} playlistData.title - The new title for the playlist.
 * @param {string} playlistData.description - The new description for the playlist.
 * @param {string[]} playlistData.tags - An array of new tags for the playlist.
 * @param {string} playlistData.owner_id - The ID of the owner of the playlist.
 * @param {boolean} playlistData.private - The privacy status of the playlist.
 *
 * @returns {void}
 *
 * @throws {Object} 400 Bad Request if any required parameter is missing or data is invalid.
 * @throws {Object} 404 Not Found if the playlist with the specified ID is not found.
 * @throws {Object} 500 Internal Server Error if any unexpected error occurs during the operation.
 *
 */
export async function updatePlaylist(res, playlistID, playlistData) {
   if (
      playlistData.title === undefined ||
         playlistData.description === undefined ||
         playlistData.tags === undefined ||
         playlistData.owner_id === undefined||
         playlistData.private === undefined
   ) {
      res.status(400).send("Missing parameters");
      utils.log("[PLAYLIST]> updatePlaylist > ERROR 400: MISSING PARAMETERS ");
      return; 
   }
   if(!utils.isValidString(playlistID)){
      res.status(400).send("Invalid playlistid");
      utils.log("[PLAYLIST]> updatePlaylist > ERROR 400: INVALID PLAYLIST ID");
      return;     
   }
   if(!utils.isValidPrivacy(playlistData.private)){
      res.status(400).send("Invalid privacy option");
      utils.log("[PLAYLIST]> updatePlaylist > ERROR 400: INVALID PRIVACY OPTION");
      return;     
   }
   if(!utils.isValidPlaylistTitle(playlistData.title)){
      res.status(400).send("Invalid playlist title");
      utils.log("[PLAYLIST]> updatePlaylist > ERROR 400: INVALID PLAYLIST TITLE");
      return;     
   }
   if(!utils.isValidPlaylistDescription(playlistData.description)){
      res.status(400).send("Invalid playlist title");
      utils.log("[PLAYLIST]> updatePlaylist > ERROR 400: INVALID PLAYLIST DESCRIPTION");
      return;     
   }
   if(!utils.isValidTags(playlistData.tags)){
      res.status(400).send("Invalid playlist tags");
      utils.log("[PLAYLIST]> updatePlaylist > ERROR 400: INVALID PLAYLIST TAGS");
      return;     
   }
   if(!utils.isValidString(playlistData.owner_id)){
      res.status(400).send("Invalid playlist title");
      utils.log("[PLAYLIST]> updatePlaylist > ERROR 400: INVALID PALYLIST OWNER ID");
      return;     
   }
   const updatedData = {
      $set: {
         title: playlistData.title,
         description: playlistData.description,
         tags:playlistData.tags,
         private: playlistData.private,
      }
   };
   try {
      const collection = await dbPlaylistCollection();
      const filter = {
         _id: new ObjectId(playlistID),
         owner_id: new ObjectId(playlistData.owner_id)
      };
      const result = await collection.updateOne(filter, updatedData);
      if (result.modifiedCount === 1) {
         res.status(200).send();
         utils.log("[PLAYLIST]> updatePlaylist > SUCCESS: PLAYLIST "+playlistID+" CREATED");
         return; 
      } else {
         res.status(404).send("Playlist not found");
         utils.log("[PLAYLIST]> updatePlaylist > ERROR 404: PLAYLIST NOT FOUND");
         return; 
      }
   } catch (error) {
      res.status(500).send("Internal Error");
      utils.log("[PLAYLIST]> updatePlaylist > ERROR 500: INTERNAL ERROR");
      return; 
   }

}

// OWNER_ID IS EXPECTED TO ALREADY BE ON OBJ
export async function deleteUserPlaylists(owner_id){
   if (owner_id === undefined)return false;
   try {
      var playlistCollection = await dbPlaylistCollection();
      const playlist = await playlistCollection.deleteMany({ owner_id: owner_id});
      if (!playlist) {
         return false
      }
      return true
   } catch (e) {
      return false;
   }
}
