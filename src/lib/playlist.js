/* Playlist & Tracks lib functions to manage User */

// import crypto from "crypto";
import { config, mongodb } from "./../config/prefs.js";
import { Db } from "./database.js";
import { ObjectId } from "mongodb";
import {songExistsInPlaylist} from "./utils.js"
// import { getTrack } from "./spotify/fetch.js";
export const dbPlaylistCollection = () => Db('playlists');


/**
 * Retrieves all public playlists
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
         .toArray();
      res.send(playlists);
   } catch (error) {
      res.status(500).send(`Error while fetching playlists: ${error.message}`);
   }
}

/**
 * Retrieves playlists associated with a given owner_id and sends them in the response.
 * @param {Object} res - The response object used to send the playlists.
 * @param {string} owner_id - The ID of the owner whose playlists need to be fetched.
 */
export async function getUserPlaylists(res, owner_id) {
   try {
      const collection = await dbPlaylistCollection();
      const playlists = await collection
         .find({ owner_id: new ObjectId(owner_id) })
         .project({})
         .toArray();
      res.send(playlists);
   } catch (error) {
      res.status(500).send(`Error while fetching playlists: ${error.message}`);
   }
}

/**
 * Async function to add song to playlist
 *
 * @param {object} req - request, containing track object and playlist_id
 * @param {object} res - response passed from express
 */
export async function addSongToPlaylist(res, playlistID,songData) {
   console.log(songData);
   if (
      songData.id === undefined ||
         songData.title === undefined ||
         songData.artist === undefined ||
         songData.duration === undefined ||
         songData.year === undefined ||
         songData.album === undefined
   ) {
      res.status(400).send('Missing one or more required fields');
      console.log(`[PLAYLIST] >> ERROR 400 WHILE ATTEMPTING TO CREATE PLAYLIST:`);
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
      const exists=await songExistsInPlaylist(collection,playlistID, songData);
      if (exists){
         res.status(400).send('EXISTS');
         console.log(`[PLAYLIST] >> ERROR 400 WHILE ATTEMPTING TO CREATE PLAYLIST: SONG ALREADY EXISTS`);
         return;
      }
      let playlists = await collection.updateOne(filter, updateDoc);
      console.log(`[PLAYLIST] >> USER ${songData.owner_id} ADDED SONG ${songData.id} TO PLAYLIST ${songData.playlistID} `);
      res.status(200).send("OK");
   } catch (e) {
      res.status(500).send(`Generic error: ${e}`)
      console.log(`[PLAYLIST] >> ERROR 500 WHILE ATTEMPTING TO CREATE PLAYLIST:`+e);
   }
}

/**
 * Async function to remove song from playlist
 *
 * @param mongoClient - client mongo passed to avoid import of module
 * @param res - response passed from express
 * @param playlist_id - id of the playlist to be updated with new song
 * @param track_id - id of the track to be removed to the playlist
 */
export async function removeSongFromPlaylist(res, playlist_id, track_id, owner_id) {
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
         res.status(500).send("An error occurred, please try again later");
         console.log(`[PLAYLIST] >> ERROR 500 WHILE ATTEMPTING TO REMOVE SONG:`)

      }
   } catch (e) {
      res.status(500).send(`Generic Error: ${e}`);
      console.log(`[PLAYLIST] >> ERROR 500 WHILE ATTEMPTING TO REMOVE SONG: ${e}`)

   }

}

/**
 * Creates a new playlist in the database.
 *
 * @param {Object} res - The HTTP response object to send the response.
 * @param {Object} playlist - The playlist object containing title, description, tags, songs, and owner_id.
 * @returns {Promise} A promise representing the process of creating the playlist.
 *
 * @throws {Error} If an error occurs during playlist creation or response, an exception is thrown.
 */
export async function createplaylist(res, playlist) {
   if (
      playlist.title === undefined ||
         playlist.description === undefined ||
         playlist.tags === undefined ||
         playlist.songs === undefined ||
         playlist.owner_id === undefined
   ) {
      res.status(400).send('Missing one or more required fields');
      console.log(`[PLAYLIST] >> ERROR 400 WHILE ATTEMPTING TO CREATE PLAYLIST:`)
      return;
   }
   try {
      var playlistCollection = await dbPlaylistCollection();
      playlist.owner_id = new ObjectId(playlist.owner_id);
      await playlistCollection.insertOne(playlist); // Changed userCollection to playlistCollection

      // Risposta affermativa con uno status 200 per evitare oggetti circolari
      res.status(200).send();
      console.log("[", playlist.owner_id, "]Playlist Created");
   } catch (e) {
      if (e.code === 11000) {
         res.status(400).send("An error occurred!");
         console.log(`[PLAYLIST] >> ERROR 400 WHILE ATTEMPTING TO CREATE PLAYLIST: ${e}`)
         return;
      }
      res.status(500).send(`Generic Error: ${e}`);
      console.log(`[PLAYLIST] >> ERROR 500 WHILE ATTEMPTING TO CREATE PLAYLIST: ${e}`)

   }
}

