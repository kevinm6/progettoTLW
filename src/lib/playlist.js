/* Playlist & Tracks lib functions to manage User */

import crypto from "crypto";
import { config, mongodb } from "./../config/prefs.js";
import { Db } from "./database.js";
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
      .find({ owner_id })
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
 * @param mongoClient - client mongo passed to avoid import of module
 * @param res - response passed from express
 * @param playlist_id - id of the playlist to be updated with new song
 * @param track_id - id of the track to be added to the playlist
 */
export async function addSongToPlaylist(mongoClient, res, playlist_id, track_id) {
  try {

    var filter = { playlist_id: new ObjectId(playlist_id) }

    var favorite = {
      $push: { tracks_ids: track_id },
    }

    console.log(filter)
    console.log(favorite)

    var item = await mongoClient
      .db(mongodb.dbName)
      .collection(mongodb.collections.playlists)
      .updateOne(filter, favorite)

    res.send(item)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }
}

/**
 * Async function to remove song from playlist
 *
 * @param mongoClient - client mongo passed to avoid import of module
 * @param res - response passed from express
 * @param playlist_id - id of the playlist to be updated with new song
 * @param track_id - id of the track to be added to the playlist
 */
export async function removeSongFromPlaylist(mongoClient, res, playlist_id, track_id) {
  try {
    var filter = { playlist_id: new ObjectId(playlist_id) }

    var favorite = {
      $pull: { tracks_ids: track_id },
    }

    console.log(filter)
    console.log(favorite)

    var item = await mongoClient
      .db(mongodb.dbName)
      .collection(mongodb.collections.playlists)
      .updateOne(filter, favorite)
    res.send(item)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }
}

export async function createplaylist(res, playlist) {
  if (playlist.title === undefined) {
    res.status(400).send('Missing playlist title');
    return;
  }
  if (playlist.description === undefined) {
    res.status(400).send('Missing playlist description');
    return;
  }
  if (playlist.tags === undefined) {
    res.status(400).send('Missing playlist tags');
    return;
  }
  if (playlist.songs === undefined) {
    res.status(400).send('Missing playlist songs');
    return;
  }
  if (playlist.owner_id === undefined) {
    res.status(400).send('Missing playlist owner');
    return;
  }

  try {
    var playlistCollection = await dbPlaylistCollection();

    await playlistCollection.insertOne(playlist); // Changed userCollection to playlistCollection

    // Risposta affermativa con uno status 200 per evitare oggetti circolari
    res.status(200).send();
    console.log("[",playlist.owner_id,"]Playlist Created");
  } catch (e) {
    if (e.code === 11000) {
      res.status(400).send("An error occurred!");
      return;
    }
    res.status(500).send(`Generic Error: ${e}`);
  }
}
