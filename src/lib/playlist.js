/* Playlist & Tracks lib functions to manage User */

import crypto from "crypto";
import { config, mongodb } from "./../config/prefs.js";
import { Db } from "./database.js";
import { ObjectId } from "mongodb";
import { getTrack } from "./spotify/fetch.js";
export const dbPlaylistCollection = () => Db('playlists');

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
export async function addSongToPlaylist(req, res) {
  // req.body contains an object like this { "tid": track_id, "pid": playlist_id }
  let { track, pid } = req.body;

  try {
    let filterPlaylist = { _id: new ObjectId(pid) }

    let pushNewSong = {
      $push: {
        songs: [{
          id: track.id,
          title: track.name,
          artist: track.artists[0].name,
          duration: track.duration_ms,
          year: track.album.release_date,
          album: track.album.name
        }]
      },
    }

    let collection = await dbPlaylistCollection().updateOne(filterPlaylist, pushNewSong, { upsert: true });

    console.log(collection);
    res.send(collection);
  } catch (e) {
    res.status(500).send(`Generic error: ${e}`)
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

    // Construct the filter to find the specific playlist to update
    const filter = {
      _id: new ObjectId(playlistID), // Assuming playlistID is the ID of the playlist to update
      owner_id: new ObjectId(playlistData.owner_id) // Assuming owner_id is the owner of the playlist
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