/**
 * Deletes a playlist from the database.
 *
 * @param {Object} res - The HTTP response object to send the response.
 * @param {string} playlistID - The ID of the playlist to delete.
 * @param {string} ownerID - The ID of the owner of the playlist.
 * @returns {Promise} A promise representing the process of deleting the playlist.
 *
 * @throws {Error} If an error occurs during playlist deletion or response, an exception is thrown.
 */

export async function deletePlaylist(res, playlistID, ownerID) {
   playlistID = new ObjectId(playlistID);
   if (
      playlistID === undefined ||
         ownerID === undefined
   ) {
      res.status(400).send('Missing one or more required fields');
      console.log(`[PLAYLIST] >> ERROR 400 WHILE ATTEMPTING TO DELETE PLAYLIST ${playlistID}`)
      return;
   }


   try {
      var playlistCollection = await dbPlaylistCollection();
      const playlist = await playlistCollection.findOne({ _id: playlistID, owner_id: new ObjectId(ownerID) });
      if (!playlist) {
         res.status(404).send('Playlist not found or not owned by the specified user.');
         console.log(`[PLAYLIST] >> ERROR 404 WHILE ATTEMPTING TO DELETE PLAYLIST ${playlistID}`)

         return;
      }
      await playlistCollection.deleteOne({ _id: playlistID });
      res.status(200).send('Playlist deleted');
      console.log(`[PLAYLIST] >> USER ${ownerID} SUCCESFULLY DELETED PLAYLIST ${playlistID}`)
   } catch (e) {
      console.error("Error deleting playlist:", e);
      res.status(500).send('Internal Server Error');
      console.log(`[PLAYLIST] >> ERROR 500 WHILE TRYING TO DELETE PLAYLIST ${e}`)

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
 * Fetches a specific playlist from a database and responds with it as JSON.
 *
 * @param {Object} res - The HTTP response object to send the response.
 * @param {string} playlistid - The ID of the playlist to retrieve.
 * @returns {Promise} A promise representing the process of fetching and responding with the playlist.
 *
 * @throws {Error} If an error occurs during playlist retrieval or response, an exception is thrown.
 */
export async function getPlaylistFromId(res, playlistid) {
   try {
      const collection = await dbPlaylistCollection();
      const playlist = await collection.findOne({ _id: new ObjectId(playlistid) });
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
 * Updates a playlist's information in the database.
 *
 * @param {Response} res - The HTTP response object for sending a response to the client.
 * @param {string} playlistID - The unique identifier of the playlist to be updated.
 * @param {object} playlistData - An object containing the updated playlist information.
 * @param {string} playlistData.title - The new title for the playlist.
 * @param {string} playlistData.description - The updated description for the playlist.
 * @param {string[]} playlistData.tags - An array of tags associated with the playlist.
 * @param {boolean} playlistData.private - A boolean indicating whether the playlist should be private.
 * @param {string} playlistData.owner_id - The unique identifier of the owner of the playlist.
 * @throws {Error} Throws an error if any required field is missing.
 * @returns {Promise} A Promise that resolves once the playlist is updated or rejects if an error occurs.
 */

export async function updatePlaylist(res, playlistID, playlistData) {
   console.log(playlistID);
   console.log(playlistData);
   if (
      playlistData.title === undefined ||
         playlistData.description === undefined ||
         playlistData.tags === undefined ||
         playlistData.owner_id === undefined
   ) {
      res.status(400).send('Missing one or more required fields');
      console.log(`[PLAYLIST] >> ERROR 400 WHILE ATTEMPTING TO UPDATE PLAYLIST:`)
      return;
   }
   const updatedData = {
      $set: {
         title: playlistData.title,
         description: playlistData.description,
         tags: playlistData.tags,
         private: playlistData.private
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
         res.status(200).send("Playlist updated successfully");
         console.log(`[PLAYLIST] >> Playlist ${playlistID} updated`);
      } else {
         res.status(404).send("Playlist not found or not owned by the specified user.");
         console.log(`[PLAYLIST] >> ERROR 404 WHILE ATTEMPTING TO UPDATE PLAYLIST ${playlistID}`);
      }
   } catch (error) {
      console.error(`[PLAYLIST] >> Error while updating playlist: ${error}`);
      res.status(500).send(`Internal Server Error`);
   }

}
